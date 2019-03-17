import { ServerResponse } from "http";

/**
 * Represents an error to be returned to client over HTTP.
 */
interface HTTPError {
    readonly res: ServerResponse;
    readonly status: number;
    readonly message?: string | {toString(): string};
}