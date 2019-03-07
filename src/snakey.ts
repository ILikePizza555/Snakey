import {Observable, Observer, fromEvent, OperatorFunction} from 'rxjs';
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

/**
 * Operator that filters HTTP requests by `verb` and `pathPattern`.
 * @param verb 
 * @param pathPattern 
 */
export function bite(verb: string, pathPattern: PathPattern) {
  return (obs: Observable<Context>) => obs.pipe(
      rxop.filter((v) => v.method === verb),
      rxop.map((v) => v.match(pathPattern)),
      rxop.filter((v) => Boolean(v.match))
  );
}

export function snake(server: Server,
                      observer: ResponderObserver = new ResponderObserver(),
                      ...streams: OperatorFunction<Context, Responder>[]) {
  const obs = fromEvent<[IncomingMessage, ServerResponse]>(server, 'request')
    .pipe(
      rxop.map(([req, res]) => new Context(req, res))
    );
  
  return streams.map((s) => obs.pipe(s).subscribe(observer));
}