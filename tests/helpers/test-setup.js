'use strict';

(function () {

  var jsdom = require('jsdom');
  var chai = require('chai');
  var sinonChai = require('sinon-chai');

  // Jsdom document & window
  var doc = jsdom.jsdom('<!doctype html><html><body><div id="app"></div></body></html>');
  var win = doc.defaultView;

  // Add to global
  global.document = doc;
  global.window = win;

  // Add window keys to global window
  for (var key in window) {
    if (!(key in global)) {
      global[key] = window[key];
    }
  }

  chai.expect();
  chai.use(sinonChai);

})();
