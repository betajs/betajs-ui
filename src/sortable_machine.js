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