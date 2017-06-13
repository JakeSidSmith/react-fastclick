'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;
var TestUtils = require('react-addons-test-utils');
var renderIntoApp = require('./helpers/render-into-app');

describe('react-fastclick', function () {

  var originalCreateElement, fastclickCreateElement;

  function handlerKeyToSimulatedEventKey (key) {
    var simulatedEventKey = key.replace(/^on/, '');
    return simulatedEventKey.charAt(0).toLowerCase() + simulatedEventKey.substring(1);
  }

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
    delete require.cache[require.resolve('../src/index')];
  });

  it('should redefine React.createElement', function () {
    originalCreateElement = require('react').createElement;
    var theSameCreateElement = require('react').createElement;

    expect(originalCreateElement).to.equal(theSameCreateElement);

    require('../src/index')();
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

      var node = renderIntoApp(fastclickCreateElement('div', props));

      for (var key in props) {
        var mouseEvent = handlerKeyToSimulatedEventKey(key);

        TestUtils.Simulate[mouseEvent](node);

        expect(props[key]).to.have.been.calledOnce;
      }
    });

    it('should not prevent default on same target', function () {
      var event = {
        target: 'target',
        touches: [],
        preventDefault: spy()
      };

      var props = {
        onTouchStart: spy(),
        onTouchMove: spy(),
        onTouchEnd: spy(),
        onMouseDown: spy(),
        onMouseMove: spy(),
        onMouseUp: spy(),
        onClick: spy()
      };

      var node = renderIntoApp(fastclickCreateElement('div', props));

      for (var key in props) {
        var eventType = handlerKeyToSimulatedEventKey(key);

        TestUtils.Simulate[eventType](node, event);

        if (eventType.indexOf('touch') >= 0) {
          expect(props[key]).to.have.been.calledOnce;
        } else {
          expect(props[key]).not.to.have.been.called;
        }
      }

      expect(event.preventDefault.callCount).to.equal(0);
    });

    it('should prevent default on different target', function () {
      var event1 = {
        target: 'target1',
        touches: [],
        preventDefault: spy()
      };

      var event2 = {
        target: 'target2',
        touches: [],
        preventDefault: spy()
      };

      var props = {
        onTouchStart: spy(),
        onTouchMove: spy(),
        onTouchEnd: spy(),
        onMouseDown: spy(),
        onMouseMove: spy(),
        onMouseUp: spy(),
        onClick: spy()
      };

      var node = renderIntoApp(fastclickCreateElement('div', props));

      for (var key in props) {
        var eventType = handlerKeyToSimulatedEventKey(key);

        if (eventType.indexOf('touch') >= 0) {
          TestUtils.Simulate[eventType](node, event1);
          expect(props[key]).to.have.been.calledOnce;
        } else {
          TestUtils.Simulate[eventType](node, event2);
          expect(props[key]).not.to.have.been.called;
        }
      }

      expect(event1.preventDefault.callCount).to.equal(0);
      expect(event2.preventDefault.callCount).to.equal(4);
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

      var node = renderIntoApp(fastclickCreateElement('div', props));

      for (var key in props) {
        if (key !== 'onClick') {
          var touchEvent = handlerKeyToSimulatedEventKey(key);

          TestUtils.Simulate[touchEvent](node, {touches: [{}]});

          expect(props[key]).to.have.been.calledOnce;
        }
      }
    });

    it('should trigger the click handler when a fastclick happens', function () {
      var props = {
        onClick: spy()
      };

      var node = renderIntoApp(fastclickCreateElement('div', props));

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
          touches: null
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

    it('should not trigger the click handler if multiple touches', function () {
      var props = {
        onClick: spy()
      };

      var node = renderIntoApp(fastclickCreateElement('div', props));

      var getBoundingClientRectStub = stub(node, 'getBoundingClientRect', getBoundingClientRect);

      TestUtils.Simulate.touchStart(
        node,
        {
          type: 'touchstart',
          touches: [touches[0], touches[0]]
        }
      );

      TestUtils.Simulate.touchEnd(
        node,
        {
          type: 'touchend',
          touches: null
        }
      );

      expect(props.onClick).not.to.have.been.called;

      TestUtils.Simulate.click(
        node,
        {
          type: 'click'
        }
      );

      expect(props.onClick).not.to.have.been.called;

      getBoundingClientRectStub.restore();
    });

    it('should not trigger the click handler if touch moves', function () {
      var props = {
        onClick: spy()
      };

      var node = renderIntoApp(fastclickCreateElement('div', props));

      var getBoundingClientRectStub = stub(node, 'getBoundingClientRect', getBoundingClientRect);

      TestUtils.Simulate.touchStart(
        node,
        {
          type: 'touchstart',
          touches: touches
        }
      );

      TestUtils.Simulate.touchMove(
        node,
        {
          type: 'touchmove',
          touches: [
            {
              clientX: 60,
              clientY: 50
            }
          ]
        }
      );

      TestUtils.Simulate.touchEnd(
        node,
        {
          type: 'touchend',
          touches: null
        }
      );

      expect(props.onClick).not.to.have.been.called;

      TestUtils.Simulate.click(
        node,
        {
          type: 'click'
        }
      );

      expect(props.onClick).not.to.have.been.called;

      getBoundingClientRectStub.restore();
    });

    it('should not trigger the click handler if touch is outside of the element', function () {
      var props = {
        onClick: spy()
      };

      var node = renderIntoApp(fastclickCreateElement('div', props));

      var getBoundingClientRectStub = stub(node, 'getBoundingClientRect', getBoundingClientRect);

      TestUtils.Simulate.touchStart(
        node,
        {
          type: 'touchstart',
          touches: [
            {
              clientX: 80,
              clientY: 80
            }
          ]
        }
      );

      TestUtils.Simulate.touchEnd(
        node,
        {
          type: 'touchend',
          touches: null
        }
      );

      expect(props.onClick).not.to.have.been.called;

      TestUtils.Simulate.click(
        node,
        {
          type: 'click'
        }
      );

      expect(props.onClick).not.to.have.been.called;

      getBoundingClientRectStub.restore();
    });

  });

  describe('special elements', function () {

    it('should focus inputs, selects, and textareas when a fastclick is triggered', function () {
      var node, getBoundingClientRectStub, focusSpy;

      for (var i = 0; i < specialTypes.length; i += 1) {
        var type = specialTypes[i];

        if (type !== 'label') {
          node = renderIntoApp(fastclickCreateElement(type));

          getBoundingClientRectStub = stub(node, 'getBoundingClientRect', getBoundingClientRect);
          focusSpy = spy(node, 'focus');

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
              touches: null
            }
          );

          expect(focusSpy).to.have.been.calledOnce;

          TestUtils.Simulate.click(
            node,
            {
              type: 'click'
            }
          );

          expect(focusSpy).to.have.been.calledOnce;

          getBoundingClientRectStub.restore();
          focusSpy.restore();
        }
      }
    });

    it('should not focus inputs, selects, and textareas if they are disabled', function () {
      var node, getBoundingClientRectStub, focusSpy;

      for (var i = 0; i < specialTypes.length; i += 1) {
        var type = specialTypes[i];

        if (type !== 'label') {
          node = renderIntoApp(fastclickCreateElement(type, {disabled: true}));

          getBoundingClientRectStub = stub(node, 'getBoundingClientRect', getBoundingClientRect);
          focusSpy = spy(node, 'focus');

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
              touches: null
            }
          );

          expect(focusSpy).not.to.have.been.called;

          TestUtils.Simulate.click(
            node,
            {
              type: 'click'
            }
          );

          expect(focusSpy).not.to.have.been.called;

          getBoundingClientRectStub.restore();
          focusSpy.restore();
        }
      }
    });

    it('should focus an input inside a label', function () {
      var node = renderIntoApp(
        fastclickCreateElement('label', null, fastclickCreateElement('input'))
      );
      var label = node;
      var input = label.getElementsByTagName('input')[0];

      var getBoundingClientRectStub = stub(label, 'getBoundingClientRect', getBoundingClientRect);
      var focusSpy = spy(input, 'focus');

      TestUtils.Simulate.touchStart(
        label,
        {
          type: 'touchstart',
          touches: touches
        }
      );

      TestUtils.Simulate.touchEnd(
        label,
        {
          type: 'touchend',
          touches: null
        }
      );

      expect(focusSpy).to.have.been.calledOnce;

      TestUtils.Simulate.click(
        label,
        {
          type: 'click'
        }
      );

      expect(focusSpy).to.have.been.calledOnce;

      getBoundingClientRectStub.restore();
      focusSpy.restore();
    });

    it('should not focus a disabled input inside a label', function () {
      var node = renderIntoApp(
        fastclickCreateElement('label', null, fastclickCreateElement('input', {disabled: true}))
      );
      var label = node;
      var input = label.getElementsByTagName('input')[0];

      var getBoundingClientRectStub = stub(label, 'getBoundingClientRect', getBoundingClientRect);
      var focusSpy = spy(input, 'focus');

      TestUtils.Simulate.touchStart(
        label,
        {
          type: 'touchstart',
          touches: touches
        }
      );

      TestUtils.Simulate.touchEnd(
        label,
        {
          type: 'touchend',
          touches: null
        }
      );

      expect(focusSpy).not.to.have.been.calledOnce;

      TestUtils.Simulate.click(
        label,
        {
          type: 'click'
        }
      );

      expect(focusSpy).not.to.have.been.calledOnce;

      getBoundingClientRectStub.restore();
      focusSpy.restore();
    });

    it('should focus an input for a label', function () {
      var node = renderIntoApp(
        fastclickCreateElement(
          'div',
          null,
          fastclickCreateElement('label', {htmlFor: 'my-input'}),
          fastclickCreateElement('input', {id: 'my-input'})
        )
      );

      var label = node.getElementsByTagName('label')[0];
      var input = node.getElementsByTagName('input')[0];

      var getBoundingClientRectStub = stub(label, 'getBoundingClientRect', getBoundingClientRect);
      var focusSpy = spy(input, 'focus');

      TestUtils.Simulate.touchStart(
        label,
        {
          type: 'touchstart',
          touches: touches
        }
      );

      TestUtils.Simulate.touchEnd(
        label,
        {
          type: 'touchend',
          touches: null
        }
      );

      expect(focusSpy).to.have.been.calledOnce;

      TestUtils.Simulate.click(
        label,
        {
          type: 'click'
        }
      );

      expect(focusSpy).to.have.been.calledOnce;

      getBoundingClientRectStub.restore();
      focusSpy.restore();
    });

    it('should not focus a disabled input for a label', function () {
      var node = renderIntoApp(
        fastclickCreateElement(
          'div',
          null,
          fastclickCreateElement('label', {htmlFor: 'my-input'}),
          fastclickCreateElement('input', {id: 'my-input', disabled: true})
        )
      );

      var label = node.getElementsByTagName('label')[0];
      var input = node.getElementsByTagName('input')[0];

      var getBoundingClientRectStub = stub(label, 'getBoundingClientRect', getBoundingClientRect);
      var focusSpy = spy(input, 'focus');

      TestUtils.Simulate.touchStart(
        label,
        {
          type: 'touchstart',
          touches: touches
        }
      );

      TestUtils.Simulate.touchEnd(
        label,
        {
          type: 'touchend',
          touches: null
        }
      );

      expect(focusSpy).not.to.have.been.calledOnce;

      TestUtils.Simulate.click(
        label,
        {
          type: 'click'
        }
      );

      expect(focusSpy).not.to.have.been.calledOnce;

      getBoundingClientRectStub.restore();
      focusSpy.restore();
    });

    it('should gracefully handle no input inside a label', function () {
      var node = renderIntoApp(fastclickCreateElement('label'));

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
          touches: null
        }
      );

      TestUtils.Simulate.click(
        node,
        {
          type: 'click'
        }
      );

      getBoundingClientRectStub.restore();
    });

    it('should gracefully handle no input for a label', function () {
      var node = renderIntoApp(fastclickCreateElement('label', {htmlFor: 'my-input'}));

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
          touches: null
        }
      );

      TestUtils.Simulate.click(
        node,
        {
          type: 'click'
        }
      );

      getBoundingClientRectStub.restore();
    });

  });

  describe('events', function () {

    it('should persist events if they are to be mutated', function () {
      var props = {
        onClick: spy()
      };
      var node = renderIntoApp(fastclickCreateElement('div', props));

      var getBoundingClientRectStub = stub(node, 'getBoundingClientRect', getBoundingClientRect);
      var persistSpy = spy();

      TestUtils.Simulate.touchStart(
        node,
        {
          type: 'touchstart',
          touches: touches,
          persist: persistSpy
        }
      );

      expect(persistSpy).not.to.have.been.called;

      TestUtils.Simulate.touchEnd(
        node,
        {
          type: 'touchend',
          touches: null,
          persist: persistSpy
        }
      );

      // Properties copied onto event from stored positions, and fake click event properties
      expect(persistSpy).to.have.been.calledTwice;
      persistSpy.reset();

      TestUtils.Simulate.click(
        node,
        {
          type: 'click',
          persist: persistSpy
        }
      );

      expect(persistSpy).not.to.have.been.called;
      expect(props.onClick).to.have.been.calledOnce;

      getBoundingClientRectStub.restore();
    });

  });

});
