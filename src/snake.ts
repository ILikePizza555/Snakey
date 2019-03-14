import { OperatorFunction } from "rxjs";

/**
 * A Snake is an OperatorFunction that can be chained with another OperatorFunction
 * to produce a new Snake with a different return value.
 */
export interface Snake<T, R> extends OperatorFunction<T, R> {
    chain<N>(op: OperatorFunction<R, N>) : Snake<T, N>
}
