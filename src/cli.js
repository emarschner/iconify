var path = require('path'),
    optimist = require('optimist');

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
      options = { output: process.stdout };

  Object.getOwnPropertyNames(args).forEach(function(name) {
    if (name !== '_' && name !== '$0') {
      var camelName = dashedToCamel(name);

      if (iconify.load.defaultOptions[camelName] !== undefined) {
        options[camelName] = args[name];
      } else {
        throw new Error('Unknown argument: ' + name + ' = ' + args[name]);
      }
    }
  });

  function loadNextSource() {
    if (sources.length === 0) {
      return;
    } else {
      var source = sources.shift();

      if (options.name == null) {
        options.name = path.basename(source).replace(new RegExp(path.extname(source) + '$'), '');
      }

      iconify.load(source, options).then(function() {
        loadNextSource();
      }).fail(function(e) {
        console.error(e.message);
      });
    }
  }

  loadNextSource();
};
