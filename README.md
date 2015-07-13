# React Fastclick

**Instantly make your desktop / hybrid apps more responsive on touch devices.**

React Fastclick automatically adds fastclick touch events to elements with onClick attributes to prevent the delay that occurs on some touch devices.

## Installation

Use npm to install react-fastclick

```
npm install react-fastclick
```

## Usage

Include react-fastclick in your main javascript file before any of your components are created e.g.

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

2. On some devices the elements flicker after being touched. This can be prevented by calling `event.preventDefault()`.

## Support

Current only tested with React 0.13.3
