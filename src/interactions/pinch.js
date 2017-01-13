Scoped.define("module:Interactions.Pinch", [
    "module:Interactions.ElementInteraction",
    "module:Interactions.PinchStates",
    "jquery:"
], [
	"module:Interactions.PinchStates.Idle",
	"module:Interactions.PinchStates.Pinching"
], function (ElemInter, PinchStates, $, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data) {
		    	inherited.constructor.call(this, element, options, PinchStates);
				this._host.initialize("Idle");
				this.data = data;
			},
			
			element: function () {
				return $(this._element);
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
			
		};
	});
});


Scoped.define("module:Interactions.PinchStates.Idle", ["module:Interactions.State", "module:Events.Mouse"], function (State, MouseEvents, scoped) {
   	return State.extend({scoped: scoped}, {
		
		_white_list: ["Pinching"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		},
		
		_start: function () {
			this.on(this.element(), "touchstart", function (event) {
				if (!this.parent()._enabled)
					return;
				if (!event.touches || event.touches.length != 2)
					return;
				this.next("Pinching", {
					initial_coords: MouseEvents.clientCoords(event, true)
				});
			});
		}
	
	});
});


Scoped.define("module:Interactions.PinchStates.Pinching", ["module:Interactions.PinchStates.Idle", "module:Events.Mouse"], function (State, MouseEvents, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle"],
			_persistents: ["initial_coords", "current_coords"],
			
			/* Linter */
			_initial_coords: null,
		
			_start: function () {
				this._last_coords = null;
				this._current_coords = this._initial_coords;
				this.trigger("pinchstart");
				this.on(this.element(), "touchmove", function (event) {
					if (!event.touches || event.touches.length != 2) {
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
				inherited._end.call(this);
			},
			
			__pinching: function (event) {
				event.preventDefault();
				this._last_coords = this._current_coords;
				this._current_coords = MouseEvents.clientCoords(event, true);
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
			
		};
	});
});