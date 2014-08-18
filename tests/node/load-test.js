var stream = require('stream');

var assert = require('chai').assert;

describe('loading icons', function() {
  var index = require('../../src/node/index');

  describe('from valid sources', function() {
    var allStrings = require('./fixtures/strings');

    Object.keys(allStrings).forEach(function(sourceName) {
      describe('like a ' + sourceName, function() {
        var iconStrings,
            output,
            cssRules;

        function waitForOutputToFinish(done) {
          output.once('data', function() {
            output.once('end', function() {
              done();
            });
          });
        }

        function expectCorrectOutputCSS() {
          it('writes correct CSS rules to the output stream', function() {
            assert.equal(cssRules, iconStrings.css);
          });
        }

        beforeEach(function() {
          iconStrings = allStrings[sourceName];
          output = new stream.PassThrough();
          cssRules = '';

          output.on('data', function(chunk) {
            cssRules += chunk;
          });
        });

        describe('from an svg string', function() {
          beforeEach(function(done) {
            waitForOutputToFinish(done);
            index.load(iconStrings.svg, { name: sourceName, output: output });
          });

          expectCorrectOutputCSS();
        });

        describe('from an svg file', function() {
          beforeEach(function(done) {
            waitForOutputToFinish(done);
            index.load('tests/fixtures/svg/' + sourceName + '.svg', {
              name: sourceName,
              output: output
            });
          });

          expectCorrectOutputCSS();
        });
      });
    });
  });

  describe('from invalid sources', function() {
    var error;

    function expectCustomError() {
      it('fails with a custom error', function() {
        assert.instanceOf(error, index.Error);
      });
    }

    describe('like non-SVG XML', function() {
      beforeEach(function(done) {
        index.load('tests/node/fixtures/not-svg.xml').fail(function(e) {
          error = e;
          done();
        });
      });

      expectCustomError();
    });

    describe('like just plain invalid text', function() {
      beforeEach(function(done) {
        index.load('tests/node/fixtures/not-xml.txt').fail(function(e) {
          error = e;
          done();
        });
      });

      expectCustomError();
    });

    describe('like a non-existant file', function() {
      beforeEach(function(done) {
        index.load('something-that-does-not-exist').fail(function(e) {
          error = e;
          done();
        });
      });

      expectCustomError();
    });

    describe('like not even a string', function() {
      beforeEach(function(done) {
        index.load({}).fail(function(e) {
          error = e;
          done();
        });
      })

      it('fails with a type error', function() {
        assert.instanceOf(error, TypeError);
      })
    });
  });
});