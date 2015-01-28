var path = require('path');

var sinkTransformPath = path.resolve(__dirname, 'helpers', 'sink-transform');

var assert = require('chai').assert;

describe('CLI', function () {
  var cli = require('../../src/node/cli'),
      sinkTransform = require(sinkTransformPath);

  function runCLI (args) {
    return cli(['node', 'cli'].concat(args.split(/ +/)));
  }

  function withSinkTransform (action) {
    var context = {};

    beforeEach(function (done) {
      var items = context.items = [];

      sinkTransform.input
          .on('end', function () {
            done();
          })
          .on('data', function (item) {
            items.push(item);
          });

      action();
    });

    return context;
  }

  beforeEach(function () {
    sinkTransform.reset();
  });

  describe('called with an invalid option', function () {
    it('throws an error', function () {
      assert.throws(function () {
        runCLI('--some-invalid-option');
      });
    });
  });

  describe('options available', function () {
    var defaultOptions = require('../../src/node/index').load.defaultOptions;

    Object.keys(defaultOptions).forEach(function (optionName) {
      var optionFlag = '--' + optionName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

      it('include ' + optionFlag, function () {
        runCLI(optionFlag);
      });
    });
  });

  describe('given a file', function () {
    var fakeFilePath = 'fake-directory/fake-file.ext',
        context = withSinkTransform(function () {
          runCLI(['--transform', sinkTransformPath, fakeFilePath].join(' '));
        });

    it('only processes that single file', function () {
      assert.lengthOf(context.items, 1);
    });

    it('uses the file name as the name of the icon', function () {
      var fileName = path.basename(fakeFilePath).replace(/\.ext$/, '');

      assert.equal(context.items[0].options.name, fileName);
    });

    it('loads icon(s) from given filename', function () {
      assert.equal(context.items[0].source, fakeFilePath);
    });
  });

  describe('given many files', function () {
    var filePaths = Array.apply(null, { length: 5 }).map(Number.call, Number).map(function (index) {
      return 'some-directory/fake-file-' + (index + 1) + '.ext';
    });

    var context = withSinkTransform(function () {
      runCLI(['--transform', sinkTransformPath].concat(filePaths).join(' '));
    });

    it('processes each file', function () {
      assert.lengthOf(context.items, filePaths.length);
    });

    it('uses each file name as the name option', function () {
      context.items.forEach(function (item, index) {
        var fileName = path.basename(filePaths[index]).replace(/\.ext$/, '');

        assert.equal(item.options.name, fileName);
      });
    });

    it('loads icon(s) from those filenames', function () {
      assert.deepEqual(context.items.map(function (item) {
        return item.source;
      }), filePaths);
    });
  });
});
