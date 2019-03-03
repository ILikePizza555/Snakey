/* eslint-env node, mocha */
const assert = require('assert');
const should = require('should');

const {matchRegex, matchPathPattern} = require('../src/url-params');

describe('url-params', function() {
  describe(':matchRegex()', function() {
    it('throws an error if a RegExp object is not provided', function() {
      (() => matchRegex('/twilight/sparkle/', '')).should.throw(TypeError);
    });

    it('returns null is no match was found', function() {
      should(matchRegex('/only/words/', /\d/)).be.null();
    });

    it('matches simple regex', function() {
      matchRegex('/stop_it_cadey/', /\/stop_it_cadey/).should.be.an.Array().with.length(1).and.match({'0': '/stop_it_cadey'});
    });

    it('matches regex groups', function() {
      matchRegex('/twilight/sparkle/', /(\w*)/).should.be.an.Array().with.length(2).and.match({'1': 'twilight', '2': 'sparkle'});
    });
  });

  describe('matchPathPattern()', function() {
    it('matches a raw string exactly', function() {
      matchPathPattern('/girls/', '/girls').should.be.an.Array().with.property('0').eql('girls');
    });

    it('matches a pattern with a regex segment', function() {
      const pattern = '/trans/(girls|boys)?';
      matchPathPattern('/trans/girls', pattern).should.be.an.Object().and.matches({'_fullMatch': 'trans/girls'});
      matchPathPattern('/trans/boys', pattern).should.be.an.Object().and.matches({'_fullMatch': 'trans/girls'});
      matchPathPattern('/trans/', pattern).should.be.an.Object().and.matches({'_fullMatch': 'trans/'});
    });

    it('matches a pattern with a named parameter', function() {
      const pattern = '/pony/:name';
      matchPathPattern('/pony/spike', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/spike', 'name': 'spike'});
    });

    it('matches multiple named parameters', function() {
      const pattern = '/:filename1/merge/:filename2';
      matchPathPattern('/aaa.txt/merge/bbb.txt', pattern).should.be.an.Object()
          .and.matches({'_fullMatch': 'aaa.txt/merge/bbb.txt', 'filename1': 'aaa.txt', 'filename2': 'bbb.txt'});
    });

    it('matches a pattern with an optional named parameter', function() {
      const pattern = '/pony/:name?';
      matchPathPattern('/pony/', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/', 'name': undefined});
      matchPathPattern('/pony/spike', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/spike', 'name': 'spike'});
    });

    it('matches a pattern with an optional repeating named parameter', function() {
      const pattern = '/pony/:name*';
      matchPathPattern('/pony/', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/', 'name': undefined});
      matchPathPattern('/pony/spike', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/spike', 'name': 'spike'});
      matchPathPattern('/pony/rainbow/dash', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/spike', 'name': ['rainbow', 'dash']});
    });

    it('matches a pattern with a repeating named parameter', function() {
      const pattern = '/pony/:name+';
      should(matchPathPattern('/pony/', pattern)).be.null();
      matchPathPattern('/pony/fluttershy', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/fluttershy', 'name': ['fluttershy']});
      matchPathPattern('/pony/spike/the/dragon', pattern).should.be.an.Object().and.matches({'_fullMatch': 'pony/spike/the/dragon', 'name': ['spike', 'the', 'dragon']});
    });
  });
});
