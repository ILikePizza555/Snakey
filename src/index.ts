import { Observable, Observer, fromEvent, Subscription, OperatorFunction } from "rxjs";
import * as rxop from "rxjs/operators";
import { Server, IncomingMessage, ServerResponse } from "http";
import { PathPattern } from "./match";
import { Context } from "./Context";
import { Snake } from "./snake";
import { Responder, ResponderObserver } from "./response";

export { snake, Snake } from "./snake";

/**
 * Operator that filters HTTP requests by `verb` and `pathPattern`.
 * @param verb 
 * @param pathPattern 
 */
export function bite(verb: string, pathPattern: PathPattern): OperatorFunction<Context, Context> {
    return (obs: Observable<Context>) => obs.pipe(
        rxop.filter((v) => v.method === verb),
        rxop.map((v) => v.match(pathPattern)),
        rxop.filter((v) => Boolean(v.pathMatch))
    );
}

export interface ApplyResult {
    server: Server;
    streams: Observable<any>[];
    subscribers: Subscription[];
}

const contextMap = rxop.map(([req, res]) => new Context(req, res));

export function applySnakes(snakes: Snake<Context, Responder>[],
    server: Server = new Server(),
    observer = new ResponderObserver): ApplyResult {

    const obs = fromEvent<[IncomingMessage, ServerResponse]>(server, "request")
    const streams = snakes.map((s) => obs.pipe(contextMap, s));

    return {
        "server": server,
        "streams": streams,
        "subscribers": streams.map((s) => s.subscribe(observer)),
    };
}