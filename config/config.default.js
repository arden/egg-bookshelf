'use strict';

/**
 * bookshelf default config
 * @member Config#bookshelf
 * @property {String} SOME_KEY - some description
 */
exports.bookshelf = {
  knex: {
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
  },
  egg: {
    modelDir: 'app/model', // specify model dir path
    modelAccessName: 'model', // custom model access path, default `app.model`
  },
};
