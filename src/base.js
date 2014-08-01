BetaJS.States.CompetingHost.extend("BetaJS.UI.ElementStateHost", {
    
    constructor: function (element, composite) {
        this._inherited(BetaJS.UI.ElementStateHost, "constructor", composite);
        this._element = element;
    },
    
    element: function () {
        return this._element;
    }
    
});

BetaJS.States.CompetingState.extend("BetaJS.UI.ElementState", {

    _persistents: ["client_pos", "screen_pos"],

    simulateMouseEvent: function (event_type) {
        var simulatedEvent = document.createEvent('MouseEvents');
        simulatedEvent.initMouseEvent(event_type, // type
            true, // bubbles
            true, // cancelable
            window, // view
            1, // detail
            this._screen_pos ? this._screen_pos.x : 0,
            this._screen_pos ? this._screen_pos.y : 0,
            this._client_pos ? this._client_pos.x : 0,
            this._client_pos ? this._client_pos.y : 0,
            false, // ctrlKey
            false, // altKey
            false, // shiftKey
            false, // metaKey
            0, // button
            null);
        this.element().get(0).dispatchEvent(simulatedEvent);
    },

    _start: function () {
        this._inherited(BetaJS.UI.ElementState, "_start");
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
    }
        
});

BetaJS.Class.extend("BetaJS.UI.ElementEvent", {
    
    constructor: function (element, callback, context) {
        this._inherited(BetaJS.UI.ElementEvent, "constructor");
        this._element = element;
        this._callback = callback;
        this._context = context;
    },
    
    callback: function () {
        if (this._callback)
            this._callback.apply(this._context, arguments);
    },
    
    on: function (event, func, context) {
        var self = this;
        var events = event.split(" ");
        for (var i = 0; i < events.length; ++i) {
            this._element.on(events[i] + "." + BetaJS.Ids.objectId(this), function (event) {
                func.call(context || self, event);
            });
        }
    },

    destroy: function () {
        this._element.off("." + BetaJS.Ids.objectId(this));
        this._inherited(BetaJS.UI.ElementEvent, "destroy");
    }
    
}); 

BetaJS.UI.ElementEvent.extend("BetaJS.UI.ElementTriggerEvent", {

    constructor: function (ev, element, callback, context) {
        this._inherited(BetaJS.UI.ElementTriggerEvent, "constructor", element, callback, context);
        this.on(ev, function () {
            this.callback();
        });
    }

});

BetaJS.UI.ElementEvent.extend("BetaJS.UI.ElementTimerEvent", {

    constructor: function (time, element, callback, context) {
        this._inherited(BetaJS.UI.ElementTimerEvent, "constructor", element, callback, context);
        var self = this;
        this._timer = setTimeout(function () {
            self.callback();
        }, time);
    },
    
    destroy: function () {
        clearTimeout(this._timer);
        this._inherited(BetaJS.UI.ElementTimerEvent, "destroy");
    }

});

BetaJS.UI.ElementEvent.extend("BetaJS.UI.ElementMouseMoveOutEvent", {

    constructor: function (box, element, callback, context) {
        this._inherited(BetaJS.UI.ElementMouseMoveOutEvent, "constructor", element, callback, context);
        var position = null;
        var delta = [0,0];
        this.on("mousemove touchmove", function (event) {
            var original = event.type == "mousemove" ? event.originalEvent : event.originalEvent.touches[0];
            var current = [original.clientX, original.clientY];
            if (!position)
                position = current;
            delta[0] = Math.max(delta[0], Math.abs(position[0] - current[0]));
            delta[1] = Math.max(delta[1], Math.abs(position[1] - current[1]));
            if (("x" in box && delta[0] >= box.x) || ("y" in box && delta[1] >= box.y)) {
                this.callback();
            }
        });
    }

});

BetaJS.UI.ElementState.extend("BetaJS.UI.EventDrivenState", {

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
        this._inherited(BetaJS.UI.EventDrivenState, "_start");
        var state = this.current_state();
        if (state.start)
            state.start.apply(this);
        state.events = state.events || [];
        for (var i = 0; i < state.events.length; ++i) {
            function helper(event) {
                this._auto_destroy(new BetaJS.UI[event.event](event.args, this.element(), function () {
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
        this._inherited(BetaJS.UI.EventDrivenState, "_end");
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

BetaJS.UI.Gestures = {
    register: function (element, machine) {
        BetaJS.$(element).each(function () {
            var element = BetaJS.$(this);
            var composite = element.data("betajs-competing-composite");
            if (!composite) {
                composite = new BetaJS.States.CompetingComposite();
                element.data("betajs-competing-composite", composite);
            }
            var host = new BetaJS.UI.ElementStateHost(element, composite);
            host.initialize("BetaJS.UI.EventDrivenState", {
                state_descriptor: machine,
                current_state: "Initial"
            });
        });
    }
};
