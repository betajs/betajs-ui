The pinch interaction allows the user to zoom in/out within a particular dom element.

For this example, assume the following dom element:

```html
	<div class="pinch" style="width: 200px; height: 200px">
		Pinch Me
	</div>
```

We initialize the pinch interaction:

```javascript
	var pinch = new BetaJS.UI.Interactions.Pinch($(".pinch"), {
		enabled: true
	});
```

Once the user initiates a pinch, we need to react to it by resizing the underlying dom element, e.g. as follows:

```javascript
	pinch.on("pinch", function (details) {
		$(".pinch").css("width", (parseInt($(".pinch").css("width"), 10) + details.delta_last.x) + "px");
		$(".pinch").css("height", (parseInt($(".pinch").css("height"), 10) + details.delta_last.y) + "px");
	});
```
