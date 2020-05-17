var $ = require('jquery'),
    assert = require('chai').assert;

describe('loading icons', function () {
  var index = require('../../src/browser/index');

  describe('from valid sources', function () {
    var allStrings = require('./fixtures/strings');

    function expectStyleElement () {
      it('creates a style element and appends it to the <head> element', function () {
        assert.lengthOf($('head > style.icons'), 1);
      });
    }

    function expectCSS (sourceName, encoding) {
      it('generates correct rules in the CSS stylesheet', function () {
        var sheetCSS = '',
            rules = $('head > style.icons')[0].sheet.cssRules;

        for (var i = 0; i < rules.length; i++) {
          sheetCSS += rules[i].cssText;
        }

        assert.equal(sheetCSS, allStrings[sourceName].css[encoding]);
      });
    }

    afterEach(function () {
      for (var familyName in index.__families__) {
        $('style.icons.' + familyName).remove();
      }

      index.__families__ = {};
    });

    describe('via JSONP', function () {
      beforeEach(function (done) {
        index.load('/base/tests/browser/fixtures/jsonp/open-iconic.svg.jsonp', {
          dataType: 'jsonp',
          jsonp: false,
          jsonpCallback: 'jsonpTestCallback',
          decode: function (response) {
            return atob(response.data.content);
          }
        }).then(function () {
          done();
        });
      });

      expectStyleElement();
    });

    Object.keys(allStrings).forEach(function (sourceName) {
      describe('like a ' + sourceName, function () {
        describe('from an svg string', function () {
          describe('to base64 encoded data URIs', function () {
            beforeEach(function (done) {
              index.load(allStrings[sourceName].svg, {
                name: sourceName
              }).then(function () {
                done();
              });
            });

            expectStyleElement();
            expectCSS(sourceName, 'base64');
          });

          describe('to URI-encoded UTF8 data URIs', function () {
            beforeEach(function (done) {
              index.load(allStrings[sourceName].svg, {
                dataUriFormat: 'utf8',
                name: sourceName
              }).then(function () {
                done();
              });
            });

            expectStyleElement();
            expectCSS(sourceName, 'utf8');
          });
        });

        describe('from an svg URL', function () {
          beforeEach(function (done) {
            index.load('/base/tests/fixtures/svg/' + sourceName + '.svg', {
              name: sourceName
            }).then(function () {
              done();
            });
          });

          expectStyleElement();
          expectCSS(sourceName, 'base64');
        });
      });
    });
  });

  describe('from invalid sources', function () {
    var error;

    function expectCustomError () {
      it('fails with a custom error', function () {
        assert.instanceOf(error, index.Error);
      });
    }

    describe('like non-SVG XML', function () {
      beforeEach(function (done) {
        index.load('<xml><invalid /></xml>').fail(function (e) {
          error = e;
          done();
        });
      });

      expectCustomError();
    });

    describe('like just plain invalid text', function () {
      beforeEach(function (done) {
        index.load('definitely not valid...').fail(function (e) {
          error = e;
          done();
        });
      });

      expectCustomError();
    });

    describe('like a non-existant file', function () {
      beforeEach(function (done) {
        index.load('something-that-does-not-exist').fail(function (e) {
          error = e;
          done();
        });
      });

      expectCustomError();
    });

    describe('like not even a string', function () {
      beforeEach(function (done) {
        index.load({}).fail(function (e) {
          error = e;
          done();
        });
      });

      it('fails with a type error', function () {
        assert.instanceOf(error, TypeError);
      });
    });
  });
});
