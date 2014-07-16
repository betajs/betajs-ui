/*!
  jquery-touch-gestures - v0.0.1 - 2014-07-16
  Copyright (c) Oliver Friedmann
  MIT Software License.
*/
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


(function($) {
	var _clear = $.ui.draggable.prototype._clear;
    $.widget("ui.draggable", $.extend({}, $.ui.draggable.prototype, {
    	_clear: function() {
    		this.element.css("left", "");
        	_clear.apply(this, arguments);
    	}
    }));
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

(function($) {
	$.touchgestures.methods.sortabley = {
		initialize: function (data) {
			data.runtime = $(data.parent).data("touchgestures-sortabley") || {};
            $(data.parent).data("touchgestures-sortabley", data.runtime);
			$(data.parent).sortable({
            	axis: "y",
            	stop: function () {
            		$(data.parent).sortable("disable");
            		data.runtime.sorting = false;
            		if (data.stop)
            			data.stop();
            	}
            });
            $(data.parent).sortable("enable");
			return data;
		},
		dispatch_event: function (element, event) {
			var data = element.data("touchgestures")["sortabley"];
			var touch = event.originalEvent.changedTouches[0];
			switch (event.type) {
				case "touchstart":
					$.touchgestures.helpers.simulateMouseEvent(event, 'mouseover');
					$.touchgestures.helpers.simulateMouseEvent(event, 'mousemove');
					$.touchgestures.helpers.simulateMouseEvent(event, 'mousedown');
	        		var elem = $(event.target);
	        		if (data.runtime.sorting || data.runtime.started)
	        			return;
	        		data.runtime.started = true;
	        		data.runtime.touch_timeout = setTimeout(function () {
	        			$(data.parent).sortable("enable");
	        			data.runtime.sorting = true;
	        			if (data.start)
	        				data.start.call(event.target);
			            setTimeout(function () {
			            	$.touchgestures.methods.sortabley.dispatch_event(elem, event);
			            },1);		            
	        		}, 250);
					return;
				case "touchend":
					$.touchgestures.helpers.simulateMouseEvent(event, 'mouseup');
					$.touchgestures.helpers.simulateMouseEvent(event, 'mouseout');
					if (!data.runtime.moved) 
						$.touchgestures.helpers.simulateMouseEvent(event, 'click');
	        		if (data.runtime.sorting)
	        			return;
					data.runtime.started = false;
					data.runtime.moved = false;
					data.runtime.sorting = false;
	        		clearTimeout(data.runtime.touch_timeout);
	        		return;
				case "touchmove":
					if (!data.runtime.moved)
						data.runtime.moved = true;
					$.touchgestures.helpers.simulateMouseEvent(event, 'mousemove');
					if (data.runtime.sorting)
						event.preventDefault();
					else
	        			clearTimeout(data.runtime.touch_timeout);					
					return;
				default:
					return;
			}
		}
	};
})(jQuery);
