BetaJS.UI.Interactions.Scroll.extend("BetaJS.UI.Interactions.LoopScroll", {
	
    constructor: function (element, options, data) {
		this._inherited(BetaJS.UI.Interactions.LoopScroll, "constructor", element, options);
		this.__top_white_space = this._whitespaceCreate();
		this.itemsElement().prepend(this.__top_white_space);
		this.__bottom_white_space = this._whitespaceCreate();
		this.itemsElement().append(this.__bottom_white_space);
        this.reset();
    },

    _rotateFix: function () {
    	var top_ws_height = this._whitespaceGetHeight(this.__top_white_space);
    	var bottom_ws_height = this._whitespaceGetHeight(this.__bottom_white_space);
    	var full_height = this.element().get(0).scrollHeight;
    	var visible_height = this.element().innerHeight();
    	var elements_height = full_height - top_ws_height - bottom_ws_height;
    	var scroll_top = this.element().scrollTop();
    	var count = this.itemsElement().children().length - 2;
    	var top_elements = (scroll_top - top_ws_height) / elements_height * count; 
    	var bottom_elements = (elements_height - (scroll_top - top_ws_height) - visible_height) / elements_height * count;
    	if (top_elements < 0) {
			top_ws_height = scroll_top - (elements_height - visible_height) / 2;
			this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
    	} else if (bottom_elements < 0) {
			top_ws_height = scroll_top - (elements_height - visible_height) / 2;
            this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
    	} else if (top_elements < bottom_elements - 1) {
	    	while (top_elements < bottom_elements - 1) {
				var item = this.itemsElement().find(":nth-last-child(2)");
				item.insertAfter(this.__top_white_space);
				top_ws_height -= item.outerHeight();
                this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
				bottom_elements--;
				top_elements++;
	    	}
		} else if (bottom_elements < top_elements - 1) {
	    	while (bottom_elements < top_elements - 1) {
				item = this.itemsElement().find(":nth-child(2)");
				item.insertBefore(this.__bottom_white_space);
				top_ws_height += item.outerHeight();
                this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
				bottom_elements++;
				top_elements--;
	    	}
    	}
    },
    
    _whitespaceFix: function () {
        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
		var h = this._whitespaceGetHeight(this.__top_white_space);
        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
		this.element().scrollTop(this.element().scrollTop() + this.options().whitespace - h);
    },

    reset: function () {
        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
        this.element().scrollTop(this.element().scrollTop() + this.options().whitespace);
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