import { ServerResponse } from "http";
import { Observer } from "rxjs";
import { isString } from "util";

export type HeaderMap = {[name: string]: string | number | string[]};

/**
 * A Responder is an object that collects the information needed to construct a response
 * to the client, and provides a method which sends the response.
 * 
 */
export class Responder {
    constructor(readonly resObj: ServerResponse,
                readonly body: string | {toString(): string} = "",
                readonly status: number = 200,
                readonly headers: HeaderMap = {},
                readonly encoding: string = "utf-8",
                readonly endResponse = true) {
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