'use strict';

(function () {

  var ReactDOM = require('react-dom');

  module.exports = function renderIntoApp (component) {
    return ReactDOM.render(component, document.getElementById('app'));
  };

})();
