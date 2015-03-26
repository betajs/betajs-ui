Scoped.define("module:Hardware.MouseCoords", [
	    "base:Ids",
	    "base:Objs",
	    "jquery:",
	    "module:Events.Mouse"
	], function (Ids, Objs, $, MouseEvents) {
	return {		
			
		__required: 0,
		
		coords: {x: 0, y: 0},
			
		require: function () {
			if (this.__required === 0) {
				var self = this;
				var events = [MouseEvents.moveEvent, MouseEvents.upEvent, MouseEvents.downEvent];
				Objs.iter(events, function (eventName) {
					$("body").on(eventName + "." + Ids.objectId(this), function (event) {
						var result = MouseEvents.pageCoords(event);
						if (result.x && result.y)
							self.coords = result; 
					});
				}, this);
			}
			this.__required++;
		},
		
		unrequire: function () {
			this.__required--;
			if (this.__required === 0) {
				$("body").off("." + Ids.objectId(this));
			}
		}
		
	};
});