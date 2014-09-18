BetaJS.UI.Hardware = {};

BetaJS.UI.Hardware.MouseCoords = {
		
	__required: 0,
	
	coords: {x: 0, y: 0},
		
	require: function () {
		if (this.__required === 0) {
			var self = this;
			var events = [BetaJS.UI.Events.Mouse.moveEvent, BetaJS.UI.Events.Mouse.upEvent, BetaJS.UI.Events.Mouse.downEvent];
			for (var i = 0; i < events.length; ++i)
				BetaJS.$("body").on(events[i] + "." + BetaJS.Ids.objectId(this), function (event) {
					self.coords = BetaJS.UI.Events.Mouse.pageCoords(event); 
				});
		}
		this.__required++;
	},
	
	unrequire: function () {
		this.__required--;
		if (this.__required === 0) {
			BetaJS.$("body").off("." + BetaJS.Ids.objectId(this));
		}
	}
	
};
