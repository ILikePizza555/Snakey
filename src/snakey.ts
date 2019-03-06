import {Observable, Observer, fromEvent} from 'rxjs';
import * as rxop from 'rxjs/operators';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {Url} from 'url';
import {matchRegex, matchPathPattern} from './url-params';

/**
 * Function interface that consumes a ServerResponse to send data to the client.
 */
interface Responder {
  (res: ServerResponse) : void;
}

/**
 * Function interface that converts one type of Observable to another.
 */
interface TransObservable<T1, T2> {
  (o: Observable<T1>): Observable<T2>; 
}

/**
 * Observer for a stream of Responder.
 */
class ResponderObserver implements Observer<Responder> {
  next(res): void {
    res();
  }

  error(err): void {
    console.error(err);
  }
  complete(): void {}
}

class Context {
  readonly request: IncomingMessage;
  readonly response: ServerResponse;

  constructor(request: IncomingMessage, response: ServerResponse) {
    this.request = request;
    this.response = response;
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

function snake(server: Server, tf: TransObservable<Context, Responder>, observer: ResponderObserver = new ResponderObserver()) {
  const obs = fromEvent<[IncomingMessage, ServerResponse]>(server, 'request')
    .pipe(
      rxop.map(([req, res]) => new Context(req, res))
    );
  
  return tf(obs).subscribe(observer);
}

module.exports = {
  'bite': bite,
  'snake': snake,
  'Context': Context,
  'Response': Response,
};