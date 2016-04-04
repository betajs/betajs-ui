The drop interaction allows you accept dropped elements originating from a drag interaction.

```javascript
	var drag = new BetaJS.UI.Interactions.Drag(dragSourceElement, {
		droppable: true,
        enabled : true,
        clone_element: true,
        remove_element_on_drop : true
    });
    
    drag.on("move", function (event) {
    	event.actionable_modifier.csscls("focus", true);
    	event.modifier.csscls("unfocus", true);
    });

    var drop = new BetaJS.UI.Interactions.Drop(dropTargetElement, {
        enabled : true
    });
    drop.on("hover", function(dr) {
        dr.modifier.css("border", "4px solid green");
    });
    drop.on("dropped", function(event) {
    	$("#drop").append(event.source.element.html());
    });
```