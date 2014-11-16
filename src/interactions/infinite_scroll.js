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
