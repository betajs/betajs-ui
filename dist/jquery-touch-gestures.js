/*!
  jquery-touch-gestures - v0.0.1 - 2014-08-01
  Copyright (c) Oliver Friedmann
  MIT Software License.
*/
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

BetaJS.UI.Gestures.clickMachine = function (options, events) {
    options = BetaJS.Objs.extend({
        disable_x: 10,
        disable_y: 10,
        wait_time: 250
    }, options);
    events = events || {};
    return {
        "Initial": {
            priority: 1,
            exclusive: false,
            retreat: "Initial",
            events: [{
                event: "ElementTriggerEvent",
                args: "mousedown touchstart",
                target: "DownState"
            }]
        },
        "DownState": {
            priority: 1,
            exclusive: false,
            retreat: "Initial",
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup touchend",
                target: "ActiveState"
            }, {
                event: "ElementTriggerEvent",
                args: "mouseup mouseleave touchend",
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {x: options.disable_x, y: options.disable_y},
                target: "Initial"
            }, {
                event: "ElementTimerEvent",
                args: options.wait_time,
                target: "Initial"
            }]
        },
        "ActiveState": {
            priority: 3,
            exclusive: true,
            retreat: "Initial",
            start: function () {
                var element = this.element();
                if (events.click)
                    events.click.call(events.context || element, element);
                this.nextDrivenState("Initial");
            }
        }
    };
};
BetaJS.UI.Gestures.draggableMachine = function (options, events) {
    options = BetaJS.Objs.extend({
        wait_time: 750,
        disable_x: 10,
        disable_y: 10,
        enable_x: 20
    }, options);
    events = events || {};
    return {
        "Initial": {
            priority: 1,
            exclusive: false,
            retreat: "Initial",
            start: function () {
                var element = this.element();
                if (events.semi_finish)
                    events.semi_finish.call(events.context || element, element);
            },
            events: [{
                event: "ElementTriggerEvent",
                args: "mousedown touchstart",
                target: "DownState"
            }]
        },
        "DownState": {
            priority: 2,
            exclusive: false,
            retreat: "Initial",
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup mouseleave touchend",
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {x: options.disable_x, y: options.disable_y},
                target: "Initial"
            }, {
                event: "ElementTimerEvent",
                args: options.wait_time,
                target: "SemiActiveState"
            }]
        },
        "SemiActiveState": {
            priority: 3,
            exclusive: false,
            retreat: "Initial",
            start: function () {
                this.on("touchmove", function (event) {
                    event.preventDefault();
                });
                var element = this.element();
                if (events.semi_start)
                    events.semi_start.call(events.context || element, element);
            },
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup mouseleave touchend",
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {x: options.enable_x},
                target: "ActiveState"
            }]
        },
        "ActiveState": {
            priority: 4,
            exclusive: true,
            retreat: "Initial",
            start: function () {
                var element = this.element();
                var self = this;
                element.draggable({
                    helper: "clone",
                    stop: function () {
                        if (events.finish)
                            events.finish.call(events.context || element, element);
                        element.draggable("destroy");
                        self.nextDrivenState("Initial");
                    }
                });
                this.simulateMouseEvent("mousedown");
                this._client_pos.x = this._client_pos.x + 1;
                this.simulateMouseEvent("mousemove");
                this._client_pos.x = this._client_pos.x - 1;
                this.simulateMouseEvent("mousemove");
                this.on("touchmove", function (event) {
                    this.simulateMouseEvent("mousemove");
                    event.preventDefault();
                });
                this.on("touchend", function (event) {
                    this.simulateMouseEvent("mouseup");
                });
                var clone = $(".ui-draggable-dragging");
                clone.css("width", element.css("width"));
                if (events.start)
                    events.start.call(events.context || element, element);
            },
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup touchend",
                target: "Initial"
            }]                  
        }
    };
};
BetaJS.UI.Gestures.sortableMachine = function (options, events) {
    options = BetaJS.Objs.extend({
        wait_time: 750,
        disable_x: 10,
        disable_y: 10,
        enable_y: 20,
        parent_level: 2
    }, options);
    events = events || {};
    return {
        "Initial": {
            priority: 1,
            exclusive: false,
            retreat: "Initial",
            start: function () {
                var element = this.element();
                if (events.semi_finish)
                    events.semi_finish.call(events.context || element, element);
            },
            events: [{
                event: "ElementTriggerEvent",
                args: "mousedown touchstart",
                target: "DownState"
            }]
        },
        "DownState": {
            priority: 2,
            exclusive: false,
            retreat: "Initial",
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup mouseleave touchend",
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {x: options.disable_x, y: options.disable_y},
                target: "Initial"
            }, {
                event: "ElementTimerEvent",
                args: options.wait_time,
                target: "SemiActiveState"
            }]
        },
        "SemiActiveState": {
            priority: 3,
            exclusive: false,
            retreat: "Initial",
            start: function () {
                this.on("touchmove", function (event) {
                    event.preventDefault();
                });
                var element = this.element();
                if (events.semi_start)
                    events.semi_start.call(events.context || element, element);
            },
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup mouseleave touchend",
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {y: options.enable_y},
                target: "ActiveState"
            }]
        },
        "ActiveState": {
            priority: 4,
            exclusive: true,
            retreat: "Initial",
            start: function () {
                var count = options.parent_level;
                var element = this.element();
                var parent = element;
                while (count > 0) {
                    parent = parent.parent();
                    count--;
                }
                parent.sortable({
                    axis: "y",
                    revert: true,
                    stop: function () {
                        if (events.finish)
                            events.finish.call(events.context || element, element);
                        parent.sortable("destroy");
                    }
                });
                this.on("touchmove", function (event) {
                    this.simulateMouseEvent("mousemove");
                    event.preventDefault();
                });
                this.on("touchend", function (event) {
                    this.simulateMouseEvent("mouseup");
                });
                this.simulateMouseEvent("mousedown");
                if (events.start)
                    events.start.call(events.context || element, element);
            },
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup touchend",
                target: "Initial"
            }]                  
        }
    };
};
BetaJS.UI.Gestures.swipeMachine = function (options, events) {
    options = BetaJS.Objs.extend({
        disable_y: 20,
        enable_x: 20
    }, options);
    events = events || {};
    return {
        "Initial": {
            priority: 1,
            exclusive: false,
            retreat: "Initial",
            events: [{
                event: "ElementTriggerEvent",
                args: "mousedown touchstart",
                target: "DownState"
            }]
        },
        "DownState": {
            priority: 2,
            exclusive: false,
            retreat: "Initial",
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup mouseleave touchend",
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {y: options.disable_y},
                target: "Initial"
            }, {
                event: "ElementMouseMoveOutEvent",
                args: {x: options.enable_x},
                target: "ActiveState"
            }]
        },
        "ActiveState": {
            priority: 3,
            exclusive: true,
            retreat: "Initial",
            start: function () {
                var element = this.element();
                this.element().draggable({
                    axis: "x",
                    revert: true,
                    stop: function () {
                        element.draggable("destroy");
                    },
                    drag: function () {
                        if (events.drag)
                            events.drag.call(events.context || element, element);
                    }
                });
                this.simulateMouseEvent("mousedown");
                this.on("touchmove", function (event) {
                    this.simulateMouseEvent("mousemove");
                });
                this.on("mouseleave touchend", function (event) {
                    this.simulateMouseEvent("mouseup");
                });
                this.on("mouseup", function (event) {
                    if (events.finish)
                        events.finish.call(events.context || element, element);
                });
            },
            events: [{
                event: "ElementTriggerEvent",
                args: "mouseup mouseleave touchend",
                target: "Initial"
            }]                  
        }
    };
};