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
