# React Fastclick [![CircleCI](https://circleci.com/gh/JakeSidSmith/react-fastclick.svg?style=svg)](https://circleci.com/gh/JakeSidSmith/react-fastclick)
**Instantly make your desktop / hybrid apps more responsive on touch devices.**

React Fastclick automatically adds fastclick touch events to elements with onClick attributes (and those that require special functionality, such as inputs) to prevent the delay that occurs on some touch devices.

## Installation

Use npm to install react-fastclick

```
npm install react-fastclick
```

## Usage

Initialize `react-fastclick` in your main javascript file before any of your components are created, and you're done.

Now any calls to onClick  or elements with special functionality, such as inputs, will have fast touch events added automatically - no need to write any additional listeners.

**ES6**

```javascript
import initReactFastclick from 'react-fastclick';
initReactFastclick();
```

**ES5**

```javascript
var initReactFastclick = require('react-fastclick');
initReactFastclick();
```

## Notes

1. The event triggered on touch devices is a modified `touchend` event. This means that it may have some keys that are unusual for a click event.

  In order to simulate a click as best as possible, this event is populated with the following keys / values. All positions are taken from the last know touch position.

  ```javascript
  {
    // Simulate left click
    button: 0,
    type: 'click',
    // Additional key to tell the difference between
    // a regular click and a flastclick
    fastclick: true,
    // From touch positions
    clientX,
    clientY,
    pageX,
    pageY,
    screenX,
    screenY
  }
  ```

2. On some devices the elements flicker after being touched. This can be prevented by setting the css property `-webkit-tap-highlight-color` to transparent.
Either target `html, body` (to prevent the flickering on all elements) or target the specific element you don't want to flicker e.g. `button`.

    ```css
    html, body {
      -webkit-tap-highlight-color: transparent;
    }
    ```

## Support

React Fastclick 3.x.x has been tested with React 15, but should support older versions also.
