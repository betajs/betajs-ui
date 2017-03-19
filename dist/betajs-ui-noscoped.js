/*!
betajs-ui - v1.0.34 - 2017-03-19
Copyright (c) Victor Lingenthal,Oliver Friedmann
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.UI');
Scoped.binding('base', 'global:BetaJS');
Scoped.binding('browser', 'global:BetaJS.Browser');
Scoped.binding('dynamics', 'global:BetaJS.Dynamics');
Scoped.define("module:", function () {
	return {
    "guid": "ff8d5222-1ae4-4719-b842-1dedb9162bc0",
    "version": "1.0.34"
};
});
Scoped.assumeVersion('base:version', '~1.0.96');
Scoped.assumeVersion('browser:version', '~1.0.62');
Scoped.define("module:Dynamics.GesturePartial", [
    "dynamics:Handlers.Partial",
    "module:Gestures.Gesture",
    "module:Gestures",
    "base:Objs"
], [
	"module:Gestures.defaultGesture"
], function (Partial, Gesture, Gestures, Objs, scoped) {
 	var Cls = Partial.extend({scoped: scoped}, function (inherited) {
		return {
			
			_apply: function (value) {
				var node = this._node;
				var handler = node._handler;
				node.gestures = node.gestures || {};
				if (this._postfix in node.gestures && !node.gestures[this._postfix].destroyed())
					return;
				value = Objs.extend(value, value.options);
				var element = this._node.element();
				var gesture = new Gesture(element, Gestures.defaultGesture(value));
				node.gestures[this._postfix] = gesture;
				gesture.on("activate", function () {
					if (value.activate_event)
						handler.call(value.activate_event, value.data, this._node, gesture);
					if (value.interaction && node.interactions && node.interactions[value.interaction] && node.interactions[value.interaction].start)
						node.interactions[value.interaction].start();
				}, this);
				gesture.on("deactivate", function () {
					if (value.deactivate_event)
						handler.call(value.deactivate_event, value.data, this._node, gesture);
					if (value.interaction && node.interactions && node.interactions[value.interaction] && node.interactions[value.interaction].stop)
						node.interactions[value.interaction].stop();
				}, this);		
				if (value.transition_event) {
					gesture.on("start", function () {
						handler.call(value.transition_event, element, gesture);
					}, this);
				}
			},
			
			_deactivate: function () {
				this.__release();
			},
			
			__release: function () {
				var node = this._node;
				node.gestures = node.gestures || {};
				if (this._postfix in node.gestures)
					node.gestures[this._postfix].weakDestroy();
				delete node.gestures[this._postfix];
			},
			
			destroy: function () {
				this.__release();
				inherited.destroy.call(this);
			}

		};
 	});
 	Cls.register("ba-gesture");
	return Cls;
});
Scoped.define("module:Dynamics.InteractionPartial", [
    "dynamics:Handlers.Partial",
    "module:Interactions",
    "base:Strings",
    "base:Objs",
    "base:Types"
], function (Partial, Interactions, Strings, Objs, Types, scoped) {
 	var Cls = Partial.extend({scoped: scoped}, function (inherited) {
 		return {
			
			_apply: function (value) {
				var node = this._node;
				var handler = node._handler;
				node.interactions = node.interactions || {};
				if (this._postfix in node.interactions && !node.interactions[this._postfix].destroyed()) {
					node.interactions[this._postfix].data = value.data;
					return;
				} 
				value = Objs.extend(value, value.options);
				var InteractionClass = Interactions[Strings.capitalize(value.type)];
				var elem = value.sub ? this._node.element().querySelector(value.sub) : this._node.element();
				var interaction = new InteractionClass(elem, Objs.extend({
					enabled: true,
					context: handler
				}, value), value.data);
				node.interactions[this._postfix] = interaction;
				Objs.iter(value.events, function (callee, event) {
					interaction.on(event, function (arg1, arg2, arg3, arg4) {
						if (Types.is_string(callee))
							handler.call(callee, this._value.data, arg1, arg2, arg3, arg4);
						else
							callee.call(handler, this._value.data, arg1, arg2, arg3, arg4);
					}, this);
				}, this);
			},
			
			_deactivate: function () {
				this.__release();
			},
			
			__release: function () {
				var node = this._node;
				node.interactions = node.interactions || {};
				if (this._postfix in node.interactions)
					node.interactions[this._postfix].weakDestroy();
			},
			
			destroy: function () {
				this.__release();
				inherited.destroy.call(this);
			}

 		};
 	});
 	Cls.register("ba-interaction");
	return Cls;
});

Scoped.define("module:Elements.Animators", [
    "base:Class",
    "base:Objs",
    "browser:Dom"
], function (Class, Objs, Dom, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element, options, callback, context) {
				inherited.constructor.call(this);
				this._element = Dom.unbox(element);
				this._options = Objs.extend({
					callback_on_revert: true,
					callback_on_complete: true,
					auto_start: true,
					auto_destroy: true
				}, options);
				this._callback = callback;
				this._context = context;
				this._running = false;
				if (this._options.auto_start)
					this.start();
			},
			
			start: function () {
				if (this._running)
					return;
				this._running = true;
				this._start();
			},
			
			revert: function () {
				if (!this._running)
					return;
				this._running = false;
				this._revert();
			},
			
			complete: function () {
				if (!this._running)
					return;
				this._complete();
			},
			
			__callback: function () {
				if (this.destroyed())
					return;
				this._callback.apply(this._context || this);
				if (this._options && this._options.auto_destroy)
					this.destroy();
			},
			
			_finished: function () {
				this.__callback();
			},
			
			_reverted: function () {
				if (this._options.callback_on_revert)
					this.__callback();
			},
			
			_completed: function () {
				if (this._options.callback_on_complete)
					this.__callback();
			},
			
			_start: function () {
				this._finished();
			},
			
			_revert: function () {
				this._reverted();
			},
			
			_complete: function () {
				this._completed();
			}
		
		};
	});
});


Scoped.define("module:Elements.DefaultAnimator", [
    "module:Elements.Animators",
    "base:Objs",
    "base:Types",
    "base:Timers.Timer"
], function (Animators, Objs, Types, Timer, scoped) {
	return Animators.extend({scoped: scoped}, function (inherited) {
		
		var Methods = {
			linear: function (x) {
				return x;
			},
			swing: function (x) {
				return Math.sin(x * Math.PI / 2);
			}
		};
		
		return {
	
			constructor: function (element, options, callback, context) {
				options = Objs.extend({
					duration: 250,
					delay: 10,
					styles: {},
					method: "swing"
				}, options);
				if (Types.is_string(options.method))
					options.method = Methods[options.method] || Methods.linear;
				this.__timer = this.auto_destroy(new Timer({
					delay: options.delay,
					start: false,
					context: this,
					fire: this.__fire
				}));
				inherited.constructor.call(this, element, options, callback, context);
			},

			__setProgress: function (progress) {
				progress = Math.max(0.0, Math.min(1.0, progress));
				Objs.iter(this.__styles, function (value, key) {
					value.target[key] = Math.round(value.start + (value.end - value.start) * progress) + value.postfix;
				}, this);
			},
			
			__fire: function () {
				this.__setProgress(this._options.method(this.__timer.duration() / this._options.duration));
				if (this.__timer.duration() >= this._options.duration)
					this._complete();
			},
		
			_start: function () {
				this.__completed = false;
				this.__timer.stop();
				this.__styles = Objs.map(this._options.styles, function (value, key) {
					var target = key in this._element ? this._element : this._element.style;
					return {
						target: target,
						start: parseFloat(target[key]),
						end: parseFloat(value),
						postfix: Types.is_string(value) ? value.replace(/[\d\.]/g, "") : ""
					};
				}, this);
				this.__timer.start();
			},
			
			_revert: function () {
				this.__timer.stop();
				this.__setProgress(0.0);
				this._reverted();
			},
			
			_complete: function () {
				if (this.__completed)
					return;
				this.__completed = true;
				this.__setProgress(1.0);
				this.__timer.stop();
				this._completed();
			}			
	
		};
	});
});

Scoped.define("module:Elements.ElementModifier", [
    "base:Class",
    "browser:Dom"
], function (Class, Dom, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element) {
				inherited.constructor.call(this);
				this._element = Dom.unbox(element);
				this._css = {};
				this._cls = {};
			},
			
			css: function (key, value) {
				if (arguments.length < 2)
					return this._element.style[key];
				if (this._element.style[key] === value)
					return value;
				if (!(key in this._css))
					this._css[key] = this._element.style[key];
				this._element.style[key] = value;
				return value;
			},
			
			csscls: function (key, value) {
				var has = Dom.elementHasClass(this._element, key);
				if (arguments.length < 2)
					return key;
				if (has === value)
					return value;
				if (!(key in this._cls))
					this._cls[key] = has;
				if (value)
					Dom.elementAddClass(this._element, key);
				else
					Dom.elementRemoveClass(this._element, key);
				return value;
			},
			
			removeClass: function (cls) {
				if (!Dom.elementHasClass(this._element, cls))
					return;
				if (!(cls in this._cls))
					this._cls[cls] = true;
				Dom.elementAddClass(this._element, cls);
			},
			
			revert: function () {
				for (var key in this._css)
					this._element.style[key] = this._css[key];
				for (key in this._cls) {
					if (this._cls[key])
						Dom.elementAddClass(this._element, key);
					else
						Dom.elementRemoveClass(this._element, key);
				}
			}
		
		};
	});
});
Scoped.define("module:Events.Mouse", ["browser:Info"], function (Info) {
	return {		
			
		downEvent: function () {
			return Info.isMobile() ? "touchstart" : "mousedown";	
		},
		
		moveEvent: function () {
			return Info.isMobile() ? "touchmove" : "mousemove";	
		},	
		
		upEvent: function () {
			return Info.isMobile() ? "touchend" : "mouseup";	
		},
		
		clickEvent: function () {
			return Info.isMobile() ? "touchstart" : "click";	
		},
				
		customCoords: function (event, type, multi) {
			if (event.touches && event.touches.length) {
				var touches = event.touches;
				if (multi) {
					var touch_coords = [];
					for (var i = 0; i < touches.length; ++i) {
						touch_coords.push({
							x: touches[i][type + "X"],
							y: touches[i][type + "Y"]
						});
					}
					return touch_coords;
				}
				return {
					x: touches[0][type + "X"],
					y: touches[0][type + "Y"]
				};
			}
			var coords = {
				x: event[type + "X"],
				y: event[type + "Y"]
			};
			return multi ? [coords] : coords;
		},
		
		pageCoords: function (event, multi) {
			return this.customCoords(event, "page", multi);
		},
		
		clientCoords: function (event, multi) {
			return this.customCoords(event, "client", multi);
		},
	
		screenCoords: function (event, multi) {
			return this.customCoords(event, "screen", multi);
		}

	};
});
Scoped.define("module:Events.Support", [
	    "base:Objs",
	    "base:Types",
	    "browser:Dom"
	], function (Objs, Types, Dom) {
	return {		
	
		dispatchElementEvent: function (element, label, data, options) {
			element.dispatchEvent(new CustomEvent(label, Objs.extend({
				bubbles: true,
				cancelable: true,
				detail: data
			}, options)));
		},
		
		dispatchElementsEvent: function (elements, label, data, options) {
			for (var i = 0; i < elements.length; ++i) {
				elements[i].dispatchEvent(new CustomEvent(label, Objs.extend({
					bubbles: false,
					cancelable
					: true,
					detail: data
				}, options)));
			}
		},
		
		dispatchManualBubbleEvent: function (element, label, predicate, data, options) {
			var elements = [];
			var current = Dom.unbox(element);
			while (current) {
				if (predicate(current))
					elements.push(current);
				current = current.parentNode;
			}
			this.dispatchElementsEvent(elements, label, data, options); 
		},
		
		dispatchPointsSeparatorEvent: function (element, label, included, excluded, data, options) {
			included = included ? (Types.is_array(included) ? included : [included]) : [];
			excluded = excluded ? (Types.is_array(excluded) ? excluded : [excluded]) : [];
			this.dispatchManualBubbleEvent(element, label, function (element) {
				for (var i = 0; i < included.length; ++i) {
					if (!Dom.pointWithinElement(included[i].x, included[i].y, element))
						return false;
				}
				for (i = 0; i < excluded.length; ++i) {
					if (Dom.pointWithinElement(excluded[i].x, excluded[i].y, element))
						return false;
				}
				return true;
			}, data, options);
		}
	
	};
});

Scoped.define("module:Gestures.ElementStateHost", [
    "base:States.CompetingHost",
    "module:Gestures.GestureStates",
    "base:Classes.ClassRegistry",
    "browser:Dom"
], function (CompetingHost, GestureStates, ClassRegistry, Dom, scoped) {
	return CompetingHost.extend({scoped: scoped}, function (inherited) {
		return {
		    
		    constructor: function (element, composite) {
		        inherited.constructor.call(this, composite, {
		        	stateRegistry: new ClassRegistry(GestureStates)
		        });
		        this._element = Dom.unbox(element);
		    },
		    
		    element: function () {
		        return this._element;
		    }

		};
	});
});


Scoped.define("module:Gestures.Gesture", [
	    "module:Gestures.ElementStateHost",
	    "base:States.CompetingComposite",
	    "base:Objs",
	    "module:Gestures.GestureStates.EventDrivenState",
	    "browser:Dom"
	], function (ElementStateHost, CompetingComposite, Objs, EventDrivenState, Dom, scoped) {
	return ElementStateHost.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element, machine) {
				element = Dom.unbox(element);
		        var composite = element.gestures_handler;
		        if (!composite) {
		            composite = new CompetingComposite();
		            element.gestures_handler = composite;
		        }
		        inherited.constructor.call(this, element, composite);
		        for (var key in machine) {
		        	machine[key] = Objs.extend({
		        		priority: 1,
		        		exclusive: false,
		        		retreat: "Retreat"
		        	}, machine[key]);
		        }
		        this.initialize(EventDrivenState, {
		            state_descriptor: machine,
		            current_state: "Initial"
		        });
			}
	
		};
	});	
});


Scoped.define("module:Gestures.ElementState", [
    "base:States.CompetingState",
    "base:Ids",
    "base:Objs",
    "browser:Events"
], function (CompetingState, Ids, Objs, DomEvents, scoped) {
  	return CompetingState.extend({scoped: scoped}, function (inherited) {
  		return {

		    _persistents: ["client_pos", "screen_pos"],
		    
		    constructor: function () {
		    	inherited.constructor.apply(this, arguments);
		    	this._domevents = this.auto_destroy(new DomEvents());
		    },
		
		    _start: function () {
		    	inherited._start.call(this);
		        this.on("mousemove touchmove", function (event) {
		            var original = event.type == "mousemove" ? event : event.touches[0];
		            this._client_pos = {
		                x: original.clientX,
		                y: original.clientY
		            };
		            this._screen_pos = {
		                x: original.screenX,
		                y: original.screenY
		            };
		        });
		    },
		
		    element: function () {
		        return this.host.element();
		    },
		    
		    on: function (event, func) {
	        	this._domevents.on(this.element(), event, function (event) {
	        		func.call(this, event);
	        	}, this);
		    },
		    
		    _end: function () {
		    	this._domevents.clear();
		    },
		    
		    trigger: function () {
		    	this.host.trigger.apply(this.host, arguments);
		    }
		   
  		};
  	});
});


Scoped.define("module:Gestures.ElementEvent", [
    "base:Class",
    "base:Ids",
    "base:Objs",
    "browser:Events",
    "browser:Dom"
], function (Class, Ids, Objs, DomEvents, Dom, scoped) {
 	return Class.extend({scoped: scoped}, function (inherited) {
 		return {
		    
		    constructor: function (element, callback, context) {
		        inherited.constructor.call(this);
		        this._element = element;
		        this._callback = callback;
		        this._context = context;
		        this._domevents = this.auto_destroy(new DomEvents());
		    },
		    
		    callback: function () {
		        if (this._callback)
		            this._callback.apply(this._context, arguments);
		    },
		    
		    on: function (event, func, context, element) {
		    	element = Dom.unbox(element || this._element);
		    	event.split(" ").forEach(function (eventName) {
		    		this._domevents.on(element, eventName, func, context || this);
		    	}, this);
		    }
		
 		};
 	});
}); 


Scoped.define("module:Gestures.ElementTriggerEvent", ["module:Gestures.ElementEvent"], function (ElementEvent, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (ev, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        this.on(ev, function () {
		            this.callback();
		        });
		    }
		
		};
	});	
});


Scoped.define("module:Gestures.BodyTriggerEvent", ["module:Gestures.ElementEvent"], function (ElementEvent, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (ev, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        this.on(ev, function () {
		            this.callback();
		        }, this, document.body);
		    }
		
		};
	});	
});


Scoped.define("module:Gestures.ElementTimerEvent", ["module:Gestures.ElementEvent"], function (ElementEvent, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (time, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        var self = this;
		        if (time <= 0)
		        	return;
		        this._timer = setTimeout(function () {
		            self.callback();
		        }, time);
		    },
		    
		    destroy: function () {
		        clearTimeout(this._timer);
		        inherited.destroy.call(this);
		    }		    
		
		};
	});	
});


Scoped.define("module:Gestures.ElementScrollEvent", ["module:Gestures.ElementEvent", "base:Time"], function (ElementEvent, Time, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (options, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        this.last_scroll_event = null;
		        this.scroll_start_event = null;
		        this.scroll_threshold = options.threshold;
		        this.on("scroll", this.__scroll, this, options.element);
		    },
		    
		    __scroll: function () {
		    	if (this.destroyed())
		    		return;
		    	var now = Time.now();
		    	if (this.scroll_start_event === null || (this.last_scroll_event && now - this.last_scroll_event > 50)) {
		    		this.scroll_start_event = now;
		    		this.last_scroll_event = now;
		    		return;
		    	}
	    		this.last_scroll_event = now;
	    		var delta = now - this.scroll_start_event;
	    		if (delta > this.scroll_threshold)
	    			this.callback();
		    }
		
		};
	});	
});


Scoped.define("module:Gestures.ElementScrollEndEvent", ["module:Gestures.ElementEvent", "base:Time"], function (ElementEvent, Time, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (options, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        this.__fire();
		        this.on("scroll", this.__fire, this, options.element);
		    },
		    
		    __fire: function () {
		    	if (this.destroyed())
		    		return;
		    	if (this.timer)
		    		clearTimeout(this.timer);
		    	var self = this;
		    	this.timer = setTimeout(function () {
		    		self.callback();
		    	}, 50);
		    }
		
		};
	});	
});



Scoped.define("module:Gestures.ElementMouseMoveOutEvent", [
        "module:Gestures.ElementEvent",
        "module:Events.Mouse"
    ], function (ElementEvent, MouseEvents, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {
		
		    constructor: function (box, element, callback, context) {
		    	inherited.constructor.call(this, element, callback, context);
		        var position = {};
		        var delta = {x: 0, y: 0};
		        this.on(MouseEvents.moveEvent(), function (event) {
		        	if (!position.x && !position.y)
		        		position = MouseEvents.pageCoords(event);
		            var current = MouseEvents.pageCoords(event);
		            delta.x = Math.max(delta.x, Math.abs(position.x - current.x));
		            delta.y = Math.max(delta.y, Math.abs(position.y - current.y));
		            if (("x" in box && box.x >= 0 && delta.x >= box.x) || ("y" in box && box.y >= 0 && delta.y >= box.y))
		                this.callback();
		        });
		    }

		};
	});
});


Scoped.define("module:Gestures.GestureStates.EventDrivenState", [
       "module:Gestures.ElementState",
       "module:Gestures"
   ], function (ElementState, Gestures, scoped) {
	return ElementState.extend({scoped: scoped}, function (inherited) {
		return {
		
		    _persistents: ["client_pos", "screen_pos", "state_descriptor"],
		    _locals: ["current_state"],
		    
		    /* Defining for linter */
		    _state_descriptor: null,
		    _current_state: null,
		    
		    current_state: function () {
		        return this._state_descriptor[this._current_state];
		    },
		    
		    description: function () {
		        return this._current_state;
		    },
		    
		    nextDrivenState: function (state) {
		        this.next("EventDrivenState", {current_state: state});
		    },
		
		    _start: function () {
		    	inherited._start.call(this);
		        var state = this.current_state();
		        if (state.start)
		            state.start.apply(this);
		        state.events = state.events || [];
	            var helper = function (event) {
	                this._auto_destroy(new Gestures[event.event](event.args, this.element(), function () {
	                    this.nextDrivenState(event.target);
	                }, this));
	            };
		        for (var i = 0; i < state.events.length; ++i)
		            helper.call(this, state.events[i]);
		    },
		    
		    _end: function () {
		        var state = this.current_state();
		        if (state.end)
		            state.end.apply(this);
		        inherited._end.call(this);
		    },
		    
		    can_coexist_with: function (foreign_state) {
		        return !this.current_state().exclusive && !foreign_state.current_state().exclusive;
		    },
		    
		    can_prevail_against: function (foreign_state) {
		        return this.current_state().priority > foreign_state.current_state().priority;
		    },
		    
		    retreat_against: function (foreign_state) {
		        this.nextDrivenState(this.current_state().retreat);
		    }  
		    
		};
	});  
});



Scoped.define("module:Gestures.defaultGesture", [
        "base:Objs",
        "module:Events.Mouse"
    ], [
        "module:Gestures.ElementTriggerEvent",
        "module:Gestures.BodyTriggerEvent",
        "module:Gestures.ElementTimerEvent",
        "module:Gestures.ElementScrollEvent",
        "module:Gestures.ElementScrollEndEvent",
        "module:Gestures.ElementMouseMoveOutEvent"
    ], function (Objs, MouseEvents) {
	return function (options) {
	    options = Objs.extend({
	    	mouse_up_activate: false,
	        wait_time: 750,
	        wait_activate: true,
	        disable_x: 10,
	        disable_y: 10,
	        enable_x: -1,
	        enable_y: -1,
	        active_priority: 2,
	        disable_scroll_element: null,
	        disable_scroll_time: 500
	    }, options);
	    return {
	        "Initial": {
	            events: Objs.filter([{
	                event: "ElementTriggerEvent",
	                args: MouseEvents.downEvent(),
	                target: "DownState"
	            }, options.disable_scroll_element === null ? null : {
	            	event: "ElementScrollEvent",
	            	args: {element: options.disable_scroll_element, threshold: options.disable_scroll_time},
	            	target: "DisableScroll"
	            }], function (ev) { return !!ev; })
	        },
	        "DisableScroll": {
	            events: [{
	                event: "ElementScrollEndEvent",
	                args: {element: options.disable_scroll_element},
	                target: "Initial"
	            }]
	        },
	        "Retreat": {
	            start: function () {
	            	this.trigger("deactivate");
	            	this.nextDrivenState("Initial");
	            }
	        },
	        "DownState": {
	            events: Objs.filter([options.mouse_up_activate === null ? null : {
	                event: "BodyTriggerEvent",
	                args: MouseEvents.upEvent(),
	                target: options.mouse_up_activate ? "ActiveState" : "Initial"
	            }, {
	                event: "ElementMouseMoveOutEvent",
	                args: {x: options.disable_x, y: options.disable_y},
	                target: "Initial"
	            }, {
	                event: "ElementMouseMoveOutEvent",
	                args: {x: options.enable_x, y: options.enable_y},
	                target: "ActiveState"
	            }, options.wait_activate === null ? null : {
	                event: "ElementTimerEvent",
	                args: options.wait_time,
	                target: options.wait_activate ? "ActiveState" : "Initial"
	            }, options.disable_scroll_element === null ? null : {
	            	event: "ElementScrollEvent",
	            	args: {element: options.disable_scroll_element, threshold: options.disable_scroll_time},
	            	target: "DisableScroll"
	            }], function (ev) { return !!ev; })
	        },
	        "ActiveState": {
	            priority: options.active_priority,
	            exclusive: true,
	            start: function () {
	            	this.trigger("activate");
	            	this.nextDrivenState("Initial");
	            }
	        }
	    };
	};
});
Scoped.define("module:Hardware.MouseCoords", [
    "base:Ids",
    "base:Objs",
    "browser:Events",
    "module:Events.Mouse"
], function (Ids, Objs, DomEvents, MouseEvents) {
	return {		
			
		__required: 0,
		
		__domevents: null,
		
		coords: {x: 0, y: 0},
			
		require: function () {
			if (this.__required === 0) {
				this.__domevents = new DomEvents();
				this.__domevents.on(document.body, [MouseEvents.moveEvent(), MouseEvents.upEvent(), MouseEvents.downEvent()].join(" "), function (event) {
					var result = MouseEvents.pageCoords(event);
					if (result.x && result.y)
						this.coords = result; 
				}, this);
			}
			this.__required++;
		},
		
		unrequire: function () {
			this.__required--;
			if (this.__required === 0)
				this.__domevents.destroy();
		}
		
	};
});
Scoped.define("module:Helpers.Interactor", [
    "base:Class",
    "base:Objs",
    "base:Types",
    "base:Promise",
    "base:Async",
    "browser:Dom"
], function (Class, Objs, Types, Promise, Async, Dom, scoped) {
    return Class.extend({scoped: scoped}, function (inherited) {
        return {

            constructor: function (options) {
                inherited.constructor.apply(this);
                this._options = Objs.extend({
                    delay: 1
                }, options);
            },

            _element: function (element) {
                return element ? (Types.is_string(element) ? document.querySelector(element) : element) : document.body;
            },

            mousedown: function (element) {
                return this._event(element, "mousedown");
            },

            mouseup: function (element) {
                return this._event(element, "mouseup");
            },

            mousemoveToElement: function (targetElement, element) {
                targetElement = this._element(targetElement);
                var offset = Dom.elementOffset(targetElement);
                var dims = Dom.elementDimensions(targetElement);
                return this._event(element, "mousemove", {
                    pageX: offset.left + dims.width/2,
                    pageY: offset.top + dims.height/2
                });
            },

            _event: function (element, event, params) {
                var promise = Promise.create();
                element = this._element(element ? (Types.is_string(element) ? document.querySelector(element) : element) : document.body);
                Async.eventually(function () {
                    Dom.triggerDomEvent(element, event, params);
                    promise.asyncSuccess(element);
                }, this._options.delay);
                return promise;
            }

        };
    });
});
Scoped.define("module:Interactions.Drag", [
        "module:Interactions.ElementInteraction",
	    "module:Elements.ElementModifier",
	    "browser:Dom",
	    "module:Events.Support",
	    "module:Events.Mouse",
	    "module:Hardware.MouseCoords",
	    "base:Ids",
	    "base:Objs",
	    "module:Interactions.DragStates"
	], [
	    "module:Interactions.DragStates.Idle",
	    "module:Interactions.DragStates.Dragging",
	    "module:Interactions.DragStates.Stopping"
	], function (ElemInter, ElemMod, Dom, EventsSupp, MouseEvents, MouseCoords, Ids, Objs, DragStates, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (element, options, data) {
				options = Objs.extend({
					start_event: MouseEvents.downEvent(),
					stop_event: MouseEvents.upEvent(),
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
				inherited.constructor.call(this, element, options, DragStates);
				this._host.initialize("Idle");
				this._modifier = new ElemMod(this.element());
				this.data = data;
			},
			
			destroy: function () {
				this._modifier.revert();
				this._modifier.destroy();
				inherited.destroy.call(this);
			},
			
			_enable: function () {
				if (this._options.start_event)
					this.__on(this.element(), this._options.start_event, this.start, this);
			},
			
			_disable: function () {
				this._domEvents.clear();
				this.stop();
			},
			
			start: function () {
				if (this._enabled)
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
					this.element().parentNode.removeChild(this.element());
					this.destroy();
				}
			},
			
			actionable_element: function () {
				return this._host.state()._cloned_element || this.element();
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
				var underneath = Dom.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
				if (underneath)
					EventsSupp.dispatchElementEvent(underneath, "drag-" + label, data);
			},
			
			__triggerDomMove: function () {
				var data = this.__eventData();
				var underneath = Dom.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
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
	    "browser:Dom"
	], function (State, MouseCoords, ElementMod, MouseEvents, Dom, scoped) {
	return State.extend({scoped: scoped}, {
		
		_white_list: ["Stopping"],
		_persistents: ["initial_element_coords", "cloned_element", "cloned_modifier", "placeholder_cloned_element"],
	
		_start: function () {
			var opts = this.parent().options();
			this._page_coords = MouseCoords.coords;
			if (opts.clone_element) {
				var offset = Dom.elementOffset(this.element());
				var dimensions = Dom.elementDimensions(this.element());
				this._initial_element_coords = {
					x: offset.left,
					y: offset.top
				};
				var zindex = this.element().style.zIndex;
				var width = dimensions.width;
				var height = dimensions.height;
				if (opts.drag_original_element) {
					this._placeholder_cloned_element = this.element().cloneNode(true);
					this.element().replaceWith(this._placeholder_cloned_element);
					this._cloned_element = this._placeholder_cloned_element;
				} else {
					this._cloned_element = this.element().cloneNode(true);
				}
				this._cloned_modifier = new ElementMod(this._cloned_element); 
				this._cloned_modifier.css("position", "absolute");
				this._cloned_modifier.css("width", width + "px");
				this._cloned_modifier.css("height", height + "px");
				this._cloned_modifier.css("zIndex", zindex + 1);
				this._cloned_modifier.css("left", this._initial_element_coords.x + "px");
				this._cloned_modifier.css("top", this._initial_element_coords.y + "px");
				document.body.appendChild(this._cloned_element);
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
			this.on(document.body, MouseEvents.moveEvent(), this.__dragging);
			if (opts.stop_event) {
				this.on(document.body, opts.stop_event, function () {
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
			if (this.options().classes && this.options().classes["move.actionable_modifier"])
				this.parent().actionable_modifier().csscls(this.options().classes["move.actionable_modifier"], true);
			if (this.options().classes && this.options().classes["move.modifier"])
				this.parent().modifier().csscls(this.options().classes["move.modifier"], true);
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
					if (this._placeholder_cloned_element)
						this._placeholder_cloned_element.replaceWith(this._cloned_element);
					this._cloned_element.parentNode.removeChild(this._cloned_element);
				}
				this.parent().modifier().revert();
				this.trigger("stop");
				inherited._end.call(this);
			}
		
		};
	});
});
Scoped.define("module:Interactions.Drop", [
        "module:Interactions.ElementInteraction",
	    "base:Objs",
	    "module:Elements.ElementModifier",
	    "module:Interactions.DropStates",
	    "browser:Dom"
	], [
	    "module:Interactions.DropStates.Disabled",
	    "module:Interactions.DropStates.Idle",
	    "module:Interactions.DropStates.Hover",
	    "module:Interactions.DropStates.InvalidHover",
	    "module:Interactions.DropStates.Dropping"
	], function (ElemInter, Objs, ElemMod, DropStates, Dom, scoped) {
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
				inherited.constructor.call(this, element, options, DropStates);
				this._host.initialize("Idle");
				this._modifier = new ElemMod(this.element());
				this.data = data;
			},
			
			destroy: function () {
				this._modifier.revert();
				this._modifier.destroy();
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
				var bb = Dom.elementBoundingBox(this.element());
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
				var drag_source = event.detail;
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
				if (this.options().classes && this.options().classes["hover.modifier"])
					this.parent().modifier().csscls(this.options().classes["hover.modifier"], true);
				this.on(this.element(), "drag-hover", function (event) {
					this._drag_source = event.detail;
					if (!this.parent()._is_hovering(this._drag_source))
						this.next("Idle");
				});
				this.on(this.element(), "drag-stop drag-leave", function (event) {
					this._drag_source = event.detail;
					this.next("Idle");
				});
				this.on(this.element(), "drag-drop", function (event) {
					this._drag_source = event.detail;
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
					this._drag_source = event.detail;
					if (!this.parent()._is_hovering(this._drag_source))
						this.next("Idle");
				});
				this.on(this.element(), "drag-drop drag-stop drag-leave", function (event) {
					this._drag_source = event.detail;
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
			this._drag_source.source.dropped(this.parent());
            this.trigger("dropped");
			this.next("Idle");
		}
	
	});
});	

Scoped.define("module:Interactions.Droplist", [
        "module:Interactions.ElementInteraction",
	    "base:Objs",
	    "module:Interactions.DroplistStates",
	    "browser:Dom"
	], [
	    "module:Interactions.DroplistStates.Disabled",
	    "module:Interactions.DroplistStates.Idle",
	    "module:Interactions.DroplistStates.Hover",
	    "module:Interactions.DroplistStates.Dropping"
	], function (ElemInter, Objs, DroplistStates, Dom, scoped) {
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
				this._floater = Dom.unbox(this._options.floater);
				this._floater.style.display = "none";
			},
			
			destroy: function () {
				this._host.destroy();
				inherited.destroy.call(this);
			},
			
			_enable: function () {
				this._host.state().next("Idle");
			},
			
			_disable: function () {
				this._host.state().next("Disabled");
			},
			
			__eventData: function () {
				return {
					index: Dom.elementIndex(this._floater),
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
			    this._floater.style.display = "none";
			    var coords = data.page_coords;
			    var child = Dom.childContainingElement(this.element(), data.underneath);
			    if (!child)
			        return;
			    if (child === this._floater) {
			        this._floater.style.display = "";
			        return;
			    }
			    var bb = Dom.elementBoundingBox(child);
			    bb = this._options.bounding_box.call(this._options.context, bb);
			    if (bb.top <= coords.y && coords.y <= bb.bottom)
			    	return;
		        this._floater.style.display = "";
		        if (coords.y < bb.top)
		        	Dom.elementInsertBefore(this._floater, child);
		        else
		        	Dom.elementInsertAfter(this._floater, child);
			},
			
			insertAt: function (element, index) {
				Dom.elementInsertAt(element, this.element(), index);
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
					this.next(this.parent()._floater.style.display == "none" ? "Idle" : "Dropping");
				});
			},
			
			_end: function () {
				this.trigger("unhover");
				this.parent()._floater.style.display = "none";
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
			this._drag_source.source.dropped(this.parent());
            this.trigger("dropped");
			this.next("Idle");
		}
	
	});
});

Scoped.define("module:Interactions.Infinitescroll", [
    "module:Interactions.Scroll",
    "base:Objs",
	"base:Async",
    "module:Interactions.InfinitescrollStates",
    "browser:Dom"
], [
    "module:Interactions.InfinitescrollStates.Idle",
    "module:Interactions.InfinitescrollStates.Scrolling",
    "module:Interactions.InfinitescrollStates.ScrollingTo"
], function (Scroll, Objs, Async, InfinitescrollStates, Dom, scoped) {
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
		    	inherited.constructor.call(this, element, options, data, InfinitescrollStates);
				this._can_append = !!options.append;
				this._can_prepend = !!options.prepend;
				this._extending = false;
				if (options.prepend && this.options().whitespace) {
					this.__top_white_space = this._whitespaceCreate();
					Dom.elementPrependChild(this.itemsElement(), this.__top_white_space);
				}
				if (this.options().whitespace_bottom) {
					this.__bottom_white_space = this._whitespaceCreate();
					this.itemsElement().appendChild(this.__bottom_white_space);
				}
				Async.eventually(function () {
                    this.reset(true);
				}, this);
		    },
		    
		    append: function (count) {
		    	var opts = this.options();
		    	if (this._can_append && !this._extending) {
		    		this._extending = true;
		    		var self = this;
		    		opts.append.call(opts.context, count || opts.append_count, function (added, done) {
		    			if (self.__bottom_white_space)
		    				self.itemsElement().appendChild(self.__bottom_white_space);
		    			self._extending = false;
		    			self._can_append = done;
		    			self.appended(added);
		    		});
		    	}
		    },
		    
		    appendNeeded: function () {
		    	var total_height = this.element().scrollHeight;
		    	var element_height = this.element().clientHeight;
		    	var hidden_height = total_height - (this.element().scrollTop + element_height) - this._whitespaceGetHeight(this.__bottom_white_space);
		    	return hidden_height < this.options().height_factor * element_height;
		    },
		    
		    prependNeeded: function () {
		    	if (!this.options().prepend)
		    		return false;
		    	var element_height = this.element().clientHeight;
		    	var hidden_height = this.element().scrollTop - this._whitespaceGetHeight(this.__top_white_space);
		    	return hidden_height < this.options().height_factor * element_height;
		    },
		    
		    prepend: function (count) {
		    	var opts = this.options();
		    	if (this._can_prepend) {
		    		this._extending = true;
		    		var self = this;
		    		opts.prepend.call(opts.context, count || opts.prepend_count, function (added, done) {
		    			if (self.__top_white_space)
		    				Dom.elementPrependChild(self.itemsElement(), self.__top_white_space);
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
		    	var first = this.itemsElement().children[1];
		    	var last = this.itemsElement().children[count];
		    	var h = Dom.elementOffset(last).top - Dom.elementOffset(first).top + Dom.elementDimensions(last).height;
		    	if (this.scrolling()) {
		    		this._whitespaceSetHeight(this.__top_white_space, this._whitespaceGetHeight(this.__top_white_space) - h);
		    	} else
		    		this.element().scrollTop = this.element().scrollTop - h;
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
		        this.element().scrollTop = this.element().scrollTop + this.options().whitespace - h;
		    },
		
		    reset: function (increment) {
		        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
		        if (this.options().prepend) {
			        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
			        this.element().scrollTop = this.options().whitespace + (increment ? this.element().scrollTop : 0);
		        }
		    }
		    		
		};
	});
});


Scoped.define("module:Interactions.InfinitescrollStates.Idle", ["module:Interactions.ScrollStates.Idle"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {});
});


Scoped.define("module:Interactions.InfinitescrollStates.Scrolling", ["module:Interactions.ScrollStates.Scrolling"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent().extendFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});


Scoped.define("module:Interactions.InfinitescrollStates.ScrollingTo", ["module:Interactions.ScrollStates.ScrollingTo"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent().extendFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});
Scoped.define("module:Interactions.ElementInteraction", [
	    "base:Class",
	    "base:Events.EventsMixin",
	    "module:Hardware.MouseCoords",
	    "base:Async",
	    "base:States.Host",
	    "base:Ids",
	    "base:Objs",
	    "base:Classes.ClassRegistry",
	    "browser:Dom",
	    "browser:Events"
	], function (Class, EventsMixin, MouseCoords, Async, StateHost, Ids, Objs, ClassRegistry, Dom, DomEvents, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {

			constructor: function (element, options, stateNS) {
				inherited.constructor.call(this);
				this._domEvents = new DomEvents();
				MouseCoords.require();
				this._element = Dom.unbox(element);
				this._enabled = false;
				this._options = options || {};
				if ("enabled" in this._options) {
					var enabled = this._options.enabled;
					delete this._options.enabled;
					if (enabled) 
						Async.eventually(this.enable, this);
				}
				this._host = new StateHost({
					stateRegistry: stateNS ? new ClassRegistry(stateNS) : null
				});
				this._host.parent = this;
			},
			
			__on: function (element, event, callback, context) {
				this._domEvents.on(Dom.unbox(element), event, callback, context || this);
			},
			
			destroy: function () {
				this._domEvents.destroy();
				this.disable();
				this._host.destroy();
				MouseCoords.unrequire();
				inherited.destroy.call(this);
			},
			
			enable: function () {
				if (this._enabled || this.destroyed())
					return;
				this._enabled = true;
				this._enable();
			},
			
			disable: function () {
				if (!this._enabled)
					return;
				this._enabled = false;
				this._disable();
			},
			
			element: function () {
				return this._element;
			},
			
			options: function () {
				return this._options;
			},
			
			_enable: function () {},
			
			_disable: function () {}
		
		};

	}], {
			
		multiple: function (elements, options, callback, context) {
			for (var i = 0; i < elements.length; ++i) {
				var obj = new this(elements[i], options);
				if (callback)
					callback.call(context || obj, obj);
			}
		}
		
	});
});



Scoped.define("module:Interactions.State", [
    "base:States.State",
    "browser:Events",
    "browser:Dom",
    "base:Ids",
    "base:Objs"
], function (State, DomEvents, Dom, Ids, Objs, scoped) {
 	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function () {
				inherited.constructor.apply(this, arguments);
				this._domEvents = this.auto_destroy(new DomEvents());
			},
			
			parent: function () {
				return this.host.parent;
			},
			
			element: function () {
				return this.parent().element();
			},
			
			options: function () {
				return this.parent().options();
			},
			
			on: function (element, event, callback, context) {
				this._domEvents.on(Dom.unbox(element), event, function () {
					if (!this.destroyed())
						callback.apply(context || this, arguments);
				}, this);
			},
			
			_end: function () {
				this._domEvents.clear();
			}
			
		};
 	});
});


Scoped.define("module:Interactions.Loopscroll", [
    "module:Interactions.Scroll",
    "module:Interactions.LoopscrollStates",
    "browser:Dom"
], [
	"module:Interactions.LoopscrollStates.Idle",
	"module:Interactions.LoopscrollStates.Scrolling",
	"module:Interactions.LoopscrollStates.ScrollingTo"
], function (Scroll, LoopscrollStates, Dom, scoped) {
	return Scroll.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (element, options, data) {
		    	inherited.constructor.call(this, element, options, data, LoopscrollStates);
				this.__top_white_space = this._whitespaceCreate();
				Dom.elementPrependChild(this.itemsElement(), this.__top_white_space);
				this.__bottom_white_space = this._whitespaceCreate();
				this.itemsElement().appendChild(this.__bottom_white_space);
		        this.reset(true);
		    },
		
		    _rotateFix: function () {
		    	var itemsElementChildren = this.itemsElement().children;
		    	var top_ws_height = this._whitespaceGetHeight(this.__top_white_space);
		    	var bottom_ws_height = this._whitespaceGetHeight(this.__bottom_white_space);
		    	var full_height = this.element().scrollHeight;
		    	var visible_height = this.element().clientHeight;
		    	var elements_height = full_height - top_ws_height - bottom_ws_height;
		    	var scroll_top = this.element().scrollTop;
		    	var count = itemsElementChildren.length - 2;
		    	var top_elements = (scroll_top - top_ws_height) / elements_height * count; 
		    	var bottom_elements = (elements_height - (scroll_top - top_ws_height) - visible_height) / elements_height * count;
		    	if (top_elements < bottom_elements - 1) {
			    	while (top_elements < bottom_elements - 1) {
						var item = itemsElementChildren[itemsElementChildren.length - 2];
						Dom.elementInsertAfter(item, this.__top_white_space);
						top_ws_height -= Dom.elementDimensions(item).height;
		                this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
						bottom_elements--;
						top_elements++;
			    	}
				} else if (bottom_elements < top_elements - 1) {
			    	while (bottom_elements < top_elements - 1) {
						var item2 = itemsElementChildren[1];
						Dom.elementInsertBefore(item2, this.__bottom_white_space);
						top_ws_height += Dom.elementDimensions(item2).height;
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
		        this.element().scrollTop = this.element().scrollTop + this.options().whitespace - h;
		    },

			scrollToElement: function (element, options) {
				inherited.scrollToElement.call(this, element, options);
			},
		
		    reset: function (increment) {
		        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
		        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
		        this.element().scrollTop = this.options().whitespace + (increment ? this.element().scrollTop : 0);
		    }
		
		};
	});
});


Scoped.define("module:Interactions.LoopscrollStates.Idle", ["module:Interactions.ScrollStates.Idle"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {});
});


Scoped.define("module:Interactions.LoopscrollStates.Scrolling", ["module:Interactions.ScrollStates.Scrolling"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent()._rotateFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});


Scoped.define("module:Interactions.LoopscrollStates.ScrollingTo", ["module:Interactions.ScrollStates.ScrollingTo"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent()._rotateFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});

Scoped.define("module:Interactions.Pinch", [
    "module:Interactions.ElementInteraction",
    "module:Interactions.PinchStates"
], [
	"module:Interactions.PinchStates.Idle",
	"module:Interactions.PinchStates.Pinching"
], function (ElemInter, PinchStates, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data) {
		    	inherited.constructor.call(this, element, options, PinchStates);
				this._host.initialize("Idle");
				this.data = data;
			},
			
			_disable: function () {
				this.stop();
			},
			
			start: function () {
				if (this._enabled)
					this._host.state().next("Pinching");
			},
			
			stop: function () {
				if (this._enabled)
					this._host.state().next("Idle");
			},
			
			__eventData: function () {
				var state = this._host.state();
				return {
					element: this.element(),
					source: this,
					data: this.data,
					initial: state._initial_coords,
					delta_last: state._delta_last
				};
			},
			
			__triggerEvent: function (label) {
				this.trigger(label, this.__eventData());
			}
			
		};
	});
});


Scoped.define("module:Interactions.PinchStates.Idle", ["module:Interactions.State", "module:Events.Mouse"], function (State, MouseEvents, scoped) {
   	return State.extend({scoped: scoped}, {
		
		_white_list: ["Pinching"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		},
		
		_start: function () {
			this.on(this.element(), "touchstart", function (event) {
				if (!this.parent()._enabled)
					return;
				if (!event.touches || event.touches.length != 2)
					return;
				this.next("Pinching", {
					initial_coords: MouseEvents.clientCoords(event, true)
				});
			});
		}
	
	});
});


Scoped.define("module:Interactions.PinchStates.Pinching", ["module:Interactions.PinchStates.Idle", "module:Events.Mouse"], function (State, MouseEvents, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle"],
			_persistents: ["initial_coords", "current_coords"],
			
			/* Linter */
			_initial_coords: null,
		
			_start: function () {
				this._last_coords = null;
				this._current_coords = this._initial_coords;
				this.trigger("pinchstart");
				this.on(this.element(), "touchmove", function (event) {
					if (!event.touches || event.touches.length != 2) {
						this.next("Idle");
						return;
					}
					this.__pinching(event);
				});
				this.on(this.element(), "touchend", function () {
					this.next("Idle");
				});
			},
			
			_end: function () {
				this.trigger("pinchstop");
				inherited._end.call(this);
			},
			
			__pinching: function (event) {
				event.preventDefault();
				this._last_coords = this._current_coords;
				this._current_coords = MouseEvents.clientCoords(event, true);
				this.__compute_values();
				this.trigger("pinch");
			},
			
			__compute_values: function () {
				var min = function (obj, coord) {
					return obj[0][coord] <= obj[1][coord] ? obj[0][coord] : obj[1][coord];
				};
				var max = function (obj, coord) {
					return obj[0][coord] >= obj[1][coord] ? obj[0][coord] : obj[1][coord];
				};
				this._delta_last = {
					x: min(this._last_coords, "x") - min(this._current_coords, "x") + max(this._current_coords, "x") - max(this._last_coords, "x"),
					y: min(this._last_coords, "y") - min(this._current_coords, "y") + max(this._current_coords, "y") - max(this._last_coords, "y")
				};
			}
			
		};
	});
});

Scoped.define("module:Interactions.Scroll", [
    "module:Interactions.ElementInteraction",
    "base:Objs",
    "browser:Dom",
    "module:Interactions.ScrollStates"
], function (ElemInter, Objs, Dom, ScrollStates, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data, stateNS) {
		    	stateNS = stateNS || ScrollStates;
		    	options = Objs.extend({
		    		discrete: false,
		    		currentCenter: false,
		    		currentTop: true,
		    		scrollEndTimeout: 50,
		    		whitespace: 10000,
		    		display_type: "",
					elementMargin: 20,
					enable_scroll_modifier: "scroll"
				}, options);
				inherited.constructor.call(this, element, options, stateNS);
				this._itemsElement = Dom.unbox(options.itemsElement || element);
				this._disableScrollCounter = 0;
				this._host.initialize("Idle");
				this._scrollingDirection = true;
				this._lastScrollTop = null;
				this.__on(this.element(), "scroll", function () {
					var scrollTop = this.element().scrollTop;
					if (this._lastScrollTop !== null)
						this._scrollingDirection = scrollTop >= this._lastScrollTop;
					this._lastScrollTop = scrollTop;
				});
		    },
		    
			_whitespaceType: function () {
		        if (this.options().display_type)
		            return this.options().display_type;
		        return (this.element().style.display || "").toLowerCase().indexOf('flex') >= 0 ? "flex" : "default";
		    },
		
		    _whitespaceCreate: function () {
		        var whitespace = document.createElement("whitespace");
		        var type = this._whitespaceType();
		
		        if (type == "flex") {
		            whitespace.style.display = "-ms-flexbox";
		            whitespace.style.display = "-webkit-flex";
		            whitespace.style.display = "flex";
		        } else
		            whitespace.style.display = "block";
		
		        return whitespace;
		    },
		
		    _whitespaceGetHeight: function (whitespace) {
		        return whitespace ? Dom.elementDimensions(whitespace).height : 0;
		    },
		
		    _whitespaceSetHeight: function (whitespace, height) {
		    	if (!whitespace)
		    		return;
		        var type = this._whitespaceType();
		
		        if (type == "flex") {
		            whitespace.style["-webkit-flex"] = "0 0 " + height + "px";
		            whitespace.style["-ms-flex"] = "0 0 " + height + "px";
		            whitespace.style.flex = "0 0 " + height + "px";
		        } else
		            whitespace.style.height = height + "px";
		    },
		
		    itemsElement: function () {
		    	return this._itemsElement;
		    },
		    
		    scrollingDirection: function () {
		    	return this._scrollingDirection;
		    },
		    
		    currentElement: function () {
		    	var offset = Dom.elementOffset(this.element());
		    	var h = this._options.currentTop ? this._options.elementMargin : (this.element().clientHeight - 1 - this._options.elementMargin);
		    	var w = this.element().clientWidth / 2;
		    	var current = Dom.elementFromPoint(offset.left + w, offset.top + h);
		    	while (current && current.parentNode != this.itemsElement())
		    		current = current.parentNode;
		    	if (!current)
		    		return null;
		    	if (!this._options.currentCenter)
		    		return current;    	
		    	if (this._options.currentTop) {
		    		var delta_top = offset.top - Dom.elementOffset(current).top;
		    		if (delta_top > Dom.elementDimensions(current).height / 2)
		    			current = current.nextElementSibling;
		    	} else {
		    		var delta_bottom = offset.top + h - Dom.elementOffset(current).top;
		    		if (delta_bottom < Dom.elementDimensions(current).height / 2)
		    			current = current.previousElementSibling;
		    	}
		    	return current;
		    },
		    
		    scrollTo: function (position, options) {
		    	var scroll_top = position - (this._options.currentTop ? 0 : (this.element().clientHeight - 1));
		    	options = options || {};
		    	options.scroll_top = scroll_top;
		    	this._host.state().next("ScrollingTo", options);
		    },
		    
		    scrollToElement: function (element, options) {
		    	element = Dom.unbox(element);
		    	var top = Dom.elementOffset(element).top - Dom.elementOffset(this.element()).top + this.element().scrollTop;
				this.scrollTo(top + (this._options.currentTop ? 0 : (Dom.elementDimensions(element).height - 1)), options);
		    },
		    
		    disableScroll: function () {
		    	if (this._disableScrollCounter === 0)
		        	this.element().style.overflow = "hidden";
		    	this._disableScrollCounter++;
		    },
		    
		    enableScroll: function () {
		    	this._disableScrollCounter--;
		    	if (this._disableScrollCounter === 0)
		    		this.element().style.overflow = this._options.enable_scroll_modifier;
		    },
		    
		    scrolling: function () {
		    	return this._host.state().state_name() != "Idle";
		    }
		    
		};
	});
});


Scoped.define("module:Interactions.ScrollStates.Idle", ["module:Interactions.State"], function (State, scoped) {
	return State.extend({scoped: scoped}, {
		
		itemsElement: function () {
			return this.parent().itemsElement();
		},
		
		_start: function () {
			this.on(this.element(), "scroll", function () {
				this.next("Scrolling");
			});
		}
		
	});
});


Scoped.define("module:Interactions.ScrollStates.Scrolling", ["module:Interactions.ScrollStates.Idle"], function (State, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
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
						if (opts.discrete && current) {
							self.parent().scrollToElement(current, {
								animate: true,
								abortable: true
							});
						} else
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
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.ScrollStates.ScrollingTo", ["module:Interactions.ScrollStates.Idle", "module:Elements.DefaultAnimator"], function (State, Animator, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_locals: ["scroll_top", "animate", "abortable"],
			
			/* Linter */
			_scroll_top: null,
			_abortable: null,
			
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
					this._animation = new Animator(
						this.element(),
						{styles: {scrollTop: this._scroll_top}},
						this._finished,
						this);
					this._animation.start();
				} else {
					this.element().scrollTop = this._scroll_top;
					this._scroll();
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
				if (this.destroyed())
					return;
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
		    	if (this._animation)
		    		this._animation.weakDestroy();
				inherited._end.call(this);
			}
			
		};
	});
});
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
}).call(Scoped);