import { Observable, OperatorFunction, UnaryFunction } from "rxjs";

class Left<E, A> {
    readonly tag: 'left' = 'left';
    constructor(readonly value: E) {}

    map<B>(f: (a: A) => B): Either<E, A> {
        return this;
    }
}

class Right<E, A> {
    readonly tag: 'right' = 'right';
    constructor(readonly value: A) {}

    map<B>(f: (a: A) => B): Either<E, B> {
        return new Right(f(this.value));
    }
}

type Either<E, A> = Left<E, A> | Right<E, A>

/**
 * A Snake is an OperatorFunction that can be chained with another OperatorFunction
 * to produce a new Snake with a different return value.
 * 
 * Because snakes build individually on each other, this creates a type-safe method
 * of passing in a series of operator functions.
 * 
 * Snakes may return an error type. 
 */
export interface Snake<I, E, R> extends OperatorFunction<I, Either<E, R>> {
    chain<N>(op: OperatorFunction<I, N> | OperatorFunction<I, Either<E, R>>) : Snake<I, E, R>
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
export function snake<A, E>(op: In): Snake<In, In, > {
    return tfSnake(op);
}