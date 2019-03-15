/* eslint require-jsdoc: 0 */
const {dest, src, series} = require('gulp');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');
const clean = require('gulp-clean');

const tsProject = ts.createProject('tsconfig.json');

const LIB_DEST = 'dist';

function cleanLib() {
  return src(LIB_DEST, {read: false})
      .pipe(clean());
}

function buildLib() {
  return tsProject.src()
      .pipe(tsProject())
      .pipe(dest(LIB_DEST));
}

function runUnitTests() {
  return src('test/*.test.ts', {read: false})
      .pipe(mocha({
        reporter: 'nyan',
        require: 'ts-node/register',
      }));
}

exports.clean = cleanLib;
exports.buildLib = series(cleanLib, buildLib);
exports.buildNoClean = buildLib;
exports.runUnitTests = runUnitTests;
