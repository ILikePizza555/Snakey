const pathToRegexp = require('path-to-regexp');

/**
 * Matches the pathname against the provided RegExp.
 *
 * Returns a match object on success. Otherwise return null.
 * @param {String} pathname
 * @param {RegExp} regex
 * @return {RegExpExecArray?}
 */
function matchRegex(pathname, regex) {
  if (!(regex instanceof RegExp)) {
    throw new TypeError('regex should be a Regex object.');
  }

  return pathname.match(regex);
}

/**
   * Matches the URL pathname against a string pattern
   * using path-to-regexp.
   *
   * @param {string} pathname
   * @param {string} pattern
   * @return {Object?}
   */
function matchPathPattern(pathname, pattern) {
  const keys = [];
  const regex = pathToRegexp(pattern, keys);
  const execResult = regex.exec(pathname);

  if (execResult === null) {
    return null;
  }

  return {
    path: pathname,
    fullMatch: execResult.shift().replace(/^\/+|\/+$/g, ''),
    params: keys
        .map((v, i) => ({...v, 'group': execResult[i]}))
        .map((v) => v.group ? {...v, 'paramValue': v.group.split(v.delimiter)} : v)
        .reduce((acc, cur) => {
          acc[cur.name] = cur.paramValue;
          return acc;
        }, {})};
}

module.exports = {
  matchRegex: matchRegex,
  matchPathPattern: matchPathPattern,
};
