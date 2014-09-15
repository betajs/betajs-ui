/*!
  betajs-ui - v0.0.2 - 2014-09-15
  Copyright (c) Oliver Friedmann
  MIT Software License.
*/
BetaJS.Class.extend("BetaJS.UI.Elements.Animators", {
	
	constructor: function (element, options, callback, context) {
		this._inherited(BetaJS.UI.Elements.Animators, "constructor");
		this._element = element;
		this._options = BetaJS.Objs.extend({
			callback_on_revert: true,
			callback_on_complete: true,
			auto_start: true,
			auto_destroy: true
		}, options);
		this._callback = callback;
		this._context = context;
		this._running = false;
		if (this._options.auto_start)
			this.start();
	},
	
	start: function () {
		if (this._running)
			return;
		this._running = true;
		this._start();
	},
	
	revert: function () {
		if (!this._running)
			return;
		this._running = false;
		this._revert();
	},
	
	complete: function () {
		if (!this._running)
			return;
		this._complete();
	},
	
	__callback: function () {
		this._callback.apply(this._context || this);
		if (this._options && this._options.auto_destroy)
			this.destroy();
	},
	
	_finished: function () {
		this.__callback();
	},
	
	_reverted: function () {
		if (this._options.callback_on_revert)
			this.__callback();
	},
	
	_completed: function () {
		if (this._options.callback_on_complete)
			this.__callback();
	},
	
	_start: function () {
		this._finished();
	},
	
	_revert: function () {
		this._reverted();
	},
	
	_complete: function () {
		this._completed();
	}
	
});


BetaJS.UI.Elements.Animators.extend("BetaJS.UI.Elements.DefaultAnimator", {
	
	constructor: function (element, options, callback, context) {
		options = BetaJS.Objs.extend({
			duration: 250,
			styles: {},
			method: "swing"
		}, options);		
		this._inherited(BetaJS.UI.Elements.DefaultAnimator, "constructor", element, options, callback, context);
	},

	_start: function () {
		var self = this;
		this.__animate = this._element.animate(this._options.styles, this._options.duration, this._options.method, function () {
			self._finished();
		});
	},
	
	_revert: function () {
		this.__animate.stop();
		this._reverted();
	},
	
	_complete: function () {
		this.__animate.stop(true);
		this._completed();
	}
	
});
BetaJS.Class.extend("BetaJS.UI.Elements.ElementModifier", {
	
	constructor: function (element) {
		this._inherited(BetaJS.UI.Elements.ElementModifier, "constructor");
		this._element = BetaJS.$(element);
		this._css = {};
		this._cls = {};
	},
	
	css: function (key, value) {
		if (arguments.length < 2)
			return this._element.css.apply(this._element, arguments);
		if (this._element.css(key) === value)
			return value;
		if (!(key in this._css))
			this._css[key] = this._element.css(key);
		this._element.css(key, value);
		return value;
	},
	
	csscls: function (key, value) {
		var has = this._element.hasClass(key);
		if (arguments.length < 2)
			return key;
		if (has === value)
			return value;
		if (!(key in this._cls))
			this._cls[key] = has;
		if (value)
			this._element.addClass(key);
		else
			this._element.removeClass(key);
		return value;
	},
	
	removeClass: function (cls) {
		if (!this._element.hasClass(cls))
			return;
		if (!(cls in this._cls))
			this._cls[cls] = true;
		this._element.addClass(cls);
	},
	
	revert: function () {
		for (var key in this._css)
			this._element.css(key, this._css[key]);
		for (key in this._cls) {
			if (this._cls[key])
				this._element.addClass(key);
			else
				this._element.removeClass(key);
		}
	}
	
});
BetaJS.UI.Elements.Support = {

	elementFromPoint : function(x, y, disregarding) {
		disregarding = disregarding || [];
		if (!BetaJS.Types.is_array(disregarding))
			disregarding = [ disregarding ];
		var backup = [];
		for (var i = 0; i < disregarding.length; ++i) {
			disregarding[i] = BetaJS.$(disregarding[i]);
			backup.push(disregarding[i].css("z-index"));
			disregarding[i].css("z-index", -1);
		}
		var element = document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
		for (i = 0; i < disregarding.length; ++i)
			disregarding[i].css("z-index", backup[i]);
		return element;
	},

	elementBoundingBox : function(element) {
		element = BetaJS.$(element);
		var offset = element.offset();
		return {
			left : offset.left,
			top : offset.top,
			right : offset.left + element.outerWidth() - 1,
			bottom : offset.top + element.outerHeight() - 1
		};
	},

	pointWithinElement : function(x, y, element) {
		var bb = this.elementBoundingBox(element);
		return bb.left <= x && x <= bb.right && bb.top <= y && y <= bb.bottom;
	},
	
	childContainingElement: function (parent, element) {
		parent = BetaJS.$(parent).get(0);
		element = BetaJS.$(element).get(0);
		while (element.parentNode != parent) {
			if (element == document.body)
				return null;
			element = element.parentNode;
		}
		return element;
	}

};
BetaJS.UI.Events = {};

BetaJS.UI.Events.Support = {

	dispatchElementEvent: function (element, label, data, options) {
		element.dispatchEvent(new CustomEvent(label, BetaJS.Objs.extend({
			bubbles: true,
			cancelable: true,
			detail: data
		}, options)));
	},
	
	dispatchElementsEvent: function (elements, label, data, options) {
		for (var i = 0; i < elements.length; ++i) {
			elements[i].dispatchEvent(new CustomEvent(label, BetaJS.Objs.extend({
				bubbles: false,
				cancelable: true,
				detail: data
			}, options)));
		}
	},
	
	dispatchManualBubbleEvent: function (element, label, predicate, data, options) {
		this.dispatchElementsEvent(BetaJS.$(element).parents().andSelf().filter(predicate), label, data, options); 
	},
	
	dispatchPointsSeparatorEvent: function (element, label, included, excluded, data, options) {
		included = included ? (BetaJS.Types.is_array(included) ? included : [included]) : [];
		excluded = excluded ? (BetaJS.Types.is_array(excluded) ? excluded : [excluded]) : [];
		this.dispatchManualBubbleEvent(element, label, function () {
			for (var i = 0; i < included.length; ++i) {
				if (!BetaJS.UI.Elements.Support.pointWithinElement(included[i].x, included[i].y, this))
					return false;
			}
			for (i = 0; i < excluded.length; ++i) {
				if (BetaJS.UI.Elements.Support.pointWithinElement(excluded[i].x, excluded[i].y, this))
					return false;
			}
			return true;
		}, data, options);
	}
	
};

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

BetaJS.Class.extend("BetaJS.UI.Interactions.ElementInteraction", [
    BetaJS.Events.EventsMixin,
	{
    	
	constructor: function (element, options) {
		this._inherited(BetaJS.UI.Interactions.ElementInteraction, "constructor");
		this._element = BetaJS.$(BetaJS.$(element).get(0));
		this._enabled = false;
		this._options = options || {};
		if ("enabled" in this._options) {
			var enabled = this._options.enabled;
			delete this._options.enabled;
			if (enabled) 
				BetaJS.SyncAsync.eventually(this.enable, this);
		}
		this._host = new BetaJS.States.Host();
		this._host.parent = this;
	},
	
	destroy: function () {
		this.disable();
		this._host.destroy();
		this._inherited(BetaJS.UI.Interactions.ElementInteraction, "destroy");
	},
	
	enable: function () {
		if (this._enabled)
			return;
		this._enabled = true;
		this._enable();
	},
	
	disable: function () {
		if (!this._enabled)
			return;
		this._enabled = false;
		this._disable();
	},
	
	element: function () {
		return this._element;
	},
	
	options: function () {
		return this._options;
	},
	
	_enable: function () {},
	
	_disable: function () {}

}], {
	
	multiple: function (element, options, callback, context) {
		var self = this;
		BetaJS.$(element).each(function () {
			var obj = new self(this, options);
			if (callback)
				callback.call(context || obj, obj);
		});
	}
	
});


BetaJS.States.State.extend("BetaJS.UI.Interactions.State", {
	
	parent: function () {
		return this.host.parent;
	},
	
	element: function () {
		return this.parent().element();
	},
	
	options: function () {
		return this.parent().options();
	},
	
	on: function (element, event, callback, context) {
		var self = this;
		var events = event.split(" ");
		for (var i = 0; i < events.length; ++i)
			BetaJS.$(element).on(events[i] + "." + BetaJS.Ids.objectId(this), function () {
				callback.apply(context || self, arguments);
			});
	},
	
	_end: function () {
		this.element().off("." + BetaJS.Ids.objectId(this));
		BetaJS.$("body").off("." + BetaJS.Ids.objectId(this));
	}	

});

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
		event.preventDefault();
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
BetaJS.UI.Interactions.ElementInteraction.extend("BetaJS.UI.Interactions.Drop", {
	
    constructor: function (element, options, data) {
		options = BetaJS.Objs.extend({
			droppable: function () {
				return true;
			},
			context: this,
			bounding_box: function (bb) {
				return bb;
			}
		}, options);
		this._inherited(BetaJS.UI.Interactions.Drop, "constructor", element, options);
		this._host.initialize("BetaJS.UI.Interactions.Drop.Idle");
		this._modifier = new BetaJS.UI.Elements.ElementModifier(this._element);
		this.data = data;
	},
	
	destroy: function () {
		this._modifier.revert();
		this._modifier.destroy();
		this._host.destroy();
		this._inherited(BetaJS.UI.Interactions.Drop, "destroy");
	},
	
	_enable: function () {
		this._host.state().next("Idle");
	},
	
	_disable: function () {
		this._host.state().next("Disabled");
	},
	
	modifier: function () {
		return this._modifier;
	},
	
	__eventData: function () {
		return {
			element: this.element(),
			modifier: this.modifier(),
			target: this,
			data: this.data,
			source: this._host.state()._drag_source ? this._host.state()._drag_source : null
		};
	},
	
	__triggerEvent: function (label) {
		this.trigger(label, this.__eventData());
	},

	droppable: function (source) {
		return this._options.droppable.call(this._options.context, source, this);
	},
	
	_is_hovering: function (source) {
		var bb = BetaJS.UI.Elements.Support.elementBoundingBox(this.element());
		bb = this._options.bounding_box.call(this._options.context, bb);
		var co = source.page_coords;
		return bb.left <= co.x && co.x <= bb.right && bb.top <= co.y && co.y <= bb.bottom;
	}
	
});

BetaJS.UI.Interactions.State.extend("BetaJS.UI.Interactions.Drop.Disabled", {
	
	_white_list: ["Idle"],
	
	trigger: function (label) {
		this.parent().__triggerEvent(label);
	}	

});

BetaJS.UI.Interactions.Drop.Disabled.extend("BetaJS.UI.Interactions.Drop.Idle", {
	
	_white_list: ["Hover", "InvalidHover", "Disabled"],

	_start: function () {
		this.on(this.element(), "drag-hover", function (event) {
			var drag_source = event.originalEvent.detail;
			if (this.parent()._is_hovering(drag_source))
				this.next(this.parent().droppable(drag_source) ? "Hover" : "InvalidHover", {drag_source: drag_source});
		});
	}

});

BetaJS.UI.Interactions.Drop.Disabled.extend("BetaJS.UI.Interactions.Drop.Hover", {
	
	_white_list: ["Idle", "Disabled", "Dropping"],
	_persistents: ["drag_source"],

	_start: function () {
		this.trigger("hover");
		this.on(this.element(), "drag-hover", function (event) {
			this._drag_source = event.originalEvent.detail;
			if (!this.parent()._is_hovering(this._drag_source))
				this.next("Idle");
		});
		this.on(this.element(), "drag-stop drag-leave", function (event) {
			this._drag_source = event.originalEvent.detail;
			this.next("Idle");
		});
		this.on(this.element(), "drag-drop", function (event) {
			this._drag_source = event.originalEvent.detail;
			this.next("Dropping");
		});
	},
	
	_end: function () {
		this.trigger("unhover");
		this.parent().modifier().revert();
		this._inherited(BetaJS.UI.Interactions.Drop.Hover, "_end");
	}

});

BetaJS.UI.Interactions.Drop.Disabled.extend("BetaJS.UI.Interactions.Drop.InvalidHover", {
	
	_white_list: ["Idle", "Disabled"],
	_persistents: ["drag_source"],

	_start: function () {
		this.trigger("hover-invalid");
		this.on(this.element(), "drag-hover", function (event) {
			this._drag_source = event.originalEvent.detail;
			if (!this.parent()._is_hovering(this._drag_source))
				this.next("Idle");
		});
		this.on(this.element(), "drag-drop drag-stop drag-leave", function (event) {
			this._drag_source = event.originalEvent.detail;
			this.next("Idle");
		});
	},
	
	_end: function () {
		this.trigger("unhover");
		this.parent().modifier().revert();
		this._inherited(BetaJS.UI.Interactions.Drop.InvalidHover, "_end");
	}

});

BetaJS.UI.Interactions.Drop.Disabled.extend("BetaJS.UI.Interactions.Drop.Dropping", {

	_white_list: ["Idle", "Disabled"],
	_persistents: ["drag_source"],

	_start: function () {
		this.trigger("dropped");
		this._drag_source.source.dropped(this.parent());
		this.next("Idle");
	}

});


BetaJS.UI.Interactions.ElementInteraction.extend("BetaJS.UI.Interactions.DropList", {
	
    constructor: function (element, options, data) {
		options = BetaJS.Objs.extend({
			droppable: function () {
				return true;
			},
			context: this,
			bounding_box: function (bb) {
				return bb;
			},
			floater: null
		}, options);
		this._inherited(BetaJS.UI.Interactions.DropList, "constructor", element, options);
		this._host.initialize("BetaJS.UI.Interactions.DropList.Idle");
		this.data = data;
		this._floater = BetaJS.$(this._options.floater);
		this._floater.css("display", "none");
	},
	
	destroy: function () {
		this._host.destroy();
		this._inherited(BetaJS.UI.Interactions.DropList, "destroy");
	},
	
	_enable: function () {
		this._host.state().next("Idle");
	},
	
	_disable: function () {
		this._host.state().next("Disabled");
	},
	
	__eventData: function () {
		return {
			index: this._floater.index(),
			element: this.element(),
			target: this,
			data: this.data,
			source: this._host.state()._drag_source ? this._host.state()._drag_source : null
		};
	},
	
	__triggerEvent: function (label) {
		this.trigger(label, this.__eventData());
	},

	droppable: function (source) {
		return this._options.droppable.call(this._options.context, source, this);
	},
	
	__update_floater: function (data) {
	    this._floater.css("display", "none");
	    var coords = data.page_coords;
	    var child = BetaJS.UI.Elements.Support.childContainingElement(this.element(), data.underneath);
	    if (!child)
	        return;
	    child = BetaJS.$(child);
	    if (child.get(0) == this._floater.get(0)) {
	        this._floater.css("display", "");
	        return;
	    }
	    var bb = BetaJS.UI.Elements.Support.elementBoundingBox(child);
	    bb = this._options.bounding_box.call(this._options.context, bb);
	    if (bb.top <= coords.y && coords.y <= bb.bottom)
	    	return;
        this._floater.css("display", "");
        if (coords.y < bb.top)
        	this._floater.insertBefore(child);
        else
        	this._floater.insertAfter(child);
	},
	
	insertAt: function (element, index) {
		var lastIndex = this.element().children().size();
		if (index < 0)
			index = Math.max(0, lastIndex + 1 + index);
		this.element().append(element);
		if (index < lastIndex) 
			this.element().children().eq(index).before(this.element().children().last());
	}
	
});

BetaJS.UI.Interactions.State.extend("BetaJS.UI.Interactions.DropList.Disabled", {
	
	_white_list: ["Idle"],
	
	trigger: function (label) {
		this.parent().__triggerEvent(label);
	}	

});

BetaJS.UI.Interactions.DropList.Disabled.extend("BetaJS.UI.Interactions.DropList.Idle", {
	
	_white_list: ["Hover", "Disabled"],

	_start: function () {
		this.on(this.element(), "drag-hover", function (event) {
			var drag_source = event.originalEvent.detail;
			if (this.parent().droppable(drag_source))
				this.next("Hover");
		});
	}

});

BetaJS.UI.Interactions.DropList.Disabled.extend("BetaJS.UI.Interactions.DropList.Hover", {
	
	_white_list: ["Idle", "Disabled", "Dropping"],
	_persistents: ["drag_source"],

	_start: function () {
		this.trigger("hover");
		this.on(this.element(), "drag-hover", function (event) {
			this._drag_source = event.originalEvent.detail;
			this.parent().__update_floater(this._drag_source);
		});
		this.on(this.element(), "drag-stop drag-leave", function (event) {
			this._drag_source = event.originalEvent.detail;
			this.next("Idle");
		});
		this.on(this.element(), "drag-drop", function (event) {
			this._drag_source = event.originalEvent.detail;
			this.parent().__update_floater(this._drag_source);
			this.next(this.parent()._floater.css("display") == "none" ? "Idle" : "Dropping");
		});
	},
	
	_end: function () {
		this.trigger("unhover");
		this.parent()._floater.css("display", "none");
		this._inherited(BetaJS.UI.Interactions.DropList.Hover, "_end");
	}

});

BetaJS.UI.Interactions.DropList.Disabled.extend("BetaJS.UI.Interactions.DropList.Dropping", {

	_white_list: ["Idle", "Disabled"],
	_persistents: ["drag_source"],

	_start: function () {
		this.trigger("dropped");
		this._drag_source.source.dropped(this.parent());
		this.next("Idle");
	}

});

BetaJS.States.CompetingHost.extend("BetaJS.UI.Gestures.ElementStateHost", {
    
    constructor: function (element, composite) {
        this._inherited(BetaJS.UI.Gestures.ElementStateHost, "constructor", composite);
        this._element = element;
    },
    
    element: function () {
        return this._element;
    }
    
});

BetaJS.UI.Gestures.ElementStateHost.extend("BetaJS.UI.Gestures.Gesture", {
	
	constructor: function (element, machine) {
        var composite = element.data("gestures");
        if (!composite) {
            composite = new BetaJS.States.CompetingComposite();
            element.data("gestures", composite);
        }
        this._inherited(BetaJS.UI.Gestures.Gesture, "constructor", element, composite);
        for (var key in machine) {
        	machine[key] = BetaJS.Objs.extend({
        		priority: 1,
        		exclusive: false,
        		retreat: "Retreat"
        	}, machine[key]);
        }
        this.initialize("BetaJS.UI.Gestures.EventDrivenState", {
            state_descriptor: machine,
            current_state: "Initial"
        });
	}
	
});


BetaJS.States.CompetingState.extend("BetaJS.UI.Gestures.ElementState", {

    _persistents: ["client_pos", "screen_pos"],

    _start: function () {
        this._inherited(BetaJS.UI.Gestures.ElementState, "_start");
        this.on("mousemove touchmove", function (event) {
            var original = event.type == "mousemove" ? event.originalEvent : event.originalEvent.touches[0];
            this._client_pos = {
                x: original.clientX,
                y: original.clientY
            };
            this._screen_pos = {
                x: original.screenX,
                y: original.screenY
            };
        });
    },

    element: function () {
        return this.host.element();
    },
    
    on: function (event, func) {
        var self = this;
        var events = event.split(" ");
        for (var i = 0; i < events.length; ++i) {
            this.element().on(events[i] + "." + BetaJS.Ids.objectId(this), function (event) {
                func.call(self, event);
            });
        }
    },
    
    _end: function () {
        this.element().off("." + BetaJS.Ids.objectId(this));
    },
    
    trigger: function () {
    	this.host.trigger.apply(this.host, arguments);
    }
        
});

BetaJS.Class.extend("BetaJS.UI.Gestures.ElementEvent", {
    
    constructor: function (element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementEvent, "constructor");
        this._element = element;
        this._callback = callback;
        this._context = context;
    },
    
    callback: function () {
        if (this._callback)
            this._callback.apply(this._context, arguments);
    },
    
    on: function (event, func, context, element) {
        var self = this;
        var events = event.split(" ");
        element = element || this._element;
        for (var i = 0; i < events.length; ++i) {
            element.on(events[i] + "." + BetaJS.Ids.objectId(this), function (event) {
                func.call(context || self, event);
            });
        }
    },

    destroy: function () {
        this._element.off("." + BetaJS.Ids.objectId(this));
        BetaJS.$("body").off("." + BetaJS.Ids.objectId(this));
        this._inherited(BetaJS.UI.Gestures.ElementEvent, "destroy");
    }
    
}); 

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.ElementTriggerEvent", {

    constructor: function (ev, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementTriggerEvent, "constructor", element, callback, context);
        this.on(ev, function () {
            this.callback();
        });
    }

});

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.BodyTriggerEvent", {

    constructor: function (ev, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementTriggerEvent, "constructor", element, callback, context);
        this.on(ev, function () {
            this.callback();
        }, this, BetaJS.$("body"));
    }

});

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.ElementTimerEvent", {

    constructor: function (time, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementTimerEvent, "constructor", element, callback, context);
        var self = this;
        if (time <= 0)
        	return;
        this._timer = setTimeout(function () {
            self.callback();
        }, time);
    },
    
    destroy: function () {
        clearTimeout(this._timer);
        this._inherited(BetaJS.UI.Gestures.ElementTimerEvent, "destroy");
    }

});

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.ElementMouseMoveOutEvent", {

    constructor: function (box, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementMouseMoveOutEvent, "constructor", element, callback, context);
        var position = null;
        var delta = [0,0];
        this.on("mousemove touchmove", function (event) {
            var original = event.type == "mousemove" ? event.originalEvent : event.originalEvent.touches[0];
            var current = [original.clientX, original.clientY];
            if (!position)
                position = current;
            delta[0] = Math.max(delta[0], Math.abs(position[0] - current[0]));
            delta[1] = Math.max(delta[1], Math.abs(position[1] - current[1]));
            if (("x" in box && box.x >= 0 && delta[0] >= box.x) || ("y" in box && box.y >= 0 && delta[1] >= box.y)) {
                this.callback();
            }
        });
    }

});

BetaJS.UI.Gestures.ElementState.extend("BetaJS.UI.Gestures.EventDrivenState", {

    _persistents: ["client_pos", "screen_pos", "state_descriptor"],
    _locals: ["current_state"],
    
    current_state: function () {
        return this._state_descriptor[this._current_state];
    },
    
    description: function () {
        return this._current_state;
    },
    
    nextDrivenState: function (state) {
        this.next("EventDrivenState", {current_state: state});
    },

    _start: function () {
        this._inherited(BetaJS.UI.Gestures.EventDrivenState, "_start");
        var state = this.current_state();
        if (state.start)
            state.start.apply(this);
        state.events = state.events || [];
        for (var i = 0; i < state.events.length; ++i) {
            function helper(event) {
                this._auto_destroy(new BetaJS.UI.Gestures[event.event](event.args, this.element(), function () {
                    this.nextDrivenState(event.target);
                }, this));
            }
            helper.call(this, state.events[i]);
        }
    },
    
    _end: function () {
        var state = this.current_state();
        if (state.end)
            state.end.apply(this);
        this._inherited(BetaJS.UI.Gestures.EventDrivenState, "_end");
    },
    
    can_coexist_with: function (foreign_state) {
        return !this.current_state().exclusive && !foreign_state.current_state().exclusive;
    },
    
    can_prevail_against: function (foreign_state) {
        return this.current_state().priority > foreign_state.current_state().priority;
    },
    
    retreat_against: function (foreign_state) {
        this.nextDrivenState(this.current_state().retreat);
    }    
    
});


BetaJS.UI.Gestures.defaultGesture = function (options) {
    options = BetaJS.Objs.extend({
    	mouse_up_activate: false,
        wait_time: 750,
        wait_activate: true,
        disable_x: 10,
        disable_y: 10,
        enable_x: -1,
        enable_y: -1,
        active_priority: 2
    }, options);
    return {
        "Initial": {
            events: [{
                event: "ElementTriggerEvent",
                args: BetaJS.UI.Events.Mouse.downEvent,
                target: "DownState"
            }]
        },
        "Retreat": {
            start: function () {
            	this.trigger("deactivate");
            	this.nextDrivenState("Initial");
            }
        },
        "DownState": {
            events: [{
                event: "BodyTriggerEvent",
                args: BetaJS.UI.Events.Mouse.upEvent,
                target: options.mouse_up_activate ? "ActiveState" : "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {x: options.disable_x, y: options.disable_y},
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {x: options.enable_x, y: options.enable_y},
                target: "ActiveState"
            }, {
                event: "ElementTimerEvent",
                args: options.wait_time,
                target: options.wait_activate ? "ActiveState" : "Initial"
            }]
        },
        "ActiveState": {
            priority: options.active_priority,
            exclusive: true,
            start: function () {
            	this.trigger("activate");
            	this.nextDrivenState("Initial");
            }
        }
    };
};