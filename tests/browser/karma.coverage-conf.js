module.exports = function(config) {
  var settings = require('./karma.base-conf');

  settings.browserify.transform = [require('browserify-istanbul')];
  settings.reporters.push('coverage');

  config.set(settings);
};