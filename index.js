'use strict';

(function () {

  var React = require('react');

  var originalCreateElement = React.createElement;

  // Moved if Math.abs(downX - upX) > MOVE_THRESHOLD;
  var MOVE_THRESHOLD = 8;
  var TOUCH_DELAY = 1000;

  var touchEvents = {};

  var noTouchHappened = function () {
    return !touchEvents.touched || new Date().getDate() > touchEvents.lastTouchDate + TOUCH_DELAY;
  };

  var invalidateIfMoreThanOneTouch = function (event) {
    touchEvents.invalid = event.touches && event.touches.length > 1 || touchEvents.invalid;
  };

  var onMouseEvent = function (callback, event) {
    // Prevent original click if we touched recently
    if (typeof callback === 'function' && noTouchHappened()) {
      callback(event);
    }
    if (event.type === 'click') {
      touchEvents.invalid = false;
      touchEvents.touched = false;
    }
  };

  var onTouchStart = function (callback, event) {
    touchEvents.moved = false;
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();
    touchEvents.downPos = {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY
    };
    touchEvents.lastPos = {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY
    };
    touchEvents.invalid = false;
    invalidateIfMoreThanOneTouch(event);

    if (typeof callback === 'function') {
      callback(event);
    }
  };

  var onTouchMove = function (callback, event) {
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();
    touchEvents.lastPos = {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY
    };
    invalidateIfMoreThanOneTouch(event);

    if (!touchEvents.invalid &&
      Math.abs(touchEvents.downPos.clientX - touchEvents.lastPos.clientX) > MOVE_THRESHOLD ||
      Math.abs(touchEvents.downPos.clientY - touchEvents.lastPos.clientY) > MOVE_THRESHOLD) {
      touchEvents.moved = true;
    }

    if (typeof callback === 'function') {
      callback(event);
    }
  };

  var onTouchEnd = function (callback, onClick, event) {
    touchEvents.touched = true;
    touchEvents.lastTouchDate = new Date().getTime();
    invalidateIfMoreThanOneTouch(event);

    if (!touchEvents.invalid && !touchEvents.moved &&
      Math.abs(touchEvents.downPos.clientX - touchEvents.lastPos.clientX) <= MOVE_THRESHOLD &&
      Math.abs(touchEvents.downPos.clientY - touchEvents.lastPos.clientY) <= MOVE_THRESHOLD) {
      if (typeof callback === 'function') {
        callback(event);
      }

      var box = event.target.getBoundingClientRect();
      if (touchEvents.lastPos.clientX <= box.right &&
        touchEvents.lastPos.clientX >= box.left &&
        touchEvents.lastPos.clientY <= box.bottom &&
        touchEvents.lastPos.clientY >= box.top) {
        onClick(event);
      }
    }
  };

  var propsWithFastclickEvents = function (props) {
    var newProps = {};

    // Loop over props
    for (var key in props) {
      // Copy most props to newProps
      newProps[key] = props[key];
    }

    // Apply our wrapped mouse and touch handlers
    newProps.onClick = onMouseEvent.bind(null, props.onClick);
    newProps.onMouseDown = onMouseEvent.bind(null, props.onMouseDown);
    newProps.onMouseMove = onMouseEvent.bind(null, props.onMouseMove);
    newProps.onMouseUp = onMouseEvent.bind(null, props.onMouseUp);
    newProps.onTouchStart = onTouchStart.bind(null, props.onTouchStart);
    newProps.onTouchMove = onTouchMove.bind(null, props.onTouchMove);
    newProps.onTouchEnd = onTouchEnd.bind(null, props.onTouchEnd, props.onClick);

    return newProps;
  };

  React.createElement = function () {
    // Convert arguments to array
    var args = Array.prototype.slice.call(arguments);

    var type = args[0];
    var props = args[1];

    // Check if basic element & has onClick prop
    if (type && typeof type === 'string' &&
      props && typeof props.onClick === 'function') {
      // Push type and props into props
      args[1] = propsWithFastclickEvents(props);
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
