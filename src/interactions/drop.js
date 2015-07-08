Scoped.define("module:Interactions.Drop", [
        "module:Interactions.ElementInteraction",
	    "base:Objs",
	    "module:Elements.ElementSupport",
	    "module:Elements.ElementModifier"
	], function (ElemInter, Objs, ElemSupp, ElemMod, scoped) {
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
					}
				}, options);
				inherited.constructor.call(this, element, options);
				this._host.initialize(this.cls.classname + "States.Idle");
				this._modifier = new ElemMod(this._element);
				this.data = data;
			},
			
			destroy: function () {
				this._modifier.revert();
				this._modifier.destroy();
				this._host.destroy();
				inherited.destroy.call(this);
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
				var bb = ElemSupp.elementBoundingBox(this.element());
				bb = this._options.bounding_box.call(this._options.context, bb);
				var co = source.page_coords;
				return bb.left <= co.x && co.x <= bb.right && bb.top <= co.y && co.y <= bb.bottom;
			}
			
		};
	});
});


Scoped.define("module:Interactions.DropStates.Disabled", ["module:Interactions.State"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

		_white_list: ["Idle"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		}	
	
	});
});


Scoped.define("module:Interactions.DropStates.Idle", ["module:Interactions.DropStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

		_white_list: ["Hover", "InvalidHover", "Disabled"],
	
		_start: function () {
			this.on(this.element(), "drag-hover", function (event) {
				if (!this.parent()._enabled)
					return;
				var drag_source = event.originalEvent.detail;
				if (this.parent()._is_hovering(drag_source))
					this.next(this.parent().droppable(drag_source) ? "Hover" : "InvalidHover", {drag_source: drag_source});
			});
		}

   	});
});


Scoped.define("module:Interactions.DropStates.Hover", ["module:Interactions.DropStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
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
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.DropStates.InvalidHover", ["module:Interactions.DropStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
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
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.DropStates.Dropping", ["module:Interactions.DropStates.Disabled"], function (State, scoped) {
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
