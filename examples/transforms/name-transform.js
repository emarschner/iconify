var path = require('path');

module.exports = function(input, output) {
  input.on('data', function(item) {
    item.options.family = path.basename(path.dirname(item.source)) + '-icon';
    item.options.name = path.basename(item.source)
        .replace(/^ic_(.+)_\d+px.svg$/, '$1')
        .replace(/[^a-zA-Z0-9]/g, '-');

    output.write(item);
  });
};