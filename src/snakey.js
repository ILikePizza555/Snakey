const http = require('http');
const rx = require('rxjs');
const rxop = require('rxjs/operators');
const url = require('url');


/**
 * Context object that requests are turned into.
 */
class Context extends http.ClientRequest {
  /**
   * Creates a new Context object
   * @param {http.ClientRequest} req
   * @param {http.ServerResponse} res
   */
  constructor(req, res) {
    super(req);
    this.res = res;

    this.url = url.parse(this.url);
  }
}

/**
 * Creates a new Observable by filtering the method and the url
 * @param {rx.Observable} obs
 * @param {String} verb
 * @param {String} url
 * @return {rx.Observable}
 */
function bite(obs, verb, url) {
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
