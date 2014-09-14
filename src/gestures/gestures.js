BetaJS.States.CompetingHost.extend("BetaJS.UI.Gestures.ElementStateHost", {
    
    constructor: function (element, composite) {
        this._inherited(BetaJS.UI.Gestures.ElementStateHost, "constructor", composite);
        this._element = element;
    },
    
    element: function () {
        return this._element;
    }
    
});

BetaJS.UI.Gestures.ElementStateHost.extend("BetaJS.UI.Gestures.Gesture", {
	
	constructor: function (element, machine) {
        var composite = element.data("gestures");
        if (!composite) {
            composite = new BetaJS.States.CompetingComposite();
            element.data("gestures", composite);
        }
        this._inherited(BetaJS.UI.Gestures.Gesture, "constructor", element, composite);
        for (var key in machine) {
        	machine[key] = BetaJS.Objs.extend({
        		priority: 1,
        		exclusive: false,
        		retreat: "Retreat"
        	}, machine[key]);
        }
        this.initialize("BetaJS.UI.Gestures.EventDrivenState", {
            state_descriptor: machine,
            current_state: "Initial"
        });
	}
	
});


BetaJS.States.CompetingState.extend("BetaJS.UI.Gestures.ElementState", {

    _persistents: ["client_pos", "screen_pos"],

    _start: function () {
        this._inherited(BetaJS.UI.Gestures.ElementState, "_start");
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
        for (var i = 0; i < events.length; ++i) {
            this.element().on(events[i] + "." + BetaJS.Ids.objectId(this), function (event) {
                func.call(self, event);
            });
        }
    },
    
    _end: function () {
        this.element().off("." + BetaJS.Ids.objectId(this));
    },
    
    trigger: function () {
    	this.host.trigger.apply(this.host, arguments);
    }
        
});

BetaJS.Class.extend("BetaJS.UI.Gestures.ElementEvent", {
    
    constructor: function (element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementEvent, "constructor");
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
        for (var i = 0; i < events.length; ++i) {
            element.on(events[i] + "." + BetaJS.Ids.objectId(this), function (event) {
                func.call(context || self, event);
            });
        }
    },

    destroy: function () {
        this._element.off("." + BetaJS.Ids.objectId(this));
        BetaJS.$("body").off("." + BetaJS.Ids.objectId(this));
        this._inherited(BetaJS.UI.Gestures.ElementEvent, "destroy");
    }
    
}); 

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.ElementTriggerEvent", {

    constructor: function (ev, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementTriggerEvent, "constructor", element, callback, context);
        this.on(ev, function () {
            this.callback();
        });
    }

});

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.BodyTriggerEvent", {

    constructor: function (ev, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementTriggerEvent, "constructor", element, callback, context);
        this.on(ev, function () {
            this.callback();
        }, this, BetaJS.$("body"));
    }

});

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.ElementTimerEvent", {

    constructor: function (time, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementTimerEvent, "constructor", element, callback, context);
        var self = this;
        if (time <= 0)
        	return;
        this._timer = setTimeout(function () {
            self.callback();
        }, time);
    },
    
    destroy: function () {
        clearTimeout(this._timer);
        this._inherited(BetaJS.UI.Gestures.ElementTimerEvent, "destroy");
    }

});

BetaJS.UI.Gestures.ElementEvent.extend("BetaJS.UI.Gestures.ElementMouseMoveOutEvent", {

    constructor: function (box, element, callback, context) {
        this._inherited(BetaJS.UI.Gestures.ElementMouseMoveOutEvent, "constructor", element, callback, context);
        var position = null;
        var delta = [0,0];
        this.on("mousemove touchmove", function (event) {
            var original = event.type == "mousemove" ? event.originalEvent : event.originalEvent.touches[0];
            var current = [original.clientX, original.clientY];
            if (!position)
                position = current;
            delta[0] = Math.max(delta[0], Math.abs(position[0] - current[0]));
            delta[1] = Math.max(delta[1], Math.abs(position[1] - current[1]));
            if (("x" in box && box.x >= 0 && delta[0] >= box.x) || ("y" in box && box.y >= 0 && delta[1] >= box.y)) {
                this.callback();
            }
        });
    }

});

BetaJS.UI.Gestures.ElementState.extend("BetaJS.UI.Gestures.EventDrivenState", {

    _persistents: ["client_pos", "screen_pos", "state_descriptor"],
    _locals: ["current_state"],
    
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
        this._inherited(BetaJS.UI.Gestures.EventDrivenState, "_start");
        var state = this.current_state();
        if (state.start)
            state.start.apply(this);
        state.events = state.events || [];
        for (var i = 0; i < state.events.length; ++i) {
            function helper(event) {
                this._auto_destroy(new BetaJS.UI.Gestures[event.event](event.args, this.element(), function () {
                    this.nextDrivenState(event.target);
                }, this));
            }
            helper.call(this, state.events[i]);
        }
    },
    
    _end: function () {
        var state = this.current_state();
        if (state.end)
            state.end.apply(this);
        this._inherited(BetaJS.UI.Gestures.EventDrivenState, "_end");
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
    
});


BetaJS.UI.Gestures.defaultGesture = function (options) {
    options = BetaJS.Objs.extend({
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
                args: BetaJS.UI.Events.Mouse.downEvent,
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
                args: BetaJS.UI.Events.Mouse.upEvent,
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