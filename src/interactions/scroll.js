BetaJS.UI.Interactions.ElementInteraction.extend("BetaJS.UI.Interactions.Scroll", {
	
    constructor: function (element, options, data) {
    	options = BetaJS.Objs.extend({
    		discrete: false,
    		currentCenter: false,
    		currentTop: true,
    		scrollEndTimeout: 50,
    		whitespace: 10000,
    		display_type: ""
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
    
    _whitespaceType: function () {
        if (this.options().display_type)
            return this.options().display_type;
        return this.element().css("display").indexOf('flex') >= 0 ? "flex" : "default";
    },

    _whitespaceCreate: function () {
        var whitespace = BetaJS.$("<whitespace></whitespace>");
        var type = this._whitespaceType();

        if (type == "flex") {
            whitespace.css("display", "-ms-flexbox");
            whitespace.css("display", "-webkit-flex");
            whitespace.css("display", "flex");
        } else
            whitespace.css("display", "block");

        return whitespace;
    },

    _whitespaceGetHeight: function (whitespace) {
        return whitespace ? parseInt(whitespace.css("height"), 10) : 0;
    },

    _whitespaceSetHeight: function (whitespace, height) {
    	if (!whitespace)
    		return;
        var type = this._whitespaceType();

        if (type == "flex") {
            whitespace.css("-webkit-flex", "0 0 " + height + "px");
            whitespace.css("-ms-flex", "0 0 " + height + "px");
            whitespace.css("flex", "0 0 " + height + "px");
        } else
            whitespace.css("height", height + "px");
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
    	var w = this.element().innerWidth() / 2;
    	var current = BetaJS.$(BetaJS.UI.Elements.Support.elementFromPoint(offset.left + w, offset.top + h));
    	while (current && current.get(0) && current.parent().get(0) != this.itemsElement().get(0))
    		current = current.parent();
    	if (!current || !current.get(0))
    		return null;
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
				var current = self.parent().currentElement();
				if (opts.discrete && current)
					self.parent().scrollToElement(current, {
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