'use strict';

const path = require('path');
const Knex = require('knex');
const Bookshelf = require('bookshelf');
const MODELS = Symbol('bookshelfModels');
const chalk = require('chalk');
const defaultConfig = require('../config/config.default');
const mask = require('bookshelf-mask');
const modelbase = require('bookshelf-modelbase').pluggable;

module.exports = app => {
  const config = Object.assign(defaultConfig.bookshelf, app.config.bookshelf);

  let knex = Knex(config.knex);
  let bookshelf = Bookshelf(knex);
  app.knex = knex;
  app.bookshelf = bookshelf;

  bookshelf.plugin('registry');
  bookshelf.plugin('virtuals');
  bookshelf.plugin('visibility');
  bookshelf.plugin('pagination');
  bookshelf.plugin(mask);
  bookshelf.plugin(modelbase);

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
