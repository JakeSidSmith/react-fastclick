'use strict';

(function () {

  var React = require('react');

  var originalCreateElement = React.createElement;

  // Moved if Math.abs(downX - upX) > MOVE_THRESHOLD;
  var MOVE_THRESHOLD = 8;
  var TOUCH_DELAY = 1000;

  var touchKeysToStore = [
    'clientX',
    'clientY',
    'pageX',
    'pageY',
    'screenX',
    'screenY',
    'radiusX',
    'radiusY'
  ];

  var touchEvents = {
    downPos: {},
    lastPos: {}
  };

  var isDisabled = function (element) {
    if (!element) {
      return false;
    }
    var disabled = element.getAttribute('disabled');

    return disabled !== false && disabled !== null;
  };

  var focus = function (event, target) {
    var myTarget = target || event.currentTarget;

    if (!myTarget || isDisabled(myTarget)) {
      return;
    }

    myTarget.focus();
  };

  var handleType = {
    input: function (event) {
      focus(event);
      event.stopPropagation();
    },
    textarea: function (event) {
      focus(event);
      event.stopPropagation();
    },
    select: function (event) {
      focus(event);
      event.stopPropagation();
    },
    label: function (event) {
      var input;

      var forTarget = event.currentTarget.getAttribute('for');

      if (forTarget) {
        input = document.getElementById(forTarget);
      } else {
        input = event.currentTarget.querySelectorAll('input, textarea, select')[0];
      }

      if (input) {
        focus(event, input);
      }
    }
  };

  var fakeClickEvent = function (event) {
    if (typeof event.persist === 'function') {
      event.persist();
    }

    event.fastclick = true;
    event.type = 'click';
    event.button = 0;
  };

  var copyTouchKeys = function (touch, target) {
    if (typeof target.persist === 'function') {
      target.persist();
    }

    if (touch) {
      for (var i = 0; i < touchKeysToStore.length; i += 1) {
        var key = touchKeysToStore[i];
        target[key] = touch[key];
      }
    }
  };

  var noTouchHappened = function () {
    return !touchEvents.touched && (
      !touchEvents.lastTouchDate || new Date().getTime() > touchEvents.lastTouchDate + TOUCH_DELAY
    );
  };

  var invalidateIfMoreThanOneTouch = function (event) {
    touchEvents.invalid = event.touches && event.touches.length > 1 || touchEvents.invalid;
  };

  var onMouseEvent = function (callback, event) {
    // Prevent any mouse events if we touched recently
    if (typeof callback === 'function' && noTouchHappened()) {
      callback(event);
    }
    if (event.type === 'click') {
      touchEvents.invalid = false;
      touchEvents.touched = false;
      touchEvents.moved = false;
    }
  };

  var onTouchStart = function (callback, event) {
    touchEvents.invalid = false;
    touchEvents.moved = false;
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();

    copyTouchKeys(event.touches[0], touchEvents.downPos);
    copyTouchKeys(event.touches[0], touchEvents.lastPos);

    invalidateIfMoreThanOneTouch(event);

    if (typeof callback === 'function') {
      callback(event);
    }
  };

  var onTouchMove = function (callback, event) {
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();

    copyTouchKeys(event.touches[0], touchEvents.lastPos);

    invalidateIfMoreThanOneTouch(event);

    if (Math.abs(touchEvents.downPos.clientX - touchEvents.lastPos.clientX) > MOVE_THRESHOLD ||
      Math.abs(touchEvents.downPos.clientY - touchEvents.lastPos.clientY) > MOVE_THRESHOLD) {
      touchEvents.moved = true;
    }

    if (typeof callback === 'function') {
      callback(event);
    }
  };

  var onTouchEnd = function (callback, onClick, type, event) {
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();

    invalidateIfMoreThanOneTouch(event);

    if (typeof callback === 'function') {
      callback(event);
    }

    if (!touchEvents.invalid && !touchEvents.moved) {
      var box = event.currentTarget.getBoundingClientRect();

      if (touchEvents.lastPos.clientX - (touchEvents.lastPos.radiusX || 0) <= box.right &&
        touchEvents.lastPos.clientX + (touchEvents.lastPos.radiusX || 0) >= box.left &&
        touchEvents.lastPos.clientY - (touchEvents.lastPos.radiusY || 0) <= box.bottom &&
        touchEvents.lastPos.clientY + (touchEvents.lastPos.radiusY || 0) >= box.top) {

        if (!isDisabled(event.currentTarget)) {
          if (typeof onClick === 'function') {
            copyTouchKeys(touchEvents.lastPos, event);
            fakeClickEvent(event);
            onClick(event);
          }

          if (!event.defaultPrevented && handleType[type]) {
            handleType[type](event);
          }
        }
      }
    }
  };

  var propsWithFastclickEvents = function (type, props) {
    var newProps = {};

    // Loop over props
    for (var key in props) {
      // Copy props to newProps
      newProps[key] = props[key];
    }

    // Apply our wrapped mouse and touch handlers
    newProps.onClick = onMouseEvent.bind(null, props.onClick);
    newProps.onMouseDown = onMouseEvent.bind(null, props.onMouseDown);
    newProps.onMouseMove = onMouseEvent.bind(null, props.onMouseMove);
    newProps.onMouseUp = onMouseEvent.bind(null, props.onMouseUp);
    newProps.onTouchStart = onTouchStart.bind(null, props.onTouchStart);
    newProps.onTouchMove = onTouchMove.bind(null, props.onTouchMove);
    newProps.onTouchEnd = onTouchEnd.bind(null, props.onTouchEnd, props.onClick, type);

    if (typeof Object.freeze === 'function') {
      Object.freeze(newProps);
    }

    return newProps;
  };

  React.createElement = function () {
    // Convert arguments to array
    var args = Array.prototype.slice.call(arguments);

    var type = args[0];
    var props = args[1];

    // Check if basic element & has onClick prop
    if (type && typeof type === 'string' && (
      (props && typeof props.onClick === 'function') || handleType[type]
    )) {
      // Add our own events to props
      args[1] = propsWithFastclickEvents(type, props || {});
    }

    // Apply args to original createElement function
    return originalCreateElement.apply(null, args);
  };

  if (typeof React.DOM === 'object') {
    for (var key in React.DOM) {
      React.DOM[key] = React.createElement.bind(null, key);
    }
  }

})();
