var $ = require('jquery')(require('jsdom').jsdom().parentWindow),
    fs = require('fs'),
    path = require('path'),
    xmldom = require('xmldom');

module.exports = require('../core')({
  $: $,
  DOMParser: xmldom.DOMParser,
  XMLSerializer: function() {
    this.serializeToString = function(node) {
      return new xmldom.XMLSerializer().serializeToString(node)

          // Hack to work around xmldom.XMLSerializer's use of node.tagName, which is always upper-
          // cased, which browsers don't seem to like when embedding SVGs as data URIs in CSS
          .replace(/<([^\/\s]+|\/[^>]+)/g, function(xml, tagName) {
            return '<' + tagName.toLowerCase();
          });
    };
  },
  btoa: require('btoa'),
  fetchSvg: function(location, options) {
    var fetched = $.Deferred();

    fs.readFile(location, function(err, data) {
      if (err != null) {
        return fetched.reject(err);
      }

      fetched.resolve(data.toString());
    });

    return fetched;
  },
  writeRules: function(rules, options) {
    var output = options.output;

    rules.forEach(function(rule) {
      output.write(rule + '\n');
    });

    if (output !== process.stdout) {
      output.end();
    }
  }
});