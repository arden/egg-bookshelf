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

module.exports = app => {
  const config = Object.assign(defaultConfig.bookshelf, app.config.bookshelf);

  let knex = Knex(config.knex);
  let bookshelf = Bookshelf(knex);
  app.knex = knex;
  app.bookshelf = bookshelf;

  let plugins = config.egg.plugins;
  for (let plugin in plugins) {
    bookshelf.plugin(plugin);
  }
  // bookshelf.plugin('registry');
  // bookshelf.plugin('virtuals');
  // bookshelf.plugin('visibility');
  // bookshelf.plugin('pagination');
  // bookshelf.plugin('processor');

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
