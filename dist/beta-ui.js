/*!
betajs-ui - v1.0.0 - 2014-11-16
Copyright (c) Oliver Friedmann,Victor Lingenthal
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
			//this._css[key] = this._element.css(key);
			this._css[key] = this._element.get(0).style[key];
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
	clickEvent: BetaJS.Browser.Info.isMobile() ? "touchstart" : "click",
			
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

BetaJS.Class.extend("BetaJS.UI.Interactions.ElementInteraction", [
    BetaJS.Events.EventsMixin,
	{
    	
	constructor: function (element, options) {
		this._inherited(BetaJS.UI.Interactions.ElementInteraction, "constructor");
		BetaJS.UI.Hardware.MouseCoords.require();
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
	
	__on: function (element, event, callback, context) {
		var self = this;
		var events = event.split(" ");
		for (var i = 0; i < events.length; ++i)
			BetaJS.$(element).on(events[i] + "." + BetaJS.Ids.objectId(this), function () {
				callback.apply(context || self, arguments);
			});
	},
	
	destroy: function () {
		this.element().off("." + BetaJS.Ids.objectId(this));
		this.disable();
		this._host.destroy();
		BetaJS.UI.Hardware.MouseCoords.unrequire();
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

BetaJS.UI.Interactions.ElementInteraction.extend("BetaJS.UI.Interactions.Scroll", {
	
    constructor: function (element, options, data) {
    	options = BetaJS.Objs.extend({
    		discrete: false,
    		currentCenter: false,
    		currentTop: true,
    		scrollEndTimeout: 50
		}, options);
		this._inherited(BetaJS.UI.Interactions.Scroll, "constructor", element, options);
		this._itemsElement = options.itemsElement || element;
		this._disableScrollCounter = 0;
		this._host.initialize(this.cls.classname + ".Idle");
		this._scrollingDirection = true;
		this._lastScrollTop = null;
		this.__on(this.element(), "scroll", function () {
			var scrollTop = this.element().scrollTop();
			if (this._lastScrollTop !== null)
				this._scrollingDirection = scrollTop >= this._lastScrollTop;
			this._lastScrollTop = scrollTop;
		});
    },
    
    itemsElement: function () {
    	return this._itemsElement;
    },
    
    scrollingDirection: function () {
    	return this._scrollingDirection;
    },
    
    currentElement: function () {
    	var offset = this.element().offset();
    	var h = this._options["currentTop"] ? 0 : this.element().innerHeight() - 1;
    	var current = BetaJS.$(BetaJS.UI.Elements.Support.elementFromPoint(offset.left, offset.top + h));
    	while (current && current.parent().get(0) != this.itemsElement().get(0))
    		current = current.parent();
    	if (!this._options.currentCenter)
    		return current;    	
    	if (this._options.currentTop) {
    		var delta_top = this.element().offset().top - current.offset().top;
    		if (delta_top > current.outerHeight() / 2)
    			current = current.next();
    	} else {
    		var delta_bottom = this.element().offset().top + h - current.offset().top;
    		if (delta_bottom < current.outerHeight() / 2)
    			current = current.prev();
    	}
    	return current;
    },
    
    scrollTo: function (position, options) {
    	var scroll_top = position - (this._options["currentTop"] ? 0 : (this.element().innerHeight() - 1));
    	options = options || {};
    	options.scroll_top = scroll_top;
    	this._host.state().next("ScrollingTo", options);
    },
    
    scrollToElement: function (element, options) {
    	var top = element.offset().top - this.element().offset().top + this.element().scrollTop();
    	this.scrollTo(top + (this._options["currentTop"] ? 0 : (element.outerHeight() - 1)), options);
    },
    
    disableScroll: function () {
    	if (this._disableScrollCounter === 0)
        	this.element().css("overflow", "hidden");
    	this._disableScrollCounter++;
    },
    
    enableScroll: function () {
    	this._disableScrollCounter--;
    	if (this._disableScrollCounter === 0)
    		this.element().css("overflow", "scroll");
    },
    
    scrolling: function () {
    	return this._host.state().state_name() != "Idle";
    }

});


BetaJS.UI.Interactions.State.extend("BetaJS.UI.Interactions.Scroll.Idle", {
	
	itemsElement: function () {
		return this.parent().itemsElement();
	},
	
	_start: function () {
		this.on(this.element(), "scroll", function () {
			this.next("Scrolling");
		});
	}
	
});


BetaJS.UI.Interactions.Scroll.Idle.extend("BetaJS.UI.Interactions.Scroll.Scrolling", {
	
	_start: function () {
		this.__timer = null;
		this.on(this.element(), "scroll", function () {
			this._scroll();
			this.parent().trigger("scroll");
			clearTimeout(this.__timer);
			var opts = this.options();
			var self = this;
			this.__timer = setTimeout(function () {
				self.parent().disableScroll();
				self.parent().trigger("scrollend");
				self._scrollend();
				if (opts.discrete)
					self.parent().scrollToElement(self.parent().currentElement(), {
						animate: true,
						abortable: true
					});
				else
					self.eventualNext("Idle");
			}, opts.scrollEndTimeout);
		});
	},
	
	_scroll: function () {
	},
	
	_scrollend: function () {
	},
	
    _end: function () {
    	clearTimeout(this.__timer);
		this.parent().enableScroll();
		this._inherited(BetaJS.UI.Interactions.Scroll.Scrolling, "_end");
	}

});


BetaJS.UI.Interactions.Scroll.Idle.extend("BetaJS.UI.Interactions.Scroll.ScrollingTo", {
	
	_locals: ["scroll_top", "animate", "abortable"],
	
	_start: function () {
		if (!this._abortable)
			this.parent().disableScroll();
		this.parent().trigger("scrollto");
		this.on(this.element(), "scroll", function () {
			this._scroll();
		});
		if (this._abortable) {
			this.on(this.element(), "wheel", function () {
				this._moved = true;
				this._abort();
			});
			this.on(this.element(), "touchstart", function () {
				this._moved = true;
				this._abort();
			});
		}
		this.suspend();
		if (this._animate) {
			this._animation = new BetaJS.UI.Elements.DefaultAnimator(
				this.element(),
				{styles: {scrollTop: this._scroll_top}},
				this._finished,
				this);
			this._animation.start();
		} else {
			this.element().scrollTop(this._scroll_top);
			this._finished();
		}
	},
	
	_abort: function () {
		if (this._aborted)
				return;
		this._aborted = true;
		if (this._animate) {
			if (this._animation)
				this._animation.complete();
			this._animation = null;
		} else
			this._finished();
	},
	
	_finished: function () {
		this.parent().trigger("scrolltoend");
		this._scrollend();
		if (this._transitioning)
			this.eventualResume();
		else {
			this.resume();
			this.eventualNext(this._moved ? "Scrolling" : "Idle");
		}
	},
	
	_scroll: function () {		
	},

	_scrollend: function () {		
	},
	
    _transition: function () {
    	this._abort();
    },

    _end: function () {
    	if (!this._abortable)
    		this.parent().enableScroll();
		this._inherited(BetaJS.UI.Interactions.Scroll.ScrollingTo, "_end");
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
			drag_original_element: false,
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
		if (this._options.start_event) {
			this._element.on(this._options.start_event + "." + BetaJS.Ids.objectId(this), BetaJS.Functions.as_method(this.start, this));
		}
	},
	
	_disable: function () {
		this._element.off("." + BetaJS.Ids.objectId(this));
		this.stop();
	},
	
	start: function () {
		if (this._enabled)
			this._host.state().next("Dragging");
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
			page_coords: BetaJS.UI.Hardware.MouseCoords.coords,
			underneath: this.__underneath
		};
	},
	
	__triggerEvent: function (label) {
		this.trigger(label, this.__eventData());
	},
	
	__triggerDomEvent: function (label) {
		var data = this.__eventData();
		var underneath = BetaJS.UI.Elements.Support.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
		if (underneath)
			BetaJS.UI.Events.Support.dispatchElementEvent(underneath, "drag-" + label, data);
	},
	
	__triggerDomMove: function () {
		var data = this.__eventData();
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
	
	_white_list: ["Dragging"],
	
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

BetaJS.UI.Interactions.Drag.Idle.extend("BetaJS.UI.Interactions.Drag.Dragging", {
	
	_white_list: ["Stopping"],
	_persistents: ["initial_element_coords", "cloned_element", "cloned_modifier", "placeholder_cloned_element"],

	_start: function () {
		var opts = this.parent().options();
		this._page_coords = BetaJS.UI.Hardware.MouseCoords.coords;
		if (opts.clone_element) {
			this._initial_element_coords = {
				x: this.element().offset().left,
				y: this.element().offset().top
			};
			var zindex = this.element().css("z-index");
			var width = this.element().width();
			var height = this.element().height();
			if (opts.drag_original_element) {
				this._placeholder_cloned_element = this.element().clone();
				this._cloned_element = this.element().replaceWith(this._placeholder_cloned_element);
			} else {
				this._cloned_element = this.element().clone();
			}
			this._cloned_modifier = new BetaJS.UI.Elements.ElementModifier(this._cloned_element); 
			this._cloned_modifier.css("position", "absolute");
			this._cloned_modifier.css("width", width + "px");
			this._cloned_modifier.css("height", height + "px");
			this._cloned_modifier.css("z-index", zindex + 1);
			this._cloned_modifier.css("left", this._initial_element_coords.x + "px");
			this._cloned_modifier.css("top", this._initial_element_coords.y + "px");
			BetaJS.$("body").append(this._cloned_element);
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
		this.on("body", BetaJS.UI.Events.Mouse.moveEvent, this.__dragging);
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
	
	_white_list: ["Idle"],
	_locals: ["initial_element_coords", "cloned_element", "cloned_modifier", "immediately", "released", "placeholder_cloned_element"],
	
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
		if (this._cloned_modifier) {
			this._cloned_modifier.revert();
			this._cloned_modifier.destroy();
		}
		if (this._cloned_element) {
			if (this._placeholder_cloned_element) {
				this._cloned_element = this._placeholder_cloned_element.replaceWith(this._cloned_element);
			}
			this._cloned_element.remove();
		}
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
		if (!source.source.options().droppable)
			return false;
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

BetaJS.UI.Interactions.Scroll.extend("BetaJS.UI.Interactions.InfiniteScroll", {
	
    constructor: function (element, options, data) {
    	options = BetaJS.Objs.extend({
    		whitespace: 1000000,
    		append_count: 25,
    		prepend_count: 25,
    		height_factor: 3,
    		context: null,
    		append: null, // function (count, callback); callback should say how many and whether there could be more
    		prepend: null // function (count, callback); callback should say how many and whether there could be more 
		}, options);
		this._inherited(BetaJS.UI.Interactions.InfiniteScroll, "constructor", element, options);
		this._can_append = !!options.append;
		this._can_prepend = !!options.prepend;
		this._extending = false;
		if (options.prepend && options.whitespace) {
			this.__top_white_space = BetaJS.$("<whitespace></whitespace>");
			this.__top_white_space.css("display", "block");
			this.itemsElement().prepend(this.__top_white_space);
			this.__top_white_space.css("height", this.options().whitespace + "px");
			this.element().scrollTop(this.options().whitespace);
		}
    },
    
    append: function (count) {
    	if (this._can_append && !this._extending) {
    		this._extending = true;
    		var self = this;
    		this.options().append(count || this.options().append_count, function (added, done) {
    			self._extending = false;
    			self._can_append = done;
    			self.appended(added);
    		});
    	}
    },
    
    appendNeeded: function () {
    	var total_height = this.element().get(0).scrollHeight;
    	var element_height = this.element().innerHeight();
    	var hidden_height = total_height - (this.element().scrollTop() + element_height);
    	return hidden_height < this.options().height_factor * element_height;
    },
    
    prependNeeded: function () {
    	if (!this.options().prepend)
    		return false;
    	var element_height = this.element().innerHeight();
    	var hidden_height = this.element().scrollTop() - (this.__top_white_space ? parseInt(this.__top_white_space.css("height"), 10) : 0);
    	return hidden_height < this.options().height_factor * element_height;
    },
    
    prepend: function (count) {
    	if (this._can_prepend) {
    		this._extending = true;
    		var self = this;
    		this.options().prepend(count || this.options().prepend_count, function (added, done) {
    			if (self.__top_white_space)
    				self.element().prepend(self.__top_white_space);
    			self._extending = false;
    			self._can_prepend = done;
    			self.prepended(added);
    		});
    	}
    },
    
    appended: function (count) {
    	// nothing to do
    },
    
    prepended: function (count) {
    	var first = this.itemsElement().find(":nth-child(2)");
    	var last = this.itemsElement().find(":nth-child(" + (1 + count) + ")");
    	var h = last.offset().top - first.offset().top + last.outerHeight();
    	if (this.scrolling()) {
    		if (this.__top_white_space)
    			this.__top_white_space.css("height", (parseInt(this.__top_white_space.css("height"), 10) - h) + "px");
    	} else
    		this.element().scrollTop(this.element().scrollTop() - h);
    },
    
    extendFix: function () {
    	if (this.scrollingDirection()) {
    		if (this.appendNeeded())
    			this.append();
    	} else {
    		if (this.prependNeeded())
    			this.prepend();
    	}
    },
    
    _whitespaceFix: function () {
    	if (!this.__top_white_space)
    		return;
		var h = parseInt(this.__top_white_space.css("height"), 10);
		this.__top_white_space.css("height", this.options().whitespace + "px");
		this.element().scrollTop(this.element().scrollTop() + this.options().whitespace - h);
    }
    

});

BetaJS.UI.Interactions.Scroll.Idle.extend("BetaJS.UI.Interactions.InfiniteScroll.Idle", {
	
});


BetaJS.UI.Interactions.Scroll.Scrolling.extend("BetaJS.UI.Interactions.InfiniteScroll.Scrolling", {
	
	_scroll: function () {
		this.parent().extendFix();
	},
	
	_scrollend: function () {
		this.parent()._whitespaceFix();
	}

});


BetaJS.UI.Interactions.Scroll.ScrollingTo.extend("BetaJS.UI.Interactions.InfiniteScroll.ScrollingTo", {
	
	_scroll: function () {
		this.parent().extendFix();
	},
	
	_scrollend: function () {
		this.parent()._whitespaceFix();
	}

});

BetaJS.UI.Interactions.Scroll.extend("BetaJS.UI.Interactions.LoopScroll", {
	
    constructor: function (element, options, data) {
    	options = BetaJS.Objs.extend({
    		whitespace: 1000000
		}, options);
		this._inherited(BetaJS.UI.Interactions.LoopScroll, "constructor", element, options);
		this.__top_white_space = BetaJS.$("<whitespace></whitespace>");
		this.itemsElement().prepend(this.__top_white_space);
		this.__bottom_white_space = BetaJS.$("<whitespace></whitespace>");
		this.itemsElement().append(this.__bottom_white_space);
		this.__top_white_space.css("display", "block");
		this.__bottom_white_space.css("display", "block");
		this._whitespaceFix();
    },
    
    _rotateFix: function () {
    	var top_ws_height = parseInt(this.__top_white_space.css("height"), 10);
    	var bottom_ws_height = parseInt(this.__bottom_white_space.css("height"), 10);
    	var full_height = this.element().get(0).scrollHeight;
    	var visible_height = this.element().innerHeight();
    	var elements_height = full_height - top_ws_height - bottom_ws_height;
    	var scroll_top = this.element().scrollTop();
    	var count = this.itemsElement().children().length - 2;
    	var top_elements = (scroll_top - top_ws_height) / elements_height * count; 
    	var bottom_elements = (elements_height - (scroll_top - top_ws_height) - visible_height) / elements_height * count;
    	if (top_elements < 0) {
			top_ws_height = scroll_top - (elements_height - visible_height) / 2;
			this.__top_white_space.css("height", top_ws_height + "px");
    	} else if (bottom_elements < 0) {
			top_ws_height = scroll_top - (elements_height - visible_height) / 2;
			this.__top_white_space.css("height", top_ws_height + "px");
    	} else if (top_elements < bottom_elements - 1) {
	    	while (top_elements < bottom_elements - 1) {
				var item = this.itemsElement().find(":nth-last-child(2)");
				item.insertAfter(this.__top_white_space);
				top_ws_height -= item.outerHeight();
				this.__top_white_space.css("height", top_ws_height + "px");
				bottom_elements--;
				top_elements++;
	    	}
		} else if (bottom_elements < top_elements - 1) {
	    	while (bottom_elements < top_elements - 1) {
				item = this.itemsElement().find(":nth-child(2)");
				item.insertBefore(this.__bottom_white_space);
				top_ws_height += item.outerHeight();
				this.__top_white_space.css("height", top_ws_height + "px");
				bottom_elements++;
				top_elements--;
	    	}
    	}
    },
    
    _whitespaceFix: function () {
		this.__bottom_white_space.css("height", this.options().whitespace + "px");
		var h = parseInt(this.__top_white_space.css("height"), 10);
		this.__top_white_space.css("height", this.options().whitespace + "px");
		this.element().scrollTop(this.element().scrollTop() + this.options().whitespace - h);
    }

});

BetaJS.UI.Interactions.Scroll.Idle.extend("BetaJS.UI.Interactions.LoopScroll.Idle", {
	
});


BetaJS.UI.Interactions.Scroll.Scrolling.extend("BetaJS.UI.Interactions.LoopScroll.Scrolling", {
	
	_scroll: function () {
		this.parent()._rotateFix();
	},
	
	_scrollend: function () {
		this.parent()._whitespaceFix();
	}
	

});


BetaJS.UI.Interactions.Scroll.ScrollingTo.extend("BetaJS.UI.Interactions.LoopScroll.ScrollingTo", {
	
	_scroll: function () {
		this.parent()._rotateFix();
	},
	
	_scrollend: function () {
		this.parent()._whitespaceFix();
	}

});
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
        BetaJS.UI.Hardware.MouseCoords.require();
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
	},
	
	destroy: function () {
        BetaJS.UI.Hardware.MouseCoords.unrequire();
		this._inherited(BetaJS.UI.Gestures.Gesture, "destroy");
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
        var position = BetaJS.UI.Hardware.MouseCoords.coords;
        var delta = {x: 0, y: 0};
        this.on(BetaJS.UI.Events.Mouse.moveEvent, function (event) {
            var current = BetaJS.UI.Events.Mouse.pageCoords(event);
            delta.x = Math.max(delta.x, Math.abs(position.x - current.x));
            delta.y = Math.max(delta.y, Math.abs(position.y - current.y));
            if (("x" in box && box.x >= 0 && delta.x >= box.x) || ("y" in box && box.y >= 0 && delta.y >= box.y)) {
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