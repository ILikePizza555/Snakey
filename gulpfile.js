/* eslint require-jsdoc: 0 */
const {dest, src} = require('gulp');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');

const tsProject = ts.createProject('tsconfig.json');

const LIB_DEST = 'dist';

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
