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
