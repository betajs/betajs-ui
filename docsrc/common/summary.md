```js

    	BetaJS.UI.Interactions.Drag.multiple($(".doodad"), {
            enabled : true,
            clone_element: true
        }, function (drag) {
            drag.on("move", function (event) {
            	event.actionable_modifier.csscls("focus", true);
            	event.modifier.csscls("unfocus", true);
            });
        });
        
```

```html
    	<div class="doodads">
	        <div class="doodad"><div class="inner">Doodad 1</div></div>
	        <div class="doodad"><div class="inner">Doodad 2</div></div>
	        <div class="doodad"><div class="inner">Doodad 3</div></div>
	        <div class="doodad"><div class="inner">Doodad 4</div></div>
	        <div class="doodad"><div class="inner">Doodad 5</div></div>
    	</div>
```
