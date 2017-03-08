var allTestFiles = [];
var TEST_REGEXP = /^\/base\/tests\/.*-test\.js$/i;

var pathToModule = function (path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  baseUrl: '/base',
  paths: {
    chai: 'node_modules/chai/chai',
    jquery: 'node_modules/jquery/dist/jquery',
    'js-sha256': 'node_modules/js-sha256/src/sha256'
  },
  deps: allTestFiles,
  callback: window.__karma__.start
});
