/**
 * Represents a disjoint union of two types.
 * 
 * An instance of `Either` is either an instance of `Left` or `Right`
 * Convention is that `Left` is used for failure and `Right` is used for success.
 * 
 * `Either` is right-biased, which means that `Right` is assumed to be the default case to operate on.
 * Unless otherwise specified, operations on instances of left will leave it unchanged.
 */
export type Either<E, A> = Left<E, A> | Right<E, A>

export class Left<E, A> {
    readonly tag: "left" = "left";

    constructor(public readonly value: E) {}

    /**
     * Maps the function across `Right`. If the value is actually `Left`, this does nothing.
     * @param f 
     */
    map<B>(f: (a: A) => B): Either<E, B> {
        return new Left<E, B>(this.value);
    }

    /**
     * Binds the given function across `Right`.
     * @param f 
     */
    chain<B>(f: (a: A) => Either<E, B>): Either<E, B> {
        return new Left<E, B>(this.value);
    }

    getOrElse(a: A): A {
        return a;
    }
}

export class Right<E, A> {
    readonly tag: "right" = "right";

    constructor(readonly value: A) {}

    /**
     * Maps the function across `Right`. If the value is actually `Left`, this does nothing.
     * @param f 
     */
    map<B>(f: (a: A) => B): Either<E, B> {
        return new Right<E, B>(f(this.value));
    }

    /**
     * Binds the given function across `Right`.
     * @param f 
     */
    chain<B>(f: (a: A) => Either<E, B>): Either<E, B> {
        return f(this.value);
    }

    getOrElse(a: A): A {
        return this.value;
    }
}

export function isLeft<E, A>(e: Either<E, A>): e is Left<E, A> {
    return e.tag === "left";
}

export function isRight<E, A>(e: Either<E, A>): e is Right<E, A> {
    return e.tag === "right";
}