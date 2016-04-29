'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;
var TestUtils = require('react-addons-test-utils');
var ReactDOM = require('react-dom');

describe('react-fastclick', function () {

  var originalCreateElement, fastclickCreateElement;

  function handlerKeyToSimulatedEventKey (key) {
    var simulatedEventKey = key.replace(/^on/, '');
    return simulatedEventKey.charAt(0).toLowerCase() + simulatedEventKey.substring(1);
  }

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
    fastclickCreateElement = require('react').createElement;

    expect(originalCreateElement).not.to.equal(fastclickCreateElement);
  });

  describe('createElement', function () {

    it('should create a regular React element', function () {
      var element = fastclickCreateElement('div');

      expect(element).to.exist;
      expect(element.ref).to.be.null;
      expect(element.key).to.be.null;
      expect(element.type).to.equal('div');
      expect(element.props).to.eql({});
    });

    it('should add events if it is a special element', function () {
      var element;

      for (var i = 0; i < specialTypes.length; i += 1) {
        element = fastclickCreateElement(specialTypes[i]);

        for (var key in additionalProps) {
          expect(typeof element.props[key]).to.equal('function');
        }
      }
    });

    it('should add events if it has an onClick handler', function () {
      var element = fastclickCreateElement('div', {onClick: function () {}});

      for (var key in additionalProps) {
        expect(typeof element.props[key]).to.equal('function');
      }
    });

  });

  describe('mouse events', function () {

    it('should trigger standard mouse event handlers', function () {
      var props = {
        onMouseDown: spy(),
        onMouseMove: spy(),
        onMouseUp: spy(),
        onClick: spy()
      };

      var instance = TestUtils.renderIntoDocument(fastclickCreateElement('div', props));

      for (var key in props) {
        var mouseEvent = handlerKeyToSimulatedEventKey(key);

        TestUtils.Simulate[mouseEvent](instance);

        expect(props[key]).to.have.been.calledOnce;
      }
    });

  });

  describe('touch events', function () {

    it('should trigger standard touch event handlers', function () {
      var props = {
        onClick: function () {},
        onTouchStart: spy(),
        onTouchMove: spy(),
        onTouchEnd: spy()
      };

      var instance = TestUtils.renderIntoDocument(fastclickCreateElement('div', props));

      for (var key in props) {
        if (key !== 'onClick') {
          var touchEvent = handlerKeyToSimulatedEventKey(key);

          TestUtils.Simulate[touchEvent](instance, {touches: [{}]});

          expect(props[key]).to.have.been.calledOnce;
        }
      }
    });

    function getBoundingClientRect () {
      return {
        top: 25,
        left: 25,
        right: 75,
        bottom: 75,
        width: 50,
        height: 50
      };
    }

    var touches = [
      {
        clientX: 50,
        clientY: 50
      }
    ];

    it('should trigger the click handler when a fastclick happens', function () {
      var props = {
        style: {
          position: 'absolute',
          top: 25,
          left: 25,
          width: 50,
          height: 50
        },
        onClick: spy()
      };

      var instance = TestUtils.renderIntoDocument(fastclickCreateElement('div', props));
      var node = ReactDOM.findDOMNode(instance);

      var getBoundingClientRectStub = stub(node, 'getBoundingClientRect', getBoundingClientRect);

      TestUtils.Simulate.touchStart(
        node,
        {
          type: 'touchstart',
          touches: touches
        }
      );

      TestUtils.Simulate.touchEnd(
        node,
        {
          type: 'touchend',
          touches: touches
        }
      );

      expect(props.onClick).to.have.been.calledOnce;

      TestUtils.Simulate.click(
        node,
        {
          type: 'click'
        }
      );

      expect(props.onClick).to.have.been.calledOnce;

      getBoundingClientRectStub.restore();
    });

  });

});
