if ('ontouchstart' in window) {
  var SimpleEventPlugin = require('react/lib/SimpleEventPlugin');
  var EventPluginHub = require('react/lib/EventPluginHub');
  // This is our hacked TapEventPlugin
  var TapEventPlugin = require('./TapEventPlugin');

  // Remove existing click event
  delete SimpleEventPlugin.eventTypes.click;

  // Register new event
  EventPluginHub.injection.injectEventPluginsByName({
    'TapEventPlugin': TapEventPlugin
  });

}
