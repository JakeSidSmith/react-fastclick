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

  // Create new listen method
  EventListener.listen = function (target, eventType, callback) {
    if (eventType === 'click') {
      var downPos;
      var touchedTimeout;
      var moved = false;
      var touched = false;

      var onTouchEnd = function (event) {
        // Remove touch listeners
        if (window.removeEventListener) {
          window.removeEventListener(constants.touchend, onTouchEnd);
          window.removeEventListener(constants.touchmove, onTouchMove);
        } else if (window.detachEvent) {
          window.detachEvent('on' + constants.touchend, onTouchEnd);
          window.detachEvent('on' + constants.touchmove, onTouchMove);
        }

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
        if (window.addEventListener) {
          window.addEventListener(constants.touchend, onTouchEnd);
          window.addEventListener(constants.touchmove, onTouchMove);
        } else if (window.attachEvent) {
          window.attachEvent('on' + constants.touchend, onTouchEnd);
          window.attachEvent('on' + constants.touchmove, onTouchMove);
        }
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

      if (target.addEventListener) {
        target.addEventListener(constants.touchstart, onTouchStart, false);
        return {
          remove: function () {
            // Remove oriringal click listeners
            originalListener();
            target.removeEventListener(constants.touchstart, onTouchStart, false);
          }
        };
      } else if (target.attachEvent) {
        target.attachEvent('on' + constants.touchstart, onTouchStart);
        return {
          remove: function () {
            // Remove oriringal click listeners
            originalListener();
            target.detachEvent('on' + constants.touchstart, onTouchStart);
          }
        };
      }
    } else {
      return listen(target, eventType, callback);
    }
  };

})();
