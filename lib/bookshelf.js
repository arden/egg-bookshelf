'use strict';

const path = require('path');
const Knex = require('knex');
const Bookshelf = require('bookshelf');
const MODELS = Symbol('bookshelfModels');
const chalk = require('chalk');

module.exports = app => {
  const defaultConfig = {
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'test',
      charset: 'utf8mb4',
    },
    pool: {
      min: 5,
      max: 10,
    },
    debug: false,
  };
  const config = Object.assign(defaultConfig, app.config.bookshelf);

  let knex = Knex(config);
  let bookshelf = Bookshelf(knex);
  app.knex = knex;
  app.bookshelf = bookshelf;

  bookshelf.plugin('registry');
  bookshelf.plugin('virtuals');
  bookshelf.plugin('visibility');
  bookshelf.plugin('pagination');

  // app.bookshelf
  Object.defineProperty(app, 'model', {
    value: bookshelf,
    writable: true,
    configurable: true,
  });

  loadModel(app);

  app.beforeStart(function* () {

  });
};

function loadModel(app) {
  const modelDir = path.join(app.baseDir, 'app/model');
  app.loader.loadToApp(modelDir, MODELS, {
    inject: app,
    caseStyle: 'upper',
    ignore: 'index.js',
  });

  for (const name of Object.keys(app[MODELS])) {
    app.model[name] = app[MODELS][name];
  }

  for (const name of Object.keys(app.model)) {
    //const instance = app.model[name];
    // only this Bookshelf Model class
  }
}
