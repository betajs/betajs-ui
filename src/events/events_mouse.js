Scoped.define("module:Events.Mouse", ["browser:Info"], function(Info) {
    return {

        downEvent: function() {
            return Info.isMobile() ? "touchstart" : "mousedown";
        },

        moveEvent: function() {
            return Info.isMobile() ? "touchmove" : "mousemove";
        },

        upEvent: function() {
            return Info.isMobile() ? "touchend" : "mouseup";
        },

        clickEvent: function() {
            return Info.isMobile() ? "touchstart" : "click";
        },

        customCoords: function(event, type, multi) {
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

        pageCoords: function(event, multi) {
            return this.customCoords(event, "page", multi);
        },

        clientCoords: function(event, multi) {
            return this.customCoords(event, "client", multi);
        },

        screenCoords: function(event, multi) {
            return this.customCoords(event, "screen", multi);
        }

    };
});