Scoped.define("module:Interactions.Shiftscroll", [
	"module:Interactions.Scroll",
	"base:Async",
	"browser:Dom"
], function (Scroll, Async, Dom, scoped) {
	return Scroll.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function () {
		    	inherited.constructor.apply(this, arguments);		    			    
				this.__bottom_white_space = this._whitespaceCreate();
				this.itemsElement().appendChild(this.__bottom_white_space);
				this._whitespaceFix();
				Async.eventually(this._whitespaceFix, this);
		    },
		    
		    _whitespaceFix: function () {
		    	var boxHeight = this.element().clientHeight;
		    	var itemHeight = Dom.elementDimensions(this.itemsElement().firstElementChild).height;
				this._whitespaceSetHeight(this.__bottom_white_space, boxHeight - itemHeight);
		    }
		    		
		};
	});
});