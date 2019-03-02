const http = require('http');
const rx = require('rxjs');
const rxop = require('rxjs/operators');
const url = require('url');

/**
 * Extention of the Node.JS URL class.
 */
class ParameterizedUrl extends url.URL {
  /**
   * Creates a new ParameterizedURL
   * @param {String} input The absolute or relative URL to parse.
   * @param {String|url.URL} [base] The base URL to resolve against if the input is not absolute.
   */
  constructor(input, base) {
    super(input, base);
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

module.exports = Snakey;

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
