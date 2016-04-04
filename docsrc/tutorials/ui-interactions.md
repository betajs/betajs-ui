Interactions allow you to register particular user interactions like drag, drop, swipe, pinch, scroll etc. on DOM elements.
You can react to events emitted by the respective interactions.
The interaction system is completely independent of any UI/UX framework.

All interactions are configuered as follows:

```javascript
	var interaction = new InteractionClass(domElement, {
		options
	});
	
	interaction.on("event", function () {
		// React to particular interaction event.
	});
``` 

You can also instantiate multiple interactions at once when providing a jQuery selector for multiple elements:

```javascript
	InteractionClass.multiple(jqueryElements, {
		options
	}, function (interaction) {
		interaction.on("event", function () {
			// React to particular interaction event.
		});
	});
	
``` 
