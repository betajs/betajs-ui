The gesture allows you to react to particular touch / click gestures and kick off interactions based on a successful gesture.

The gesture system is implemented as a competitive state engine. That particularly enables you to register multiple gestures on DOM elements, competing with each other.

A gesture is registered on a DOM element as follows:

```javascript
    var gesture = new BetaJS.UI.Gestures.Gesture(domElement, BetaJS.UI.Gestures.defaultGesture({
    	mouse_up_activate: false,
        wait_time: 750,
        wait_activate: true,
        disable_x: 10,
        disable_y: 10,
        enable_x: -1,
        enable_y: -1
    }));
```

This gesture, for instance, is activated by touching the particular dom element, waiting 750 ms and not moving more than 10 pixels both in horizontal and vertical drection.

You can react to a successful gesture or to an unsuccessful gesture as follows>

```javascript
    gesture.on("activate", function () {
    	// ...
    });
    gesture.on("deactivate", function () {
    	// ...
    });
```

The most typical use case combines gestures with interactions. The interactions are configured slightly differently, to not automatically kick off once the user starts to interact with the DOM element. This part is now handled by the gesture.

Here is a typical example:

```javascript
	var drag = new BetaJS.UI.Interactions.Drag(domElement, {
	    enabled : true,
	    clone_element: true,
		start_event: null                
	});
    gesture.on("activate", drag.start, drag);
    gesture.on("deactivate", drag.stop, drag);
```