var optimist = require('optimist'),
    path = require('path')
    stream = require('stream');

var iconify = require('./node/index');

function dashedToCamel(dashed) {
  var words = dashed.split('-');

  return words.shift() + words.map(function(word) {
    return word.charAt(0).toUpperCase() + word.substr(1);
  }).join('');
}

module.exports = function(argv) {
  var args = require('optimist').parse(argv.slice(2)),
      sources = args._.slice(0),
      options = {
        output: process.stdout,
        transform: null
      },
      defaultOptions = iconify.load.defaultOptions;

  Object.getOwnPropertyNames(args).forEach(function(name) {
    if (name !== '_' && name !== '$0') {
      var camelName = dashedToCamel(name);

      if (defaultOptions[camelName] !== undefined || options[camelName] !== undefined) {
        options[camelName] = args[name];
      } else {
        throw new Error('Unknown argument: ' + name + ' = ' + args[name]);
      }
    }
  });

  var initialInput = new stream.PassThrough({ objectMode: true }),
      transform = options.transform;

  [function(input, output) { // for now this default transform is always first
    input.on('data', function(item) {
      if (item.options.name == null) {
        item.options.name = path.basename(item.source)
            .replace(new RegExp(path.extname(item.source) + '$'), '');
      }

      output.write(item);
    });
  }].concat(typeof transform === 'string' ? transform.split(',') : transform || [])
      .map(function(transformer) {
        switch (typeof transformer) {
          case 'function':
            return transformer;
          case 'string':
            return require(transformer.indexOf('/') >= 0 ? path.resolve(transformer) : transformer);
        }
      })
      .reduce(function(input, transformer) {
        var output = new stream.PassThrough({ objectMode: true });

        input.on('end', function() {
          output.end();
        });
        transformer(input, output);

        return output;
      }, initialInput)
      .on('data', function(item) {
        iconify.load(item.source, item.options).fail(function(e) {
          console.error(e.message);
        });
      });

  sources.forEach(function(source) {
    initialInput.write({ source: source, options: iconify.$.extend(true, {}, options) });
  });
};
