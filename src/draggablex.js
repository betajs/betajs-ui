(function($) {
	$.touchgestures.methods.draggablex = {
		initialize: function (data) {
			data.animation_threshold_x = "animation_threshold_x" in data ? data.animation_threshold_x : 10;
			data.activation_threshold_x = "activation_threshold_x" in data ? data.activation_threshold_x : 50;
        	data.deactivation_threshold_y = "deactivation_threshold_y" in data ? data.deactivation_threshold_y : 10;
        	var obj = {
        		revert: true,
        		axis: "x"
        	};
        	if (data.drag)
        		obj.drag = data.drag;
        	if (data.revert)
        		obj.revert = data.revert;
            $(this).draggable(obj);
			return data;
		},
		dispatch_event: function (element, event) {
			var data = element.data("touchgestures")["draggablex"];
			var touch = event.originalEvent.changedTouches[0];
			switch (event.type) {
				case "touchstart":
					data.runtime = {
						moved: false,
						handled: false,
						disabled: false,
						animation: false
					};
					$.touchgestures.helpers.simulateMouseEvent(event, 'mouseover');
					$.touchgestures.helpers.simulateMouseEvent(event, 'mousemove');
					$.touchgestures.helpers.simulateMouseEvent(event, 'mousedown');
					return;
				case "touchend":
					$.touchgestures.helpers.simulateMouseEvent(event, 'mouseup');
					$.touchgestures.helpers.simulateMouseEvent(event, 'mouseout');
					if (!data.runtime.moved) 
						$.touchgestures.helpers.simulateMouseEvent(event, 'click');
					delete data.runtime;
					return;
				case "touchmove":
					if (!data.runtime.moved) {
						data.runtime.moved = true;
						data.runtime.x = touch.clientX;
						data.runtime.y = touch.clientY;
					}
					if (!data.runtime.handled && !data.runtime.disabled) {
						if (Math.abs(touch.clientX - data.runtime.x) > data.animation_threshold_x)
							data.runtime.animation = true;
						if (Math.abs(touch.clientX - data.runtime.x) > data.activation_threshold_x)
							data.runtime.handled = true;
						else if (Math.abs(touch.clientY - data.runtime.y) > data.deactivation_threshold_y)
							data.runtime.disabled = true;
					}
					if (data.runtime.handled) {
						$.touchgestures.helpers.simulateMouseEvent(event, 'mousemove');
						event.preventDefault();
					} else if (!data.runtime.disabled && data.runtime.animation)
						$.touchgestures.helpers.simulateMouseEvent(event, 'mousemove');
					return;
				default:
					return;
			}
		}
	};
})(jQuery);
