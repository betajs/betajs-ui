Scoped.define("module:Hardware.MouseCoords", [
    "base:Ids",
    "base:Objs",
    "browser:Events",
    "module:Events.Mouse"
], function (Ids, Objs, DomEvents, MouseEvents) {
	return {		
			
		__required: 0,
		
		__domevents: null,
		
		coords: {x: 0, y: 0},
			
		require: function () {
			if (this.__required === 0) {
				this.__domevents = new DomEvents();
				this.__domevents.on(document.body, [MouseEvents.moveEvent(), MouseEvents.upEvent(), MouseEvents.downEvent()].join(" "), function (event) {
					var result = MouseEvents.pageCoords(event);
					if (result.x && result.y)
						this.coords = result; 
				}, this);
			}
			this.__required++;
		},
		
		unrequire: function () {
			this.__required--;
			if (this.__required === 0)
				this.__domevents.destroy();
		}
		
	};
});