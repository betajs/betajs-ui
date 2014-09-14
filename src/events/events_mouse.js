BetaJS.UI.Events.Mouse = {
	downEvent: BetaJS.Browser.Info.isMobile() ? "touchstart" : "mousedown",	
	moveEvent: BetaJS.Browser.Info.isMobile() ? "touchmove" : "mousemove",	
	upEvent: BetaJS.Browser.Info.isMobile() ? "touchend" : "mouseup",
	pageCoords: function (event) {
		if (event.originalEvent.touches) {
			return {
				x: event.originalEvent.touches[0].pageX,
				y: event.originalEvent.touches[0].pageY
			};
		}
		return {
			x: event.pageX,
			y: event.pageY
		};
	}
};
