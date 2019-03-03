const http = require('http');
const rx = require('rxjs');
const rxop = require('rxjs/operators');
const url = require('url');
const pathToRegexp = require('path-to-regexp');

/**
 * Extention of the Node.JS URL class.
 */
class ParameterizedUrl extends url.URL {
  /**
   * Creates a new ParameterizedURL
   * @param {String} input The absolute or relative URL to parse.
   * @param {String|url.URL} [base] The base URL to resolve against if the input is not absolute.
   * @param {Object} [params]
   */
  constructor(input, base) {
    super(input, base);
    this.params = null;
  }

  /**
   * Matches the URL pathname against a regex pattern.
   *
   * If the match succeedes, the `params` property is set,
   * and the function returns true. Otherwise, false is returned.
   * @param {RegExp} regex
   * @return {boolean}
   */
  matchRegex(regex) {
    if (!(regex instanceof RegExp)) {
      throw new TypeError('regex should be a Regex object.');
    }

    const result = regex.exec(this.pathname);
    this.params = result;
    return Boolean(result);
  }

  /**
   * Matches the URL pathname against a string pattern
   * using path-to-regexp.
   *
   * @param {string} pattern
   * @return {boolean}
   */
  matchString(pattern) {
    const keys = [];
    // TODO: Move converstion outside of function, since this will be called on *every* request
    const regex = pathToRegexp(pattern, keys);
    const result = regex.exec(this.pathname);

    if (result !== null) {
      this.params = keys
          .map((v, i) => {v.group = result[i+1]; return v;})
          .map((v) => {
            v.result = v.group.match(new RegExp(v.pattern, v.repeat ? 'g' : ''));
            return v;
          })
          .reduce((acc, cur) => {
            acc[cur.name] = cur.result;
            return acc;
          }, {});
    }

    return Boolean(result);
  }
}

/**
 * Context object that requests are turned into.
 * This class shouldn't be created by the user.
 * @extends http.IncomingMessage
 */
class Context extends http.IncomingMessage {
  /**
   * Creates a new Context object
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  constructor(req, res) {
    super(req);

    /** @memberof Context */
    this.rawUrl = req.url;
    /** @memberof Context */
    this.url = new ParameterizedUrl(req.url);

    this._res = res;
  }
}

/**
 * Creates a new Observable by filtering the method and the url
 * @param {rx.Observable} obs
 * @param {String} verb
 * @param {String|RegExp} pathPattern
 * @return {rx.Observable}
 */
function bite(obs, verb, pathPattern) {
  return obs.pipe(
      rxop.filter((v) => v.method === verb),
      rxop.filter((v) => v.url === url)
  );
}

/**
 * Creates a new http.Server with an Observable tied to the request event,
 * applies the transformation f to the observable,
 * then subscribes to the result to deliver it to the client.
 *
 * Returns the instance of http.Server.
 * @param {TransObservable} f
 * @return {http.Server}
 */
function snake(f) {
  const server = new http.Server();
  const obs = rx.fromEvent(server, 'request');

  return server;
}

module.exports = {
  bite: bite,
  snake: snake,
  ParameterizedURL: ParameterizedUrl,
};

/**
 * @callback ObservableMap
 * @param {*} v
 * @return {rx.Observable}
 */

/**
 * 🦄💙💗
 * @callback TransObservable
 * @param {rx.Observable}
 * @return {rx.Observable}
 */
