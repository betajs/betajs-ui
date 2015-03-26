Scoped.define("module:Gestures.ElementStateHost", ["base:States.CompetingHost"], function (CompetingHost, scoped) {
	return CompetingHost.extend({scoped: scoped}, function (inherited) {
		return {
		    
		    constructor: function (element, composite) {
		        inherited.constructor.call(this, composite);
		        this._element = element;
		    },
		    
		    element: function () {
		        return this._element;
		    }

		};
	});
});


Scoped.define("module:Gestures.Gesture", [
	    "module:Gestures.ElementStateHost",
	    "module:Hardware.MouseCoords",
	    "base:States.CompetingComposite",
	    "base:Objs"
	], function (ElementStateHost, MouseCoords, CompetingComposite, Objs, scoped) {
	return ElementStateHost.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element, machine) {
		        var composite = element.data("gestures");
		        if (!composite) {
		            composite = new CompetingComposite();
		            element.data("gestures", composite);
		        }
		        inherited.constructor.call(this, element, composite);
		        MouseCoords.require();
		        for (var key in machine) {
		        	machine[key] = Objs.extend({
		        		priority: 1,
		        		exclusive: false,
		        		retreat: "Retreat"
		        	}, machine[key]);
		        }
		        this.initialize(this.cls.classname + "States.EventDrivenState", {
		            state_descriptor: machine,
		            current_state: "Initial"
		        });
			},
			
			destroy: function () {
		        MouseCoords.unrequire();
		        inherited.destroy.call(this);
			}
	
		};
	});	
});


Scoped.define("module:Gestures.Gesture.ElementState", [
  	    "base:States.CompetingState",
  	    "base:Ids",
  	    "base:Objs"
  	], function (CompetingState, Ids, Objs, scoped) {
  	return CompetingState.extend({scoped: scoped}, function (inherited) {
  		return {

		    _persistents: ["client_pos", "screen_pos"],
		
		    _start: function () {
		    	inherited._start.call(this);
		        this.on("mousemove touchmove", function (event) {
		            var original = event.type == "mousemove" ? event.originalEvent : event.originalEvent.touches[0];
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
		        var self = this;
		        var events = event.split(" ");
		        Objs.iter(events, function (eventName) {
		            this.element().on(eventName + "." + Ids.objectId(this), function (event) {
		                func.call(self, event);
		            });
		        }, this);
		    },
		    
		    _end: function () {
		        this.element().off("." + Ids.objectId(this));
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
 	    "jquery:"
 	], function (Class, Ids, Objs, $, scoped) {
 	return Class.extend({scoped: scoped}, function (inherited) {
 		return {
		    
		    constructor: function (element, callback, context) {
		        inherited.constructor.call(this);
		        this._element = element;
		        this._callback = callback;
		        this._context = context;
		    },
		    
		    callback: function () {
		        if (this._callback)
		            this._callback.apply(this._context, arguments);
		    },
		    
		    on: function (event, func, context, element) {
		        var self = this;
		        var events = event.split(" ");
		        element = element || this._element;
		        Objs.iter(events, function (eventName) {
		            element.on(eventName + "." + Ids.objectId(this), function (event) {
		                func.call(context || self, event);
		            });
		        }, this);
		    },
		
		    destroy: function () {
		        this._element.off("." + Ids.objectId(this));
		        $("body").off("." + Ids.objectId(this));
		        inherited.destroy.call(this);
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


Scoped.define("module:Gestures.BodyTriggerEvent", ["module:Gestures.ElementEvent", "jquery:"], function (ElementEvent, $, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (ev, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        this.on(ev, function () {
		            this.callback();
		        }, this, $("body"));
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



Scoped.define("module:Gestures.ElementMouseMoveOutEvent", [
        "module:Gestures.ElementEvent",
        "module:Hardware.MouseCoords",
        "module:Events.Mouse"
    ], function (ElementEvent, MouseCoords, MouseEvents, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {
		
		    constructor: function (box, element, callback, context) {
		    	inherited.constructor.call(this, element, callback, context);
		        var position = MouseCoords.coords;
		        var delta = {x: 0, y: 0};
		        this.on(MouseEvents.moveEvent, function (event) {
		        	if (!position.x && !position.y)
		        		position = MouseEvents.pageCoords(event);
		            var current = MouseEvents.pageCoords(event);
		            delta.x = Math.max(delta.x, Math.abs(position.x - current.x));
		            delta.y = Math.max(delta.y, Math.abs(position.y - current.y));
		            if (("x" in box && box.x >= 0 && delta.x >= box.x) || ("y" in box && box.y >= 0 && delta.y >= box.y)) {
		                this.callback();
		            }
		        });
		    }

		};
	});
});


Scoped.define("module:Gestures.GestureStates.EventDrivenState", [
       "module:Gestures.Gesture.ElementState",
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
	        active_priority: 2
	    }, options);
	    return {
	        "Initial": {
	            events: [{
	                event: "ElementTriggerEvent",
	                args: MouseEvents.downEvent,
	                target: "DownState"
	            }]
	        },
	        "Retreat": {
	            start: function () {
	            	this.trigger("deactivate");
	            	this.nextDrivenState("Initial");
	            }
	        },
	        "DownState": {
	            events: [{
	                event: "BodyTriggerEvent",
	                args: MouseEvents.upEvent,
	                target: options.mouse_up_activate ? "ActiveState" : "Initial"
	            }, {
	                event: "ElementMouseMoveOutEvent",
	                args: {x: options.disable_x, y: options.disable_y},
	                target: "Initial"
	            }, {
	                event: "ElementMouseMoveOutEvent",
	                args: {x: options.enable_x, y: options.enable_y},
	                target: "ActiveState"
	            }, {
	                event: "ElementTimerEvent",
	                args: options.wait_time,
	                target: options.wait_activate ? "ActiveState" : "Initial"
	            }]
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