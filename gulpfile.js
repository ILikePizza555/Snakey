/* eslint require-jsdoc: 0 */
const {series, dest, src} = require('gulp');
const ts = require('gulp-typescript');
const path = require('path');
const mocha = require('gulp-mocha');
const gClean = require('gulp-clean');

const tsProject = ts.createProject('tsconfig.json');

const LIB_DEST = 'dist/lib';
const TEST_DEST = 'dist/test';

function buildLib() {
  return tsProject.src()
      .pipe(tsProject())
      .js
      .pipe(dest(LIB_DEST));
}

function runUnitTests() {
  return src('test/*.test.ts', {read: false})
      .pipe(mocha({
        reporter: 'nyan',
        require: 'ts-node/register',
      }));
}

exports.buildLib = buildLib;
exports.runUnitTests = runUnitTests;
