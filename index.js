'use strict';

(function () {

  var React = require('react');
  var EventListener = require('react/lib/EventListener');

  React.initializeTouchEvents(true);

  // Save original listen method
  var listen = EventListener.listen;

  var constants = {
    touchstart: 'touchstart',
    touchend: 'touchend',
    touchmove: 'touchmove',
    moveThreshold: 20
  };

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

  // Create new listen method
  EventListener.listen = function (target, eventType, callback) {
    if (eventType === 'click') {
      var downPos;
      var touchedTimeout;
      var moved = false;
      var touched = false;

      var onTouchEnd = function (event) {
        // Remove touch listeners
        removeListener(window, constants.touchend, onTouchEnd);
        removeListener(window, constants.touchmove, onTouchMove);

        if (!moved) {
          // If not moved - callback & prevent mouse events
          touched = true;
          // Reset touched flag after 500 millis
          touchedTimeout = setTimeout(function () {
            touched = false;
          }, 500);
          callback(event);
        }
      };

      var onTouchMove = function (event) {
        var touch = event.touches[0];
        // Check if touch has moved
        if (Math.abs(downPos.clientX - touch.clientX) >= constants.moveThreshold ||
          Math.abs(downPos.clientY - touch.clientY) >= constants.moveThreshold) {
          moved = true;
        }
      };

      var onTouchStart = function (event) {
        clearTimeout(touchedTimeout);
        var touch = event.touches[0];
        // Store initial touch position
        downPos = {
          clientX: touch.clientX,
          clientY: touch.clientY
        };
        // Reset moved flag
        moved = false;

        // Add touch listeners
        addListener(window, constants.touchend, onTouchEnd);
        addListener(window, constants.touchmove, onTouchMove);
      };

      // Wrap click callback
      var onClick = function (event) {
        // Do not call if touch has fired or mouse moved
        if (!touched && !moved) {
          callback(event);
        }
      };

      // Get original click listener remove function
      var originalListener = listen(target, eventType, onClick);

      addListener(target, constants.touchstart, onTouchStart);

      // Return remove listener functions
      return {
        remove: function () {
          if (originalListener && typeof originalListener.remove === 'function') {
            originalListener.remove();
          }
          removeListener(target, constants.touchstart, onTouchStart);
        }
      };
    } else {
      return listen(target, eventType, callback);
    }
  };

})();
