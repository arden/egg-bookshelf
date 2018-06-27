# egg-bookshelf

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bookshelf.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bookshelf
[travis-image]: https://img.shields.io/travis/eggjs/egg-bookshelf.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-bookshelf
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-bookshelf.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-bookshelf?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-bookshelf.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-bookshelf
[snyk-image]: https://snyk.io/test/npm/egg-bookshelf/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bookshelf
[download-image]: https://img.shields.io/npm/dm/egg-bookshelf.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bookshelf

<!--
Description here.
-->

## Install

```bash
$ npm i egg-bookshelf --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.bookshelf = {
  enable: true,
  package: 'egg-bookshelf',
};
```

### Transaction

`egg-knex` support manual/auto commit.

#### Manual commit

```js
const trx = yield app.knex.transaction();
try {
  yield trx.insert(row1).into('table');
  yield trx('table').update(row2);
  yield trx.commit()
} catch (e) {
  yield trx.rollback();
  throw e;
}
```

#### Auto commit

```js
const result = yield app.knex.transaction(function* transacting (trx) {
  yield trx(table).insert(row1);
  yield trx(table).update(row2).where(condition);
  return { success: true };
});
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.bookshelf = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
