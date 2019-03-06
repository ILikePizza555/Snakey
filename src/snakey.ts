import {Observable} from 'rxjs';
import * as rxop from 'rxjs/operators';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {Url} from 'url';
import {matchRegex, matchPathPattern} from './url-params';

/**
 * Consumes a server response to send out data to the client.
 */
interface Responder {
  (res: ServerResponse) : void;
}

interface TransObservable<T1, T2> {
  (o: Observable<T1>): Observable<T2>; 
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