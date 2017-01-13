Scoped.define("module:Interactions.Droplist", [
        "module:Interactions.ElementInteraction",
	    "base:Objs",
	    "jquery:",
	    "module:Interactions.DroplistStates",
	    "browser:Dom"
	], [
	    "module:Interactions.DroplistStates.Disabled",
	    "module:Interactions.DroplistStates.Idle",
	    "module:Interactions.DroplistStates.Hover",
	    "module:Interactions.DroplistStates.Dropping"
	], function (ElemInter, Objs, $, DroplistStates, Dom, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data) {
				options = Objs.extend({
					droppable: function () {
						return true;
					},
					context: this,
					bounding_box: function (bb) {
						return bb;
					},
					floater: null
				}, options);
				inherited.constructor.call(this, element, options, DroplistStates);
				this._host.initialize("Idle");
				this.data = data;
				this._floater = $(this._options.floater);
				this._floater.css("display", "none");
			},
			
			destroy: function () {
				this._host.destroy();
				inherited.destroy.call(this);
			},
			
			element: function () {
				return $(this._element);
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
			    var child = Dom.childContainingElement(this.element(), data.underneath);
			    if (!child)
			        return;
			    child = $(child);
			    if (child.get(0) == this._floater.get(0)) {
			        this._floater.css("display", "");
			        return;
			    }
			    var bb = Dom.elementBoundingBox(child);
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
			
		};
	});
});



Scoped.define("module:Interactions.DroplistStates.Disabled", ["module:Interactions.State"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {
		
		_white_list: ["Idle"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		}	
	
	});
});


Scoped.define("module:Interactions.DroplistStates.Idle", ["module:Interactions.DroplistStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {
		
   		_white_list: ["Hover", "Disabled"],

   		_start: function () {
   			this.on(this.element(), "drag-hover", function (event) {
   				var drag_source = event.detail;
   				if (this.parent().droppable(drag_source))
   					this.next("Hover");
   			});
   		}
	
	});
});


Scoped.define("module:Interactions.DroplistStates.Hover", ["module:Interactions.DroplistStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle", "Disabled", "Dropping"],
			_persistents: ["drag_source"],
		
			_start: function () {
				this.trigger("hover");
				this.on(this.element(), "drag-hover", function (event) {
					this._drag_source = event.detail;
					this.parent().__update_floater(this._drag_source);
				});
				this.on(this.element(), "drag-stop drag-leave", function (event) {
					this._drag_source = event.detail;
					this.next("Idle");
				});
				this.on(this.element(), "drag-drop", function (event) {
					this._drag_source = event.detail;
					this.parent().__update_floater(this._drag_source);
					this.next(this.parent()._floater.css("display") == "none" ? "Idle" : "Dropping");
				});
			},
			
			_end: function () {
				this.trigger("unhover");
				this.parent()._floater.css("display", "none");
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.DroplistStates.Dropping", ["module:Interactions.DroplistStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {
	
		_white_list: ["Idle", "Disabled"],
		_persistents: ["drag_source"],
	
		_start: function () {
			this.trigger("dropped");
			this._drag_source.source.dropped(this.parent());
			this.next("Idle");
		}
	
	});
});
