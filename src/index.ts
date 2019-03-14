import {Observable, Observer, fromEvent, Subscription} from 'rxjs';
import * as rxop from 'rxjs/operators';
import {Server, IncomingMessage, ServerResponse} from 'http';
import {matchRegex, matchPathPattern, PathMatch} from './match';
import {parse, URIComponents} from 'uri-js';
import { Snake } from './snake';
import { Responder, ResponderObserver } from './response';

export type PathPattern = string | RegExp;

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

export type ApplyResult = {
  server: Server,
  streams: Observable<any>[]
  subscribers: Subscription[]
}

const contextMap = rxop.map(([req, res]) => new Context(req, res));

export function applySnakes(snakes: Snake<Context, Responder>[],
                            server: Server = new Server(),
                            observer = new ResponderObserver): ApplyResult {
  
  const obs = fromEvent<[IncomingMessage, ServerResponse]>(server, 'request')
  const streams = snakes.map((s) => obs.pipe(contextMap, s));
  
  return {
    'server': server,
    'streams': streams,
    'subscribers': streams.map((s) => s.subscribe(observer)),
  };
}