import {Observable} from 'rxjs';
import * as rxop from 'rxjs/operators';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {Url} from 'url';
import {matchRegex, matchPathPattern} from './url-params';


/**
 * Immutable object that implements the Response interface.
 */
class Response {
  /**
   * Creates a new Response object
   * @param {http.ServerResponse} res
   * @param {Number} [code] HTTP status code
   * @param {Object} [headers] HTTP headers
   * @param {String?} [body] HTTP body
   */
  constructor(res, code = 400, headers = {}, body = null) {
    this.res = res;

    this.code = code;
    this.headers = headers;
    this.body = body;
  }

  /**
   * Returns a new response with a status of `code`.
   * @param {Number} code
   * @return {Response}
   */
  status(code) {
    return new Response(this.res, code, this.headers, this.body);
  }

  /**
   * Returns a new Response with the header appended
   * @param {String} field
   * @param {String} [value]
   * @return {Response}
   */
  append(field, value='') {
    const h = this.headers;
    h[field] = value;
    return new Response(this.res, this.code, h, this.body);
  }

  /**
   * Returns a new Response with the body.
   * @param {String} body
   * @return {Response}
   */
  setBody(body) {
    return new Response(this.res, this.code, this.headers, body);
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

  /**
   * Returns a new Response object
   * @return {Response}
   */
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
  const obs = rx.fromEvent(server, 'request')
      .pipe(rxop.map((x) => new Context(...x)));

  f(obs).subscribe((x) => {
    /** @type {http.ServerResponse} */
    const res = x.res;

    res.statusCode = x.code;

    for (const key of Object.keys(x.headers)) {
      res.setHeader(key, x.headers[key]);
    }

    res.write(x.body);
  });

  return server;
}

module.exports = {
  'bite': bite,
  'snake': snake,
  'Context': Context,
  'Response': Response,
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
