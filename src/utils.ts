import { UnaryFunction } from "rxjs";

export function compose<A, B>(...fs): UnaryFunction<A, B> {
    return (x) => fs.reduceRight((y, f) => f(y), x);
}