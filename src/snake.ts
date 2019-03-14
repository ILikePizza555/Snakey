import { Observable, OperatorFunction, UnaryFunction } from "rxjs";

/**
 * A Snake is an OperatorFunction that can be chained with another OperatorFunction
 * to produce a new Snake with a different return value.
 */
export interface Snake<T, R> extends OperatorFunction<T, R> {
    chain<N>(op: OperatorFunction<R, N>) : Snake<T, N>
}

function compose<A, B, C>(f1: UnaryFunction<A, B>, f2: UnaryFunction<B, C>): UnaryFunction<A, C> {
    return (a: A) => f2(f1(a));
}

/**
 * Takes an OperatorFunction and transforms it into a Snake.
 * @param op 
 */
export function tfSnake<T, R>(op: OperatorFunction<T, R>): Snake<T, R> {
    const rv: Snake<T, R> = (o: Observable<T>) => op(o);
    rv.chain = <N>(f: OperatorFunction<R, N>) => tfSnake(compose(this, f));
    return rv;
}

/**
 * Instantiates an 'indentity' snake.
 */
export function iSnake<T>(): Snake<T, T> {
    return tfSnake((o: Observable<T>) => o);
}