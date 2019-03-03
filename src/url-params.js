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
  const result = regex.exec(pathname);

  if (result === null) {
    return null;
  }
  return keys
      .map((v, i) => Object.assign({}, v, {'group': result[i + 1]}))
      .map((v) => {
        if (!v.group) {return v;}
        const result = {
          'result': v.repeat ?
                    result.result = v.group.match(new RegExp(v.pattern, 'g')) :
                    result.result = v.group.match(v.pattern)[0]};
        return Object.assign({}, v, result);
      })
      .reduce((acc, cur) => {
        acc[cur.name] = cur.result;
        return acc;
      }, {});
}

module.exports = {
  matchRegex: matchRegex,
  matchPathPattern: matchPathPattern,
};