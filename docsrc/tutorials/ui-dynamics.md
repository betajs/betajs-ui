Both the interaction and the gesture system are completely independent from any frontend system. That includes the dynamics system.

BetaJS UI contains a small optional bridging system that makes it particularly easy to apply both gestures and interactions to dom elements within the dynamics system, by applying partials to the respective dom elements:

```html
    <div ba-gesture:drag="{{{data: user_data, options: drag_gesture_options}}}"
         ba-interaction:drag="{{{data: user_data, options: drag_interaction_options}}}">
    </div>
```

There can be multiple gestures and interactions applied to a single dom element.

The value part of both the gesture and the interaction partials contain a (dynamically generated) JSON object with a `data` parameter (which can be, for instance, an item from a `ba-repeat` partial) and an `options` parameter. While the options can be given explicitly as a JSON as well, it is recommended to outsource the options into the attributes of the dynamic:

```javascript
BetaJS.Dynamics.Dynamic.activate({
	element: document.body,
	attrs: {
		drag_gesture_options: {
            mouse_up_activate: false,
            wait_time: 750,
            wait_activate: true,
            disable_x: 10,
            disable_y: 10,
            enable_x: -1,
            enable_y: -1,
            interaction: "drag"
        },
        drag_interaction_options: {
        	type: "drag",
            clone_element: true,
            start_event: null,
            events: {
            	"move": function (doodad, event) {
                    event.actionable_modifier.csscls("focus", true);
                    event.modifier.csscls("unfocus", true);
            	}
            }
        }
	}
});
```