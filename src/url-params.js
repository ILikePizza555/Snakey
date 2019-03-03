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
 * The type returned by matchPathPattern.
 *
 * The params object normally maps strings to strings. However, in the case of repeatable
 * parameters, the value will be an array of strings. Optiional parameters may be
 * `undefined`. Finally, regex groups are assigned numeric names.
 *
 * @typedef {Object} PathMatch
 * @property {string} path - The pathname matched against
 * @property {string} fullMatch - The full match against the pathname
 * @property {Object} params - A map of parameter names to the values.
 */

/**
   * Matches the URL pathname against a string pattern using path-to-regexp.
   *
   * @param {string} pathname
   * @param {string} pattern
   * @return {PathMatch?}
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
          if (cur.paramValue && cur.paramValue.length == 1) {
            acc[cur.name] = cur.paramValue[0];
          } else {
            acc[cur.name] = cur.paramValue;
          }
          return acc;
        }, {})};
}

module.exports = {
  matchRegex: matchRegex,
  matchPathPattern: matchPathPattern,
};
