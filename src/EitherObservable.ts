import { Observable, Operator, TeardownLogic, Subscriber } from "rxjs"

/**
 * Represents a disjoint union of two Observables.
 * 
 * An instance of `EitherObservable` is either an instance of `LeftObservable` or `RightObservable`.
 * Conviention is that `LeftObservable` is used for errors and `RightObservable` is used for successes.
 * 
 * `EitherObservable` is right-biased, `Right` is the default case to operate on.
 */
export type EitherObservable<E, A> = LeftObservable<E, A> | RightObservable<E, A>

/**
 * Interface to ensure that LeftObservable and RightObservable have the same methods.
 */
interface IEitherObservable<E, A> extends Observable<A> {
    readonly tag: "left" | "right";
}

export class LeftObservable<E, A> implements IEitherObservable<E, A> {
    readonly tag: "left" = "left";

    /** From RxJS docs: Internal implementation detail. */
    public _isScalar = false;

    /** Previous Observable in the chain. */
    source: Observable<any>;
    operator: Operator<any, A>;

    private readonly _subscribe?: (this: Observable<A>, subscriber: Subscriber<A>) => TeardownLogic

    constructor() {}
}

export class RightObservable<E, A> implements IEitherObservable<E, A> {
    readonly tag: "right" = "right";

    /** From RxJS docs: Internal implementation detail. */
    public _isScalar = false;
}