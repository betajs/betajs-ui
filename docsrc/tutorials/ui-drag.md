The drag interaction allows the user to drag a dom element within constraints. This allows you to enable two types of drag interactions:
- a standard drag: here, the element is cloned and positioned absolutely on the body, allowing the user to move it around freely
- a restricted drag: here, the element is just moved within its parent container, to e.g. implement a swipe-like interaction

Finally, the drag interaction works well with the drop interaction, to fully implement a drag-and-drop-like system.

A standard drag, in which the element is being cloned (temporarily), can be instantiated as follows:

```javascript
	var drag = BetaJS.UI.Interactions.Drag(domElement, {
        enabled : true,
        clone_element: true
    });
    
    drag.on("move", function (event) {
    	event.actionable_modifier.csscls("focus", true);
    	event.modifier.csscls("unfocus", true);
    });
```