process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = {
  basePath: '../..',
  frameworks: ['mocha', 'browserify'],
  browserify: {
    watch: true
  },
  files: [
    'tests/*-test.js',
    'tests/browser/*-test.js',
    { pattern: 'tests/**/fixtures/**/*', included: false }
  ],
  preprocessors: {
    'tests/*-test.js': 'browserify',
    'tests/browser/*-test.js': 'browserify'
  },
  reporters: ['mocha'],
  browsers: ['ChromeHeadless']
};
