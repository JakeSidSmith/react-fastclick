# React Fastclick
[![Build Status](https://travis-ci.org/JakeSidSmith/react-fastclick.svg?branch=master)](https://travis-ci.org/JakeSidSmith/react-fastclick)

**Instantly make your desktop / hybrid apps more responsive on touch devices.**

React Fastclick automatically adds fastclick touch events to elements with onClick attributes to prevent the delay that occurs on some touch devices.

## Installation

Use npm to install react-fastclick

```
npm install react-fastclick
```

## Usage

Include react-fastclick in your main javascript file before any of your components are created, and you're done.

Now any calls to onClick will have fast touch events added automatically - no need to write any additional listeners.

Example:

```javascript
'use strict';

require('react-fastclick');
var React = require('react');

var App = React.createClass({
  logEventType: function (event) {
    console.log(event.type);
  },
  render: function() {
    return (
      <p onClick={this.logEventType}>
        Hello, world!
      </p>
    );
  }
});

React.render(<App />, document.body);
```

## Notes

1. The event triggered on touch devices is currently the same event for `touchend`, and will have `event.type` `touchend`. This also means that it wont have any mouse / touch coordinates (e.g. `event.touches`, `clientX`, `pageX`).

    I will be creating synthetic events for these shortly with the most recent touch / mouse coords.

    See this [issue](https://github.com/JakeSidSmith/react-fastclick/issues/4)

2. On some devices the elements flicker after being touched. This can be prevented by setting the css property `-webkit-tap-highlight-color` to transparent.
Either target `html, body` (to prevent the flickering on all elements) or target the specific element you don't want to flicker e.g. `button`.

    ```css
    html, body {
      -webkit-tap-highlight-color: transparent;
    }
    ```

## Support

Currently only tested with React 0.12.x & 0.13.x
