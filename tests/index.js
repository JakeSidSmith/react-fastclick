'use strict';

var expect = require('chai').expect;
// var spy = require('sinon').spy;

describe('react-fastclick', function () {

  var originalCreateElement, redefinedCreateElement;

  var specialTypes = [
    'input',
    'textarea',
    'select',
    'label'
  ];

  var additionalProps = {
    onClick: function () {},
    onMouseDown: function () {},
    onMouseMove: function () {},
    onMouseUp: function () {},
    onTouchStart: function () {},
    onTouchMove: function () {},
    onTouchEnd: function () {}
  };

  beforeEach(function () {
    // Clear module cache
    delete require.cache[require.resolve('react')];
    delete require.cache[require.resolve('../lib/index')];
  });

  it('should redefine React.createElement', function () {
    originalCreateElement = require('react').createElement;
    var theSameCreateElement = require('react').createElement;

    expect(originalCreateElement).to.equal(theSameCreateElement);

    require('../lib/index');
    redefinedCreateElement = require('react').createElement;

    expect(originalCreateElement).not.to.equal(redefinedCreateElement);
  });

  describe('createElement', function () {

    it('should create a regular React element', function () {
      var element = redefinedCreateElement('div');

      expect(element).to.exist;
      expect(element.ref).to.be.null;
      expect(element.key).to.be.null;
      expect(element.type).to.equal('div');
      expect(element.props).to.eql({});
    });

    it('should add events if it is a special element', function () {
      var element;

      for (var i = 0; i < specialTypes.length; i += 1) {
        element = redefinedCreateElement(specialTypes[i]);

        for (var key in additionalProps) {
          expect(typeof element.props[key]).to.equal('function');
        }
      }
    });

    it('should add events if it has an onClick handler', function () {
      var element = redefinedCreateElement('div', {onClick: function () {}});

      for (var key in additionalProps) {
        expect(typeof element.props[key]).to.equal('function');
      }
    });

  });

});
