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