import { Observable, OperatorFunction, UnaryFunction } from "rxjs";
import { Either, Right, Left } from "./Either";

/**
 * A Snake is a unique operator function which creates a disjoint stream. It is capable of composing itself with other
 * OperatorFunctions through the use of `map` or other `Snakes` through the use of `chain`.
 * 
 * Because snakes build individually on each other, this creates a type-safe method
 * of passing in a series of operator functions.
 */
export interface Snake<I, E, R> {
    (o: Observable<I>): Either<Observable<E>, Observable<R>>

    map<N>(op: OperatorFunction<R, N>) : Snake<I, E, N>
    chain<N>(s: Snake<R, E, N>): Snake<I, E, N>
}

export type SnakeFunc<I, E, R> = (i: Observable<I>) => Either<Observable<E>, Observable<R>>;

/**
 * Lifts a normal function matching Snake to a real Snake.
 */
export function liftSnake<I, E, R>(f: SnakeFunc<I, E, R>): Snake<I, E, R> {
    const rv: Snake<I, E, R> = (o: Observable<I>) => f(o);

    rv.map = <N>(f: OperatorFunction<R, N>) => 
        liftSnake((i: Observable<I>) => rv(i).map(f));

    rv.chain = <N>(s: Snake<R, E, N>) => 
        liftSnake((i: Observable<I>) => rv(i).chain(s));

    return rv;
}

/**
 * Takes an OperatorFunction and transforms it into a Snake.
 * @param op 
 */
export function tfSnake<I, E, R>(op: OperatorFunction<I, R>): Snake<I, E, R> {
    const rv: Snake<I, E, R> = (o: Observable<I>) => new Right(op(o));

    rv.map = <N>(f: OperatorFunction<R, N>) => 
        liftSnake((i: Observable<I>) => rv(i).map(f));

    rv.chain = <N>(s: Snake<R, E, N>) =>
        liftSnake((i: Observable<I>) => rv(i).chain(s));
    
    return rv;
}

/**
 * Creates a new "identity snake".
 */
export function snake<I, E, R>(r: Observable<R>): Snake<I, E, R> {
    return liftSnake(() => new Right(r));
}

/**
 * Creates a new "error snake".
 */
export function errorSnake<I, E, R>(e: Observable<E>): Snake<I, E, R> {
    return liftSnake(() => new Left(e));
}