BetaJS.UI.Interactions.ElementInteraction.extend("BetaJS.UI.Interactions.Pinch", {
	
    constructor: function (element, options, data) {
		options = BetaJS.Objs.extend({
		}, options);
		this._inherited(BetaJS.UI.Interactions.Pinch, "constructor", element, options);
		this._host.initialize("BetaJS.UI.Interactions.Pinch.Idle");
		this.data = data;
	},
	
	_disable: function () {
		this.stop();
	},
	
	start: function () {
		if (this._enabled)
			this._host.state().next("Pinching");
	},
	
	stop: function () {
		if (this._enabled)
			this._host.state().next("Idle");
	},
	
	__eventData: function () {
		var state = this._host.state();
		return {
			element: this.element(),
			source: this,
			data: this.data,
			initial: state._initial_coords,
			delta_last: state._delta_last
		};
	},
	
	__triggerEvent: function (label) {
		this.trigger(label, this.__eventData());
	}
	
});

BetaJS.UI.Interactions.State.extend("BetaJS.UI.Interactions.Pinch.Idle", {
	
	_white_list: ["Pinching"],
	
	trigger: function (label) {
		this.parent().__triggerEvent(label);
	},
	
	_start: function () {
		this.on(this.element(), "touchstart", function (event) {
			if (!this.parent()._enabled)
				return;
			if (!event.originalEvent.touches || event.originalEvent.touches.length != 2)
				return;
			this.next("Pinching", {
				initial_coords: BetaJS.UI.Events.Mouse.clientCoords(event, true)
			});
		});
	}

});

BetaJS.UI.Interactions.Pinch.Idle.extend("BetaJS.UI.Interactions.Pinch.Pinching", {
	
	_white_list: ["Idle"],
	_persistents: ["initial_coords", "current_coords"],

	_start: function () {
		this._last_coords = null;
		this._current_coords = this._initial_coords;
		this.trigger("pinchstart");
		this.on(this.element(), "touchmove", function (event) {
			if (!event.originalEvent.touches || event.originalEvent.touches.length != 2) {
				this.next("Idle");
				return;
			}
			this.__pinching(event);
		});
		this.on(this.element(), "touchend", function () {
			this.next("Idle");
		});
	},
	
	_end: function () {
		this.trigger("pinchstop");
		this._inherited(BetaJS.UI.Interactions.Pinch.Pinching, "_end");
	},
	
	__pinching: function (event) {
		event.preventDefault();
		this._last_coords = this._current_coords;
		this._current_coords = BetaJS.UI.Events.Mouse.clientCoords(event, true);
		this.__compute_values();
		this.trigger("pinch");
	},
	
	__compute_values: function () {
		var min = function (obj, coord) {
			return obj[0][coord] <= obj[1][coord] ? obj[0][coord] : obj[1][coord];
		};
		var max = function (obj, coord) {
			return obj[0][coord] >= obj[1][coord] ? obj[0][coord] : obj[1][coord];
		};
		this._delta_last = {
			x: min(this._last_coords, "x") - min(this._current_coords, "x") + max(this._current_coords, "x") - max(this._last_coords, "x"),
			y: min(this._last_coords, "y") - min(this._current_coords, "y") + max(this._current_coords, "y") - max(this._last_coords, "y")
		};
	}
	
});