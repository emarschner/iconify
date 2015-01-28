var assert = require('chai').assert;

describe('package core', function () {
  var core = require('../src/core');

  it('is a function', function () {
    assert.isFunction(core);
  });

  describe('dependency definition/injection without suitable definitions', function () {
    var error;

    beforeEach(function () {
      try {
        core();
      } catch (e) {
        error = e;
      }
    });

    it('should throw an error', function () {
      assert.instanceOf(error, Error);
    });
  });
});
