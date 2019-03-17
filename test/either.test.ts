/* eslint-env node, mocha */
import * as should from "should";

import { Either, Left, isLeft, isRight, Right} from "../src/Either";

describe("properties", function() {
    describe("tag", function() {
        it("equals 'left' if and only if the type is `Left`", function() {
            const unknown: Either<string, Object> = new Left("I am error.");
            unknown.tag.should.equal("left");

            isLeft(unknown).should.be.true;
            isRight(unknown).should.be.false;
        });

        it("equals 'right' if and only if the type is `Right`", function() {
            const unknown: Either<string, Object> = new Right({"good": "I am good."});
            unknown.tag.should.equal("right");

            isLeft(unknown).should.be.false;
            isRight(unknown).should.be.true;
        });
    });
});

describe("map", function() {
    it("returns an instance of `Right` if it is called on `Right`", function() {
        const unknown: Either<"error1"|"error2", string> = new Right("girl");
        const result = unknown.map((g: string) => g.length);

        isRight(result).should.be.true;
    });

    it("returns a `Left` with the same value if called on `Left`", function() {
        const unknown: Either<"error1"|"error2", string> = new Left<"error1"|"error2", string>("error1");
        const result = unknown.map((g: string) => g.length);

        isLeft(result).should.be.true;
        result.value.should.equal(unknown.value);
    });
});

describe("chain", function() {
    type Error = {error: string};
    type Gender = "girl" | "boy" | "trans girl" | "trans boy"

    function transition(g: Gender): Either<Error, Gender> {
        if(g === "girl") return new Right<Error, Gender>("trans boy");
        if(g === "boy") return new Right<Error, Gender>("trans girl");
        else return new Left<Error, Gender>({error: "Already valid."});
    }

    it("maps over the value if this is an instance of `Right`", function() {
        const unknown: Either<Error, Gender> = new Right("boy");
        const result = unknown.chain(transition);

        isRight(result).should.be.true;
        result.value.should.equal("trans girl");
    });
});