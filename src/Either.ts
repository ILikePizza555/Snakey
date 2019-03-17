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

interface EitherInterface<E, A> {
    readonly tag: "left" | "right";
    readonly value: E | A;

    /**
     * Maps the function across `Right`. If the value is actually `Left`, this does nothing.
     * @param f 
     */
    map<B>(f: (a: A) => B): Either<E, B>;

    /**
     * Binds the given function across `Right`.
     * @param f 
     */
    chain<B>(f: (a: A) => Either<E, B>): Either<E, B>;

    /**
     * Maps the function across `Left`. If the value is actually `Right`, this does nothing
     */
    mapLeft<NE>(f: (a: E) => NE): Either<NE, A>;

    /**
     * Returns `value` is this is `Right`. Otherwise returns `a`.
     * @param a 
     */
    getOrElse(a: A): A;
}

export class Left<E, A> implements EitherInterface<E, A> {
    readonly tag: "left" = "left";

    constructor(public readonly value: E) {}

    map<B>(f: (a: A) => B): Either<E, B> {
        return new Left<E, B>(this.value);
    }

    chain<B>(f: (a: A) => Either<E, B>): Either<E, B> {
        return new Left<E, B>(this.value);
    }

    mapLeft<NE>(f: (a: E) => NE): Left<NE, A> {
        return new Left(f(this.value));
    }

    getOrElse(a: A): A {
        return a;
    }
}

export class Right<E, A> implements EitherInterface<E, A> {
    readonly tag: "right" = "right";

    constructor(readonly value: A) {}

    map<B>(f: (a: A) => B): Right<E, B> {
        return new Right<E, B>(f(this.value));
    }

    chain<B>(f: (a: A) => Either<E, B>): Either<E, B> {
        return f(this.value);
    }

    mapLeft<NE>(f: (a: E) => NE): Either<NE, A> {
        return new Right(this.value);
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

/**
 * If the value of e1 is `Right`, then e1 is returned. Otherwise, e2 is returned.
 * @param e1 
 * @param e2 
 */
export function concat<E, A>(e1: Either<E, A>, e2: Either<E, A>): Either<E, A> {
    if(isRight(e1)) return e1;
    else return e2;
}