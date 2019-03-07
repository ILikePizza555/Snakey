/* eslint require-jsdoc: 0 */
const {series, dest} = require('gulp');
const {createProject} = require('gulp-typescript');

const tsProject = createProject('tsconfig.json');

function buildLib() {
  return tsProject.src()
      .pipe(tsProject())
      .js
      .pipe(dest('build'));
}

exports.buildLib = buildLib;
