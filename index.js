'use strict';

(function () {

  var React = require('react');

  var originalCreateElement = React.createElement;

  var addListener = function (target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback, false);
    }
  };

  var removeListener = function (target, eventType, callback) {
    if (target.removeEventListener) {
      target.removeEventListener(eventType, callback, false);
    } else if (target.detachEvent) {
      target.detachEvent('on' + eventType, callback, false);
    }
  };

  // Moved if Math.abs(downX - upX) > MOVE_THRESHOLD;
  var MOVE_THRESHOLD = 8;
  var TOUCH_DELAY = 1000;

  var touchEvents = {};

  var FastClickWrapper = React.createClass({
    noTouchHappened: function () {
      return !touchEvents.touched || new Date().getDate() > touchEvents.lastTouchDate + TOUCH_DELAY;
    },

    invalidateIfMoreThanOneTouch: function (event) {
      touchEvents.invalid = event.touches && event.touches.length > 1 || touchEvents.invalid;
    },

    onMouseEvent: function (callback, event) {
      console.log('mouse event wrapper', event.type);

      // Prevent original click if we touched recently
      if (typeof callback === 'function' && this.noTouchHappened()) {
        callback(event);
      }
      if (event.type === 'click') {
        touchEvents.invalid = false;
        touchEvents.touched = false;
      }
    },

    onTouchStart: function (event) {
      console.log('onTouchStart wrapper');

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
      this.invalidateIfMoreThanOneTouch(event);

      if (typeof this.props.props.onTouchStart === 'function') {
        this.props.props.onTouchStart(event);
      }

      this.addListeners();
    },

    onTouchMoveWindow: function (event) {
      console.log('onTouchMove wrapper');

      touchEvents.touched = true;
      touchEvents.lastTouchDate = new Date().getTime();
      touchEvents.lastPos = {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY
      };
      this.invalidateIfMoreThanOneTouch(event);
    },

    onTouchEndWindow: function (event) {
      console.log('onTouchEnd wrapper');

      touchEvents.touched = true;
      touchEvents.lastTouchDate = new Date().getTime();
      this.invalidateIfMoreThanOneTouch(event);

      this.removeListeners();
    },

    onTouchEnd: function (callback, event) {
      console.log('onTouchEnd wrapper');

      touchEvents.touched = true;
      touchEvents.lastTouchDate = new Date().getTime();
      this.invalidateIfMoreThanOneTouch(event);

      if (!touchEvents.invalid &&
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
          this.props.props.onClick(event);
        }
      }

      this.removeListeners();
    },

    onCancel: function () {
      console.log('Cancel');

      touchEvents.touched = true;
      touchEvents.lastTouchDate = new Date().getTime();

      this.removeListeners();
    },

    addListeners: function () {
      addListener(window, 'touchmove', this.onTouchMoveWindow);
      addListener(window, 'touchend', this.onTouchEndWindow);
      addListener(window, 'touchcancel', this.onCancel);
      addListener(window, 'contextmenu', this.onCancel);
    },

    removeListeners: function () {
      removeListener(window, 'touchmove', this.onTouchMoveWindow);
      removeListener(window, 'touchend', this.onTouchEndWindow);
      removeListener(window, 'touchcancel', this.onCancel);
      removeListener(window, 'contextmenu', this.onCancel);
    },

    componentWillUnmount: function () {
      this.removeListeners();
    },

    render: function () {
      var props = this.props.props;
      var newProps = {};

      // Loop over props
      for (var key in props) {
        // Copy most props to newProps
        newProps[key] = props[key];
      }

      // Apply our wrapped mouse and touch handlers
      newProps.onClick = this.onMouseEvent.bind(this, props.onClick);
      newProps.onMouseDown = this.onMouseEvent.bind(this, props.onMouseDown);
      newProps.onMouseMove = this.onMouseEvent.bind(this, props.onMouseMove);
      newProps.onMouseUp = this.onMouseEvent.bind(this, props.onMouseUp);
      newProps.onTouchStart = this.onTouchStart;
      newProps.onTouchEnd = this.onTouchEnd.bind(this, props.onTouchEnd);

      // Apply original type, newProps and original children to original createElement function
      return originalCreateElement.apply(
        null,
        [this.props.type, newProps].concat(this.props.children)
      );
    }
  });

  React.createElement = function () {
    // Convert arguments to array
    var args = Array.prototype.slice.call(arguments);

    var type = args[0];
    var props = args[1];

    // Check if basic element & has onClick prop
    if (type && typeof type === 'string' &&
      props && typeof props.onClick === 'function') {
      // Push type and props into props
      args[1] = {
        type: type,
        props: props
      };
      // Replace type with FastClick
      args[0] = FastClickWrapper;
    }

    // Apply args to original createElement function
    return originalCreateElement.apply(null, args);
  };

})();
