BetaJS.UI.Events.Mouse = {
		
	downEvent: BetaJS.Browser.Info.isMobile() ? "touchstart" : "mousedown",	
	moveEvent: BetaJS.Browser.Info.isMobile() ? "touchmove" : "mousemove",	
	upEvent: BetaJS.Browser.Info.isMobile() ? "touchend" : "mouseup",
			
	customCoords: function (event, type, multi) {
		if (event.originalEvent.touches && event.originalEvent.touches.length) {
			var touches = event.originalEvent.touches;
			if (multi) {
				var touch_coords = [];
				for (var i = 0; i < touches.length; ++i) {
					touch_coords.push({
						x: touches[i][type + "X"],
						y: touches[i][type + "Y"]
					});
				}
				return touch_coords;
			}
			return {
				x: touches[0][type + "X"],
				y: touches[0][type + "Y"]
			};
		}
		var coords = {
			x: event[type + "X"],
			y: event[type + "Y"]
		};
		return multi ? [coords] : coords;
	},
	
	pageCoords: function (event, multi) {
		return this.customCoords(event, "page", multi);
	},
	
	clientCoords: function (event, multi) {
		return this.customCoords(event, "client", multi);
	},

	screenCoords: function (event, multi) {
		return this.customCoords(event, "screen", multi);
	}
};
