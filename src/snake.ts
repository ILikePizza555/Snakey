import { Observable, OperatorFunction, UnaryFunction } from "rxjs";
import { Either, Right, Left, isRight } from "./Either";

/**
 * A Snake is an OperatorFunction that can be chained with another OperatorFunction
 * to produce a new Snake with a different return value.
 * 
 * Because snakes build individually on each other, this creates a type-safe method
 * of passing in a series of operator functions.
 * 
 * ... This is just a Functor, isn't it?
 */
export interface Snake<T, R> extends OperatorFunction<T, R> {
    chain<N>(op: OperatorFunction<R, N>): Snake<T, N>;
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
    rv.chain = <N>(f: OperatorFunction<R, N>) => tfSnake(compose(rv, f));
    return rv;
}

/**
 * Creates a new snake from the OperatorFunction. If no operator function is passed,
 * then an "indentity Snake" is created.
 */
export function snake<T, R = T>(op: OperatorFunction<T, R|T> = (t: Observable<T>) => t): Snake<T, R|T> {
    return tfSnake(op);
}