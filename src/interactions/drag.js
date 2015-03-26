Scoped.define("module:Interactions.Drag", [
        "module:Interactions.ElementInteraction",
	    "module:Elements.ElementModifier",
	    "module:Elements.ElementSupport",
	    "module:Events.Support",
	    "module:Events.Mouse",
	    "module:Hardware.MouseCoords",
	    "base:Ids",
	    "base:Objs",
	    "base:Functions"
	], function (ElemInter, ElemMod, ElemSupp, EventsSupp, MouseEvents, MouseCoords, Ids, Objs, Functions, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (element, options, data) {
				options = Objs.extend({
					start_event: MouseEvents.downEvent,
					stop_event: MouseEvents.upEvent,
					draggable_x: true,
					draggable_y: true,
					clone_element: false,
					drag_original_element: false,
					droppable: false,
					remove_element_on_drop: false,
					revertable: true,
					draggable: function () {
						return true;
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
				inherited.destroy.call(this);
			},
			
			_enable: function () {
				if (this._options.start_event)
					this._element.on(this._options.start_event + "." + Ids.objectId(this), Functions.as_method(this.start, this));
			},
			
			_disable: function () {
				this._element.off("." + Ids.objectId(this));
				this.stop();
			},
			
			start: function () {
				if (this._enabled )
					this._host.state().next("Dragging");
			},
			
			stop: function () {
				if (this._enabled)
					this._host.state().next("Stopping");
			},
		
			draggable: function () {
				return this._options.draggable.call(this._options.context, this);
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
					page_coords: MouseCoords.coords,
					underneath: this.__underneath
				};
			},
			
			__triggerEvent: function (label) {
				this.trigger(label, this.__eventData());
			},
			
			__triggerDomEvent: function (label) {
				var data = this.__eventData();
				var underneath = ElemSupp.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
				if (underneath)
					EventsSupp.dispatchElementEvent(underneath, "drag-" + label, data);
			},
			
			__triggerDomMove: function () {
				var data = this.__eventData();
				var underneath = ElemSupp.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
				if (underneath) {
					if (this.__old_coords && this.__underneath && this.__underneath != underneath) {
						EventsSupp.dispatchPointsSeparatorEvent(underneath, "drag-enter", data.page_coords, this.__old_coords, data);
						EventsSupp.dispatchPointsSeparatorEvent(this.__underneath, "drag-leave", this.__old_coords, data.page_coords, data);
					}
					EventsSupp.dispatchElementEvent(underneath, "drag-hover", data);
				}
				this.__underneath = underneath;
				this.__old_coords = data.page_coords;
			}
		
		};
	});
});


Scoped.define("module:Interactions.DragStates.Idle", ["module:Interactions.State"], function (State, scoped) {
	return State.extend({scoped: scoped}, {
		
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
});


Scoped.define("module:Interactions.DragStates.Dragging", [
	    "module:Interactions.DragStates.Idle",
	    "module:Hardware.MouseCoords",
	    "module:Elements.ElementModifier",
	    "module:Events.Mouse",
	    "jquery:"
	], function (State, MouseCoords, ElementMod, MouseEvents, $, scoped) {
	return State.extend({scoped: scoped}, {
		
		_white_list: ["Stopping"],
		_persistents: ["initial_element_coords", "cloned_element", "cloned_modifier", "placeholder_cloned_element"],
	
		_start: function () {
			var opts = this.parent().options();
			this._page_coords = MouseCoords.coords;
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
				this._cloned_modifier = new ElementMod(this._cloned_element); 
				this._cloned_modifier.css("position", "absolute");
				this._cloned_modifier.css("width", width + "px");
				this._cloned_modifier.css("height", height + "px");
				this._cloned_modifier.css("z-index", zindex + 1);
				this._cloned_modifier.css("left", this._initial_element_coords.x + "px");
				this._cloned_modifier.css("top", this._initial_element_coords.y + "px");
				$("body").append(this._cloned_element);
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
					if (top === "auto" || !top)
						modifier.css("top", "0px");
					this._initial_element_coords.y = parseInt(modifier.css("top"), 10);
				}
			}
			this.trigger("start");
			this.on("body", MouseEvents.moveEvent, this.__dragging);
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
			var page_coords = MouseEvents.pageCoords(event);
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
});


Scoped.define("module:Interactions.DragStates.Stopping", [
	    "module:Interactions.DragStates.Idle",
	    "module:Elements.DefaultAnimator"
	], function (State, Animator, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle"],
			_locals: ["initial_element_coords", "cloned_element", "cloned_modifier", "immediately", "released", "placeholder_cloned_element"],
			
			/* Linter */
			_immediately: null,
			
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
				this.__animation = new Animator(this.parent().actionable_element(), {
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
				inherited._end.call(this);
			}
		
		};
	});
});