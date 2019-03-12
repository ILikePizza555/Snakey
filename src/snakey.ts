import {Observable, Observer, fromEvent, OperatorFunction, Subscription} from 'rxjs';
import * as rxop from 'rxjs/operators';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {matchRegex, matchPathPattern, PathMatch} from './match';
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
              readonly pathMatch: PathMatch | RegExpMatchArray | null = null) {
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
      rxop.filter((v) => Boolean(v.pathMatch))
  );
}

export type Stream<T, R> = OperatorFunction<T, R>[]
export type Snake<T, R> = Stream<T, R>[]

export type SnakeResult = {
  server: Server,
  streams: Observable<any>[]
  subscribers: Subscription[]
}

export function applySnakes(snake: Snake<any, any>, 
                            server: Server = new Server(),
                            observer = new ResponderObserver): SnakeResult {
  const obs = fromEvent<[IncomingMessage, ServerResponse]>(server, 'request')
    .pipe(
      rxop.map(([req, res]) => new Context(req, res))
    );

  const streams = snake.map((s) => s.reduce((acc, cur) => acc.pipe(cur), obs));
  
  return {
    'server': server,
    'streams': streams,
    'subscribers': streams.map((s) => s.subscribe(observer)),
  };
}