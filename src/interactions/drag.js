BetaJS.UI.Interactions.ElementInteraction.extend("BetaJS.UI.Interactions.Drag", {
	
    constructor: function (element, options, data) {
		options = BetaJS.Objs.extend({
			start_event: BetaJS.UI.Events.Mouse.downEvent,
			stop_event: BetaJS.UI.Events.Mouse.upEvent,
			draggable_x: true,
			draggable_y: true,
			clone_element: false,
			droppable: false,
			remove_element_on_drop: false,
			revertable: true
		}, options);
		this._inherited(BetaJS.UI.Interactions.Drag, "constructor", element, options);
		this._host.initialize("BetaJS.UI.Interactions.Drag.Idle");
		this._modifier = new BetaJS.UI.Elements.ElementModifier(this._element);
		this.data = data;
	},
	
	destroy: function () {
		this._modifier.revert();
		this._modifier.destroy();
		this._inherited(BetaJS.UI.Interactions.Drag, "destroy");
	},
	
	_enable: function () {
		if (this._options.start_event)
			this._element.on(this._options.start_event + "." + BetaJS.Ids.objectId(this), BetaJS.Functions.as_method(this.start, this));
	},
	
	_disable: function () {
		this._element.off("." + BetaJS.Ids.objectId(this));
		this.stop();
	},
	
	start: function () {
		if (this._enabled)
			this._host.state().next("Starting");
	},
	
	stop: function () {
		if (this._enabled)
			this._host.state().next("Stopping");
	},
	
	abort: function () {
		if (this._enabled)
			this._host.state().next("Idle");
	},

	dropped: function (drop) {
		this.trigger("dropped", drop);
		this._host.state().next("Stopping", {immediately: true});
		if (this._options.remove_element_on_drop) {
			this.element().remove();
			this.destroy();
		}
	},
	
	actionable_element: function () {
		var c = this._host.state()._cloned_element;
		return c ? c : this._element;
	},
	
	modifier: function () {
		return this._modifier;
	},
	
	actionable_modifier: function () {
		var c = this._host.state()._cloned_modifier;
		return c ? c : this._modifier;
	},
	
	__eventData: function () {
		return {
			element: this.element(),
			actionable_element: this.actionable_element(),
			modifier: this.modifier(),
			actionable_modifier: this.actionable_modifier(),
			source: this,
			data: this.data,
			page_coords: this._host.state()._page_coords,
			underneath: this.__underneath
		};
	},
	
	__triggerEvent: function (label) {
		this.trigger(label, this.__eventData());
	},
	
	__triggerDomEvent: function (label) {
		var data = this.__eventData();
		if (!data.page_coords)
			return;
		var underneath = BetaJS.UI.Elements.Support.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
		if (underneath)
			BetaJS.UI.Events.Support.dispatchElementEvent(underneath, "drag-" + label, data);
	},
	
	__triggerDomMove: function () {
		var data = this.__eventData();
		if (!data.page_coords)
			return;
		var underneath = BetaJS.UI.Elements.Support.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
		if (underneath) {
			if (this.__old_coords && this.__underneath && this.__underneath != underneath) {
				BetaJS.UI.Events.Support.dispatchPointsSeparatorEvent(underneath, "drag-enter", data.page_coords, this.__old_coords, data);
				BetaJS.UI.Events.Support.dispatchPointsSeparatorEvent(this.__underneath, "drag-leave", this.__old_coords, data.page_coords, data);
			}
			BetaJS.UI.Events.Support.dispatchElementEvent(underneath, "drag-hover", data);
		}
		this.__underneath = underneath;
		this.__old_coords = data.page_coords;
	}
	
});

BetaJS.UI.Interactions.State.extend("BetaJS.UI.Interactions.Drag.Idle", {
	
	_white_list: ["Starting"],
	
	trigger: function (label) {
		this.parent().__triggerEvent(label);
	},
	
	triggerDom: function (label) {
		this.parent().__triggerDomEvent(label);
	},
	
	triggerDomMove: function () {
		this.parent().__triggerDomMove();
	}

});

BetaJS.UI.Interactions.Drag.Idle.extend("BetaJS.UI.Interactions.Drag.Starting", {
	
	_white_list: ["Stopping", "Dragging"],
	_persistents: ["initial_element_coords", "cloned_element", "cloned_modifier"],

	_start: function () {
		this.on("body", BetaJS.UI.Events.Mouse.moveEvent, function (event) {
			this.next("Dragging", {page_coords: BetaJS.UI.Events.Mouse.pageCoords(event)});
		});
		var opts = this.parent().options();
		if (opts.stop_event) {
			this.on("body", opts.stop_event, function () {
				this.next("Stopping");
			});
		}		
		if (opts.clone_element) {
			this._cloned_element = this.element().clone();
			this._cloned_element.css("position", "absolute");
			this._cloned_element.css("width", this.element().width());
			this._cloned_element.css("height", this.element().height());
			this._cloned_element.css("z-index", this.element().css("z-index") + 1);
			this._initial_element_coords = {
				x: this.element().offset().left,
				y: this.element().offset().top
			};
			this._cloned_element.css("left", this._initial_element_coords.x + "px");
			this._cloned_element.css("top", this._initial_element_coords.y + "px");
			BetaJS.$("body").append(this._cloned_element);
			this._cloned_modifier = new BetaJS.UI.Elements.ElementModifier(this._cloned_element); 
		} else {
			var modifier = this.parent().modifier();
			modifier.css("position", "relative");
			this._initial_element_coords = {};
			if (opts.draggable_x) {
				var left = modifier.css("left");
				if (left === "auto" || !left)
					modifier.css("left", "0px");
				this._initial_element_coords.x = parseInt(modifier.css("left"), 10);
			}
			if (opts.draggable_y) {
				var top = modifier.css("top");
				if (top === "auto" || !left)
					modifier.css("top", "0px");
				this._initial_element_coords.y = parseInt(modifier.css("top"), 10);
			}
		}
		this.trigger("start");
	}

});

BetaJS.UI.Interactions.Drag.Idle.extend("BetaJS.UI.Interactions.Drag.Dragging", {
	
	_white_list: ["Stopping"],
	_persistents: ["page_coords", "initial_element_coords", "cloned_element", "cloned_modifier"],

	_start: function () {
		this.on("body", BetaJS.UI.Events.Mouse.moveEvent, this.__dragging);
		var opts = this.parent()._options;
		if (opts.stop_event) {
			this.on("body", opts.stop_event, function () {
				if (opts.droppable)
					this.triggerDom("drop");
				if ("next" in this)
					this.next("Stopping", {released: true});
			});
		}
	},
	
	__dragging: function (event) {
		var page_coords = BetaJS.UI.Events.Mouse.pageCoords(event);
		var delta_coords = {
			x: page_coords.x - this._page_coords.x,
			y: page_coords.y - this._page_coords.y
		};
		this._page_coords = page_coords;
		var base = this.parent().actionable_modifier();
		if (this.options().draggable_x)
			base.css("left", (parseInt(base.css("left"), 10) + delta_coords.x) + "px");
		if (this.options().draggable_y)
			base.css("top", (parseInt(base.css("top"), 10) + delta_coords.y) + "px");
		this.trigger("move");
		this.triggerDomMove();
	}
	
});

BetaJS.UI.Interactions.Drag.Idle.extend("BetaJS.UI.Interactions.Drag.Stopping", {
	
	_white_list: ["Idle", "Starting"],
	_locals: ["page_coords", "initial_element_coords", "cloned_element", "cloned_modifier", "immediately", "released"],
	
	_start: function () {
		this.trigger("stopping");
		this.triggerDom("stop");
		var options = this.options();
		if (!options.revertable || this._immediately) {
			if (this._released)
				this.trigger("release");
			this.next("Idle");
			return;
		}
		var styles = {};
		if (options.draggable_x)
			styles.left = this._initial_element_coords.x + "px";
		if (options.draggable_y)
			styles.top = this._initial_element_coords.y + "px";
		this.__animation = new BetaJS.UI.Elements.DefaultAnimator(this.parent().actionable_element(), {
			styles: styles
		}, function () {
			if (this.__animation)
				this.next("Idle");
		}, this);
		if (this._released)
			this.trigger("release");
	},
	
	_end: function () {
		if (this.__animation) {
			var animation = this.__animation;
			this.__animation = null;
			animation.complete();
		}
		if (this._cloned_modifier)
			this._cloned_modifier.destroy();
		if (this._cloned_element)
			this._cloned_element.remove();
		this.parent().modifier().revert();
		this.trigger("stop");
		this._inherited(BetaJS.UI.Interactions.Drag.Stopping, "_end");
	}

});