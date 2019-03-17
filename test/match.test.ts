/* eslint-env node, mocha */
import assert = require("assert");
import * as should from "should";

import {matchRegex, matchPathPattern} from "../src/match";

describe("url-params", function() {
    describe(":matchRegex()", function() {
        it("returns null is no match was found", function() {
            should(matchRegex("/only/words/", /\d/)).be.null();
        });

        it("matches simple regex", function() {
            matchRegex("/stop_it_cadey/", /\/stop_it_cadey/).should.be.an.Array()
                .and.match({"length": 1, "0": "/stop_it_cadey"});
        });

        it("matches regex groups", function() {
            matchRegex("/twilight/sparkle", /\/(\w*)/g).should.be.an.Array()
                .and.match({"length": 2, "0": "/twilight", "1": "/sparkle"});
        });
    });

    describe("matchPathPattern()", function() {
        it("matches a raw string exactly", function() {
            matchPathPattern("/girls/", "/girls").should.be.an.Object().and.match({"fullMatch": "girls"});
        });

        it("matches a pattern with a regex segment", function() {
            const pattern = "/trans/(girls|boys)?";
            matchPathPattern("/trans/girls", pattern).should.be.an.Object().and.match({"fullMatch": "trans/girls"});
            matchPathPattern("/trans/boys", pattern).should.be.an.Object().and.match({"fullMatch": "trans/boys"});
            matchPathPattern("/trans/", pattern).should.be.an.Object().and.match({"fullMatch": "trans"});
        });

        it("matches a pattern with a named parameter", function() {
            const pattern = "/pony/:name";
            matchPathPattern("/pony/spike", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony/spike",
                    "params": {"name": "spike"},
                });
        });

        it("matches multiple named parameters", function() {
            const pattern = "/:filename1/merge/:filename2";
            matchPathPattern("/aaa.txt/merge/bbb.txt", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "aaa.txt/merge/bbb.txt",
                    "params": {"filename1": "aaa.txt", "filename2": "bbb.txt"},
                });
        });

        it("matches a pattern with an optional named parameter", function() {
            const pattern = "/pony/:name?";
            matchPathPattern("/pony/", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony",
                    "params": {"name": undefined},
                });
            matchPathPattern("/pony/spike", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony/spike",
                    "params": {"name": "spike"},
                });
        });

        it("matches a pattern with an optional repeating named parameter", function() {
            const pattern = "/pony/:name*";
            matchPathPattern("/pony/", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony",
                    "params": {"name": undefined},
                });
            matchPathPattern("/pony/spike", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony/spike",
                    "params": {"name": ["spike"]},
                });
            matchPathPattern("/pony/rainbow/dash", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony/rainbow/dash",
                    "params": {"name": ["rainbow", "dash"]},
                });
        });

        it("matches a pattern with a repeating named parameter", function() {
            const pattern = "/pony/:name+";
            should(matchPathPattern("/pony/", pattern)).be.null();
            matchPathPattern("/pony/fluttershy", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony/fluttershy",
                    "params": {"name": ["fluttershy"]},
                });
            matchPathPattern("/pony/spike/the/dragon", pattern).should.be.an.Object()
                .and.match({
                    "fullMatch": "pony/spike/the/dragon",
                    "params": {"name": ["spike", "the", "dragon"]},
                });
        });
    });
});
