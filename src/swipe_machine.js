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