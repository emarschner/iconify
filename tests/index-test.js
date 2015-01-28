var assert = require('chai').assert;

// Hack to get browser-index recognized by browserify/requirejs so dynamic require() below works
if (typeof window !== 'undefined') {
  require('../src/browser/index');
}

describe('main package exports', function () {

  // Choose whether to load module via node-based or browser-based index
  var index = require('../src/' + (typeof window === 'undefined' ? 'node' : 'browser') + '/index');

  it('is a function', function () {
    assert.isFunction(index);
  });

  it('has a load method', function () {
    assert.isFunction(index.load);
  });

  it('has a custom Error', function () {
    assert.instanceOf(new index.Error(), Error);
  });
});
