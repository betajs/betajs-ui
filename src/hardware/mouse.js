BetaJS.UI.Hardware = {};

BetaJS.UI.Hardware.MouseCoords = {
		
	__required: 0,
	
	coords: {x: 0, y: 0},
		
	require: function () {
		if (this.__required === 0) {
			var self = this;
			BetaJS.$("body").on(BetaJS.UI.Events.Mouse.moveEvent + "." + BetaJS.Ids.objectId(this), function (event) {
				self.coords = BetaJS.UI.Events.Mouse.pageCoords(event); 
			});
		}
		this.__required++;
	},
	
	unrequire: function () {
		this.__required--;
		if (this.__required === 0) {
			BetaJS.$("body").off(BetaJS.UI.Events.Mouse.moveEvent + "." + BetaJS.Ids.objectId(this));
		}
	}
	
};
