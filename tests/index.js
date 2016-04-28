'use strict';

var expect = require('chai').expect;

describe('react-fastclick', function () {

  it('should redefine React.createElement', function () {
    var originalCreateElement = require('react').createElement;
    var theSameCreateElement = require('react').createElement;

    expect(originalCreateElement).to.equal(theSameCreateElement);

    require('../lib/index');
    var redefinedCreateElement = require('react').createElement;

    expect(originalCreateElement).not.to.equal(redefinedCreateElement);
  });

});
