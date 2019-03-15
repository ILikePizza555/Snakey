import { ServerResponse } from "http";
import { Observer, OperatorFunction } from "rxjs";
import { isString } from "util";
import { map } from "rxjs/operators";
import { Context } from "./index";

export type HeaderMap = {[name: string]: string | number | string[]};
export type ResponderParams = {
    body?: string | {toString(): string},
    status?: number,
    headers?: HeaderMap,
    encoding?: string,
    endResponse?: boolean
}

/**
 * A Responder is an object that collects the information needed to construct a response
 * to the client, and provides a method which sends the response.
 */
export class Responder {
    readonly body: string | {toString(): string};
    readonly status: number;
    readonly headers: HeaderMap;
    readonly encoding: string;
    readonly endResponse;

    constructor(readonly resObj: ServerResponse,
                {body = "", status = 200, headers = {}, encoding = "utf-8", endResponse = true}: ResponderParams) {
        this.body = body;
        this.status = status;
        this.headers = headers;
        this.encoding = encoding;
        this.endResponse = endResponse;
    }

    respond() {
        this.resObj.writeHead(this.status, this.headers);

        const chunk: string = (isString(this.body)) ? this.body : this.body.toString();

        if(this.endResponse) {
            this.resObj.end(chunk, this.encoding);
        } else {
            this.resObj.write(chunk, this.encoding);
        }
    }
}

/**
 * Creates a new OperatorFunction that takes a Context and constructs a Responder.
 * 
 * The responder will write `text` to the client, with an HTTP status code of `status`.
 * 
 * @param text The text that will be written to the client
 * @param status The HTTP status code.
 * @param encoding The encoding of the string
 */
export function textResponse(text: string, 
                             status: number = 200, 
                             encoding: string = "utf-8"): OperatorFunction<Context, Responder> {
    return map((ctx: Context) => new Responder(ctx.response, {body: text, status: status, encoding: encoding}))
}

/**
 * Creates a new OperatorFunction that takes a Context and constructs a Responder.
 * 
 * The Responder will write `o` as a JSON string to the client, with an HTTP status code of `status`.
 * The appropriate content-type header will be set.
 * @param o 
 * @param status 
 */
export function jsonResponse(o: Object, status: number = 200): OperatorFunction<Context, Responder> {
    return map((ctx: Context) => 
        new Responder(ctx.response, {
            body: JSON.stringify(o), 
            status: status,
            headers: {"Content-Type": "application/json"}
        }));
}

/**
* Observer for a stream of Responder.
*/
export class ResponderObserver implements Observer<Responder> {
    next(res): void {
        res.respond();
    }

    error(err): void {
        console.error(err);
    }
    complete(): void { }
}