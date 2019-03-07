import {Observable, Observer, fromEvent} from 'rxjs';
import * as rxop from 'rxjs/operators';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {matchRegex, matchPathPattern, PathMatch} from './url-params';
import {parse, URIComponents} from 'uri-js';

export type PathPattern = string | RegExp;

/**
 * Function interface that consumes a ServerResponse to send data to the client.
 */
export interface Responder {
  (res: ServerResponse) : void;
}

/**
 * Function interface that converts one type of Observable to another.
 */
export interface TransObservable<T1, T2> {
  (o: Observable<T1>): Observable<T2>; 
}

/**
 * Observer for a stream of Responder.
 */
export class ResponderObserver implements Observer<Responder> {
  next(res): void {
    res();
  }

  error(err): void {
    console.error(err);
  }
  complete(): void {}
}

export class Context {
  readonly uri: URIComponents;

  constructor(readonly request: IncomingMessage, 
              readonly response: ServerResponse,
              uri?: URIComponents,
              readonly PathMatch: PathMatch | RegExpExecArray | null = null) {
    this.uri = uri || parse(request.url);
  }

  get method(): string {
    return this.request.method;
  }

  match(pattern: PathPattern) {
    if (typeof pattern === 'string') {
      return new Context(this.request, this.response, this.uri, matchPathPattern(this.uri.path, pattern));
    } else {
      return new Context(this.request, this.response, this.uri, matchRegex(this.uri.path, pattern));
    }
  }
}


export function bite(obs: Observable<Context>, verb: string, pathPattern: PathPattern) {
  return obs.pipe(
      rxop.filter((v) => v.method === verb),
      rxop.map((v) => v.match(pathPattern)),
      rxop.filter((v) => Boolean(v.match))
  );
}

export function snake(server: Server, tf: TransObservable<Context, Responder>, observer: ResponderObserver = new ResponderObserver()) {
  const obs = fromEvent<[IncomingMessage, ServerResponse]>(server, 'request')
    .pipe(
      rxop.map(([req, res]) => new Context(req, res))
    );
  
  return tf(obs).subscribe(observer);
}