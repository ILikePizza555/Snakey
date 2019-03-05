const http = require('http');
const rx = require('rxjs');
const rxop = require('rxjs/operators');
const url = require('url');
const {matchRegex, matchPathPattern} = require('./url-params');

class Response {
  /**
   * Creates a new Response object
   * @param {http.ServerResponse} res 
   */
  constructor(res) {
    this.res = res;

    this.code = 400;
    this.headers = {};
    this.body = null;
  }

  headersSent() {
    return this.res.headersSent;
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

    this.rawUrl = req.url;
    this.url = new url.URL(req.url);

    this.res = res;
  }

  makeResponse() {
    return new Response(this.res);
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
      rxop.map((v) => {
        if (pathPattern instanceof RegExp) {
          return {...v, 'match': matchRegex(v.url.pathname, pathPattern)};
        } else {
          return {...v, 'match': matchPathPattern(v.url.pathname, pathPattern)};
        }
      }),
      rxop.filter((v) => Boolean(v.match))
  );
}

/**
 * Creates a new http.Server with an Observable bound to the request event,
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
