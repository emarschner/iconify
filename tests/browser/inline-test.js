var $ = require('jquery'),
    assert = require('chai').assert;

describe('inlining icons', function () {
  var index = require('../../src/browser/index'),
      iconElement,
      error;

  ['base64', 'utf8'].forEach(function (encoding) {
    describe('with ' + encoding + ' encoding', function () {
      beforeEach(function (done) {
        index.load(require('./fixtures/strings')['thumb-up'].svg, {
          dataUriFormat: encoding,
          name: 'thumb-up'
        }).then(function () {
          done();
        });
      });

      afterEach(function () {
        error = undefined;
      });

      afterEach(function () {
        if (iconElement) {
          $(iconElement).remove();
          iconElement = undefined;
        }

        for (var familyName in index.__families__) {
          $('style.icons.' + familyName).remove();
        }

        index.__families__ = {};
      });

      describe('when the icon exists', function () {
        var $inlined;

        beforeEach(function () {
          iconElement = $('<div>').attr('class', 'thumb-up icon').appendTo('body')[0];
        });

        function expectElementReturned () {
          it('returns the jQuery-wrapped icon element', function () {
            assert.strictEqual($inlined[0], iconElement);
          });
        }

        describe('from a raw element', function () {
          beforeEach(function () {
            $inlined = index(iconElement);
          });

          expectElementReturned();

          describe('w/out the family class', function () {
            beforeEach(function () {
              $(iconElement).removeClass('icon');
              $inlined = index(iconElement);
            });

            expectElementReturned();
          });
        });

        describe('from a jQuery-wrapped element', function () {
          var $svg;

          beforeEach(function () {
            $inlined = index($(iconElement));
            $svg = $inlined.find('svg');
          });

          expectElementReturned();

          it('adds the "inline" class to the icon element', function () {
            assert.ok($inlined.hasClass('inline'));
          });

          it('inserts the SVG content for into the icon element', function () {
            assert.equal($svg.length, 1);
          });

          it('sets the width and height of the inlined SVG element to 100%', function () {
            assert.equal($svg.attr('width'), '100%');
            assert.equal($svg.attr('height'), '100%');
          });
        });
      });

      describe('when the icon does not exist', function () {
        beforeEach(function () {
          try {
            index(iconElement = $('<div>').attr('class', 'non-existant icon').appendTo('body')[0]);
          } catch (e) {
            error = e;
          }
        });

        it('throws an appropriate error', function () {
          assert.deepEqual(error.details, { el: iconElement });
        });
      });

      describe('when the icon family does not exist', function () {
        beforeEach(function () {
          try {
            index(iconElement =
                $('<div>').attr('class', 'thumb-up non-existant').appendTo('body')[0]);
          } catch (e) {
            error = e;
          }
        });

        it('throws an appropriate error', function () {
          assert.deepEqual(error.details, { el: iconElement });
        });
      });
    });
  });
});
