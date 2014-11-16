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