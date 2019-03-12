/* eslint require-jsdoc: 0 */
const {series, dest, src} = require('gulp');
const ts = require('gulp-typescript');
const path = require('path');
const mocha = require('gulp-mocha');

const tsProject = ts.createProject('tsconfig.json');

const LIB_DEST = 'dist/lib';
const TEST_DEST = 'dist/test';

function buildLib() {
  return tsProject.src()
      .pipe(tsProject())
      .js
      .pipe(dest(LIB_DEST));
}

function buildTest() {
  return src('./test/*.test.ts')
      .pipe(ts())
      .js
      .pipe(dest(TEST_DEST));
}

function runUnitTests() {
  return src(path.join(TEST_DEST, '*.js'))
      .pipe(mocha({reporter: 'nyan'}));
}

exports.buildLib = buildLib;
exports.buildTest = buildTest;
exports.runTests = series(buildTest, runUnitTests);
