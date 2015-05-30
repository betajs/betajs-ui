Scoped.define("module:Interactions.InfiniteScroll", [
        "module:Interactions.Scroll",
	    "base:Objs"
	], function (Scroll, Objs, scoped) {
	return Scroll.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (element, options, data) {
		    	options = Objs.extend({
		    		append_count: 25,
		    		prepend_count: 25,
		    		height_factor: 3,
		    		whitespace_bottom: false,
		    		context: null,
		    		append: null, // function (count, callback); callback should say how many and whether there could be more
		    		prepend: null // function (count, callback); callback should say how many and whether there could be more
				}, options);
		    	inherited.constructor.call(this, element, options);
				this._can_append = !!options.append;
				this._can_prepend = !!options.prepend;
				this._extending = false;
				if (options.prepend && this.options().whitespace) {
					this.__top_white_space = this._whitespaceCreate();
					this.itemsElement().prepend(this.__top_white_space);
				}
				if (this.options().whitespace_bottom) {
					this.__bottom_white_space = this._whitespaceCreate();
					this.itemsElement().append(this.__bottom_white_space);
				}
				this.reset(true);
		    },
		    
		    append: function (count) {
		    	var opts = this.options();
		    	if (this._can_append && !this._extending) {
		    		this._extending = true;
		    		var self = this;
		    		opts.append.call(opts.context, count || opts.append_count, function (added, done) {
		    			if (self.__bottom_white_space)
		    				self.itemsElement().append(self.__bottom_white_space);
		    			self._extending = false;
		    			self._can_append = done;
		    			self.appended(added);
		    		});
		    	}
		    },
		    
		    appendNeeded: function () {
		    	var total_height = this.element().get(0).scrollHeight;
		    	var element_height = this.element().innerHeight();
		    	var hidden_height = total_height - (this.element().scrollTop() + element_height) - this._whitespaceGetHeight(this.__bottom_white_space);
		    	return hidden_height < this.options().height_factor * element_height;
		    },
		    
		    prependNeeded: function () {
		    	if (!this.options().prepend)
		    		return false;
		    	var element_height = this.element().innerHeight();
		    	var hidden_height = this.element().scrollTop() - this._whitespaceGetHeight(this.__top_white_space);
		    	return hidden_height < this.options().height_factor * element_height;
		    },
		    
		    prepend: function (count) {
		    	var opts = this.options();
		    	if (this._can_prepend) {
		    		this._extending = true;
		    		var self = this;
		    		opts.prepend(opts.context, count || opts.prepend_count, function (added, done) {
		    			if (self.__top_white_space)
		    				self.itemsElement().prepend(self.__top_white_space);
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
		    		this._whitespaceSetHeight(this.__top_white_space, this._whitespaceGetHeight(this.__top_white_space) - h);
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
				var h = this._whitespaceGetHeight(this.__top_white_space);
		        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
				this.element().scrollTop(this.element().scrollTop() + this.options().whitespace - h);
		    },
		
		    reset: function (increment) {
		        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
		        if (this.options().prepend) {
			        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
			        this.element().scrollTop(this.options().whitespace + (increment ? this.element().scrollTop() : 0));
		        }
		    }
		    		
		};
	});
});


Scoped.define("module:Interactions.InfiniteScrollStates.Idle", ["module:Interactions.ScrollStates.Idle"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {});
});


Scoped.define("module:Interactions.InfiniteScrollStates.Scrolling", ["module:Interactions.ScrollStates.Scrolling"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent().extendFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});


Scoped.define("module:Interactions.InfiniteScrollStates.ScrollingTo", ["module:Interactions.ScrollStates.ScrollingTo"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent().extendFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});