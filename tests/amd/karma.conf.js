module.exports = function (config) {
  config.set({
    basePath: '../..',
    frameworks: ['mocha', 'requirejs'],
    files: [
      'tests/amd/karma.main.js',
      { pattern: 'node_modules/chai/chai.js', included: false },
      { pattern: 'node_modules/jquery/dist/jquery.js', included: false },
      { pattern: 'node_modules/js-sha256/src/sha256.js', included: false },
      { pattern: 'src/**/*.js', included: false },
      { pattern: 'tests/*-test.js', included: false },
      { pattern: 'tests/browser/*-test.js', included: false },
      { pattern: 'tests/**/fixtures/**/*', included: false }
    ],
    preprocessors: {
      'src/**/*.js': 'node2umd',
      'tests/*-test.js': 'node2umd',
      'tests/browser/*-test.js': 'node2umd',
      'tests/**/fixtures/**/*.js': 'node2umd'
    },
    reporters: ['progress'],
    browsers: ['PhantomJS']
  });
};
