import { parse, URIComponents } from "uri-js";
import { IncomingMessage, ServerResponse } from "http";
import { matchRegex, matchPathPattern, PathMatch, PathPattern } from './match';


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