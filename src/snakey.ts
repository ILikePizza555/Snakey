import {Observable, Observer, fromEvent, OperatorFunction, Subscription, Operator, UnaryFunction} from 'rxjs';
import * as rxop from 'rxjs/operators';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {matchRegex, matchPathPattern, PathMatch} from './match';
import {parse, URIComponents} from 'uri-js';
import { compose } from './utils';

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

/**
 * An iterable and immutable collection of OperatorFunctions.
 * The first OperatorFunction must take A as a parameter, and the last
 * OperatorFunction must return B.
 * 
 * The composition of all OperatorFunctions must be a function which takes an A and returns a B.
 */
export interface Snake<A, B> {
  readonly first: OperatorFunction<A, any>;
  readonly last: OperatorFunction<any, B>;

  readonly length: number;

  push<T>(op: OperatorFunction<B, T>): Snake<A, T>;
  compose(): OperatorFunction<A, B>;
}

class ListSnake<A, B> implements Snake<A, B> {
  constructor(readonly first: OperatorFunction<A, any>,
              readonly center: OperatorFunction<any, any>[],
              readonly last: OperatorFunction<any, B>) {
    Object.freeze(this);
  }

  get length(): number {
    return 2 + this.center.length;
  }

  push<T>(op: OperatorFunction<B, T>): Snake<A, T> {
    return new ListSnake(this.first, this.center.concat(this.last), op);
  }

  compose(): OperatorFunction<A, B> {
    return compose(this.first, ...this.center, this.last)
  }
}

class SingleSnake<A, B> implements Snake<A, B> {
  constructor(readonly single: OperatorFunction<A, B>) {
    Object.freeze(this);
  }

  get first() {return this.single;}
  get last() {return this.single;}
  get length() {return 1;}

  push<T>(op: OperatorFunction<B, T>): Snake<A, T> {
    return new ListSnake(this.single, [], op);
  }

  compose() {return this.single;}
}

export type SnakeResult = {
  server: Server,
  streams: Observable<any>[]
  subscribers: Subscription[]
}

export function applySnakes(snake: Snake<Context, Responder>[], 
                            server: Server = new Server(),
                            observer = new ResponderObserver): SnakeResult {
  const obs = fromEvent<[IncomingMessage, ServerResponse]>(server, 'request')
    .pipe(
      rxop.map(([req, res]) => new Context(req, res))
    );

  const streams = snake.map(s => obs.pipe(s.compose()));
  
  return {
    'server': server,
    'streams': streams,
    'subscribers': streams.map((s) => s.subscribe(observer)),
  };
}