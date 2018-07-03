'use strict';

const path = require('path');
const Knex = require('knex');
const Bookshelf = require('bookshelf');
const MODELS = Symbol('bookshelfModels');
const chalk = require('chalk');
const defaultConfig = require('../config/config.default');
const mask = require('bookshelf-mask');
const modelbase = require('bookshelf-modelbase').pluggable;
const moment = require('moment');
const _ = require('lodash');

function isGenerator (fn) {
  return Object.prototype.toString.call(fn) === '[object GeneratorFunction]';
}

function promisifyTransaction (client) {
  const proto = Reflect.getPrototypeOf(client.client);

  if (proto._promisify_transaction) {
    return;
  }

  proto._promisify_transaction = true;

  proto._raw_transaction = proto.transaction;

  proto.transaction = function (...args) {
    if (typeof args[0] === 'function') {
      if (isGenerator(args[0])) args[0] = co.wrap(args[0]);
      return proto._raw_transaction.apply(this, args);
    }
    let config;
    let outTx;
    if (args.length > 0) outTx = args.pop();
    if (args.length > 0) config = args.pop();

    return new Promise(resolve => {
      const transaction = proto._raw_transaction.apply(this, [
        function _container (trx) {
          resolve(trx);
        },
        config,
        outTx,
      ]);

    transaction.rollback = function (conn, error) {
      return this.query(conn, 'ROLLBACK', error ? 2 : 1, error)
        .timeout(5000)
        .catch(Promise.TimeoutError, () => {
        this._resolver();
    });
    };

    transaction.rollbackTo = function (conn, error) {
      return this.query(conn, `ROLLBACK TO SAVEPOINT ${this.txid}`, error ? 2 : 1, error)
        .timeout(5000)
        .catch(Promise.TimeoutError, () => {
        this._resolver();
    });
    };
  });
  };
}

module.exports = app => {
  app.bookshelfLogger = app.getLogger('bookshelf') || app.logger;

  app.bookshelfLogger.info(`[egg-bookshelf] start init...`);

  const config = Object.assign(defaultConfig.bookshelf, app.config.bookshelf);

  let knex = Knex(config.knex);
  try {
    promisifyTransaction(knex);
  } catch (error) {
    app.bookshelfLogger.error(error);
  }
  let bookshelf = Bookshelf(knex);
  app.knex = knex;
  app.bookshelf = bookshelf;

  let plugins = config.egg.plugins;

  if (plugins && plugins.length > 0) {
    for (let plugin of plugins) {
      bookshelf.plugin(plugin);
    }
  } else {
    bookshelf.plugin('registry');
    bookshelf.plugin('virtuals');
    bookshelf.plugin('visibility');
    bookshelf.plugin('pagination');
    bookshelf.plugin('processor');
  }

  bookshelf.plugin(mask);
  bookshelf.plugin(modelbase);

  bookshelf.Model = bookshelf.Model.extend({
    parseDates: function fixDates(attrs) {
      _.each(attrs, function each(value, key) {
        if (value !== null && (key === 'created_at' || key === 'updated_at')) {
          attrs[key] = moment(value).format('YYYY-MM-DD HH:mm:ss');
        }
      });
      return attrs;
    },

    // 保存到数据库之前
    format: function format(attrs) {
      return attrs;
    },

    // 从数据库取出之后
    parse: function parse(attrs) {
      return this.parseDates(attrs);
    },

  });

  // app.bookshelf
  Object.defineProperty(app, config.egg.modelAccessName, {
    value: bookshelf,
    writable: true,
    configurable: true,
  });

  loadModel(app, config);

  app.beforeStart(function* () {

  });

  app.bookshelfLogger.info(`[egg-bookshelf] init success...`);
};

function loadModel(app, config) {
  const modelDir = path.join(app.baseDir, config.egg.modelDir);
  app.loader.loadToApp(modelDir, MODELS, {
    inject: app,
    caseStyle: 'upper',
    ignore: 'index.js',
  });

  for (const name of Object.keys(app[MODELS])) {
    app[config.egg.modelAccessName][name] = app[MODELS][name];
  }

  for (const name of Object.keys(app[config.egg.modelAccessName])) {
    //const instance = app[config.egg.modelAccessName][name];
    // only this Bookshelf Model class
  }
}
