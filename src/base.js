(function($) {
	jQuery.fn.touchgesture = function(options) {
		if (typeof options == "string")
			options = {method: options};
		if (!options.method || !(options.method in $.touchgestures.methods))
			return this;
		return this.each(function() {
			var object = $(this).data("touchgestures") || {};
			object[options.method] = $.touchgestures.methods[options.method].initialize.call(this, options);
			$(this).data("touchgestures", object);
		});
	};
	$.touchgestures = {
		methods: {},
		helpers: {
			simulateMouseEvent: function (event, simulatedType) {
				// Ignore multi-touch events
				if (event.originalEvent.touches.length > 1)
					return;
		
				var touch = event.originalEvent.changedTouches[0];
				var simulatedEvent = document.createEvent('MouseEvents');
				
				simulatedEvent.initMouseEvent(simulatedType, // type
					true, // bubbles
					true, // cancelable
					window, // view
					1, // detail
					touch.screenX, // screenX
					touch.screenY, // screenY
					touch.clientX, // clientX
					touch.clientY, // clientY
					false, // ctrlKey
					false, // altKey
					false, // shiftKey
					false, // metaKey
					0, // button
					null); // relatedTarget
		
				// Dispatch the simulated event to the target element
				event.target.dispatchEvent(simulatedEvent);
			}
		}
	};
	if ($.ui && $.ui.mouse && 'ontouchend' in document) {
		$.touchgestures.mouse_prototype = $.ui.mouse.prototype;
		$.touchgestures.mouse_prototype_init = $.ui.mouse.prototype._mouseInit;
		$.touchgestures.mouse_prototype._mouseInit = function() {
			var self = this;
			this.element.on("touchstart touchmove touchend", function (event) {
				var method = null;
				//var elem = $(event.target);
				var elem = self.element;
				for (var key in elem.data("touchgestures") || {})
					method = $.touchgestures.methods[key];
					if (method)
						method.dispatch_event.call(method, elem, event);
			});
			$.touchgestures.mouse_prototype_init.call(self);
		};
	}
})(jQuery);

