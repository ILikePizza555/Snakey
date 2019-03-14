import { ServerResponse } from "http";
import { Observer } from "rxjs";

/**
 * Function interface that consumes a ServerResponse to send data to the client.
 */
export interface Responder {
    (res: ServerResponse): void;
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
    complete(): void { }
}