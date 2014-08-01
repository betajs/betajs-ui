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