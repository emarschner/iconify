!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.iconify=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

var Main = module.exports = _dereq_('../core')({
  $: $,
  DOMParser: DOMParser,
  XMLSerializer: XMLSerializer,
  btoa: btoa,
  fetchSvg: function(location, options) {
    var fetched = $.Deferred(),
        ajaxSettings = $.extend({}, options);

    Object.keys(Main.load.defaultOptions).forEach(function(key) {
      delete ajaxSettings[key];
    });

    $.ajax(location, ajaxSettings).then(function(data, status, xhr) {
      var xml = xhr.responseXML;

      fetched.resolve(xml instanceof Document && xml.documentElement ||
          (typeof options.decode === 'function' ? options.decode(data) : xhr.responseText));
    }).fail(function(xhr, status, error) {
      fetched.reject(error);
    });

    return fetched;
  },
  writeRules: function(rules, options) {
    var style = document.createElement('style');

    style.className = options.family + ' icons';
    document.head.appendChild(style);

    var styleSheet = style.sheet,
        cssRules = styleSheet.cssRules;

    for (var iconName in rules.icons) {
      styleSheet.insertRule(rules.icons[iconName], cssRules.length);
    }

    rules.family.forEach(function(rule) {
      styleSheet.insertRule(rule, cssRules.length);
    });
  }
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../core":2}],2:[function(_dereq_,module,exports){
// Module dependencies that must be defined (aka "injected") when used:
var $, DOMParser, XMLSerializer, btoa, fetchSvg, writeRules;

function Main(el) {
  var $el = el instanceof $ ? el : $(el);

  if ($el.hasClass('inline')) {
    return $el;
  }

  var classList = $el.attr('class').split(/\s+/),
      families = Main[familiesProp],
      foundFamily;

  if (classList.some(function(className) {
    foundFamily = className;
    return families[className];
  })) {
    var familyIcons = families[foundFamily][iconsProp];

    if (classList.some(function(className) {
      return familyIcons[className];
    })) {
      var iconData = $el.css('-webkit-mask-box-image-source'),
          decode = iconData.match(/;(.*),/)[1] === 'base64' ? atob : decodeURI,
          encodedSvg = iconData.match(/;.*,(.*)\)/)[1],
          $svg = $(decode(encodedSvg)).attr({ width: '100%', height: '100%' });

      return $el.addClass('inline').append($svg);
    } else {
      throw new MainError('Cannot match element to icon from family: ' + foundFamily, {
        family: foundFamily,
        el: $el[0]
      });
    }
  } else {
    throw new MainError('Cannot match element to any loaded family of icons', { el: $el[0] });
  };
};

Main.load = function(svg, options) {
  options = $.extend({}, Main.load.defaultOptions, options);

  var svgLoad = $.Deferred(),
      finish = $.Deferred(),
      ruleSelectorPrefix = '.' + options.family,
      dataUriFormat = options.dataUriFormat,
      encodeUriData = options.dataUriFormat === 'base64' ? btoa : encodeURI;

  function generateIconRule(el) {
    var viewBox = (el.viewBox && el.viewBox.baseVal) || { width: 8, height: 8 },
        content = '';

    if (el.firstChild != null) {
      var childNode = el.firstChild;

      do {
        content += xmlToString(childNode);
        childNode = childNode.nextSibling;
      } while (childNode != null);
    } else {
      content = xmlToString(el);
    }

    return ruleSelectorPrefix + '.' + $(el).attr('id') +
        '{-webkit-mask-box-image-source:url(data:image/svg+xml;' + dataUriFormat + ',' +
        encodeUriData(xmlToString($('<svg>').attr({
          xmlns: 'http://www.w3.org/2000/svg',
          width: viewBox.width,
          height: viewBox.height,
          viewBox: [0, 0, viewBox.width, viewBox.height].join(' ')
        }).html(content)[0])) + ');}';
  }

  try {
    svgLoad.resolve(parseSvg(svg));
  } catch (e) {
    if (e instanceof ParseError) {
      fetchSvg(svg, options).then(function(svgDoc) {
        try {
          svgLoad.resolve(typeof svgDoc === 'string' ? parseSvg(svgDoc) : svgDoc);
        } catch (e) {
          finish.reject(e);
        }
      }).fail(function(fetchError) {
        finish.reject(new MainError('Could not load icons', {
          src: svg,
          errors: [e, fetchError]
        }));
      });
    } else {
      finish.reject(e);
    }
  }

  svgLoad.then(function(svg) {
    var $icons = $(svg).find('*').filter(function(index, el) {
      var $el = $(el);

      return $el.attr('id') && $el.parents().toArray().some(function(parent) {
        return !$(parent).attr('id');
      });
    });

    if ($icons.length === 0 && options.name) {
      $icons = $(svg).attr('id', options.name);
    }

    if ($icons.length === 0) {
      return finish.reject(new Main.Error('No icons found. Maybe specify a name?', {
        svg: xmlToString(svg),
        name: options.name
      }));
    }

    function ruleFromObject(selector, obj) {
      var ruleString = selector + '{';

      for (var propName in obj) {
        ruleString += propName + ':' + obj[propName] + ';';
      }

      return ruleString + '}';
    }

    writeRules({
      family: [

        // Main family rule
        ruleFromObject(ruleSelectorPrefix, $.extend({ 'display': 'inline-block' }, options.css)),

        // Rule for inlined icons from family
        ruleFromObject('.inline' + ruleSelectorPrefix, {
          'background-color': 'transparent',
          '-webkit-mask-box-image-source': 'none'
        }),

        // Rule for inlined SVG element from family
        ruleFromObject('.inline' + ruleSelectorPrefix + ' svg', { 'display': 'block' })
      ],
      icons: $icons.toArray().reduce(function(icons, el) {
        icons[$(el).attr('id')] = generateIconRule(el);
        return icons;
      }, (Main[familiesProp][options.family] = {})[iconsProp] = {})
    }, options);

    finish.resolve();
  });

  return finish;
}

Main.load.defaultOptions = {
  dataUriFormat: 'base64',
  decode: null,
  family: 'icon',
  name: null,
  css: null,
  output: null
};

var familiesProp = '__families__',
    iconsProp = '__icons__';

Main[familiesProp] = {};

var MainError = Main.Error = function(message, details) {
  this.message = message;
  this.details = details;
};

MainError.prototype = new Error();

var ParseError = function() {
  MainError.apply(this, arguments);
}

ParseError.prototype = new MainError();

// Some Utilities:

function parseSvg(svg) {
  if (typeof svg !== 'string') {
    throw new TypeError('Failed to parse non-string target: ' + JSON.stringify(svg));
  }

  var doc = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;

  if (doc == null || doc.getElementsByTagName('parsererror').length !== 0) {
    throw new ParseError('Invalid SVG and/or XML', { src: svg, result: doc });
  } else if (!/svg/i.test(doc.tagName)) {
    throw new MainError('Parsed XML is not SVG', { src: svg, result: doc });
  } else {
    return doc;
  }
};

function xmlToString(node) {
  return new XMLSerializer().serializeToString(node);
}

// Don't export module itself, but rather the means to define (aka "inject") module dependencies:
module.exports = function(deps) {
  var unmetDeps = [];

  ['$', 'DOMParser', 'XMLSerializer', 'btoa', 'fetchSvg', 'writeRules'].forEach(function(name) {
    if ((deps || {})[name] === undefined) {
      unmetDeps.push(name);
    }
  });

  if (unmetDeps.length !== 0) {
    throw new Error('Unmet dependency(-ies): ' + unmetDeps.join(', '), { deps: deps });
  }

  $ = deps.$
  DOMParser = deps.DOMParser;
  XMLSerializer = deps.XMLSerializer;
  btoa = deps.btoa;
  fetchSvg = deps.fetchSvg;
  writeRules = deps.writeRules;

  return Main;
};

},{}]},{},[1])
(1)
});