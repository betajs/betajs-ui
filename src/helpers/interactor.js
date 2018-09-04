Scoped.define("module:Helpers.Interactor", [
    "base:Class",
    "base:Objs",
    "base:Types",
    "base:Promise",
    "base:Async",
    "browser:Info",
    "browser:Dom",
    "module:Events.Mouse"
], function(Class, Objs, Types, Promise, Async, Info, Dom, Mouse, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                inherited.constructor.apply(this);
                this._options = Objs.extend({
                    delay: 1
                }, options);
            },

            _element: function(element) {
                return element ? (Types.is_string(element) ? document.querySelector(element) : element) : document.body;
            },

            elementPositionEvent: function(element, eventType, positionElement) {
                if (!positionElement)
                    return this._event(element, eventType);
                positionElement = this._element(positionElement);
                var offset = Dom.elementOffset(positionElement);
                var dims = Dom.elementDimensions(positionElement);
                return this._event(element, eventType, {
                    pageX: offset.left + dims.width / 2,
                    pageY: offset.top + dims.height / 2
                });
            },

            mousedown: function(element, positionElement) {
                return this.elementPositionEvent(element, Mouse.downEvent(), positionElement);
            },

            mouseup: function(element, positionElement) {
                return this.elementPositionEvent(element, Mouse.upEvent(), positionElement);
            },

            mousemoveToElement: function(targetElement, element) {
                return this.elementPositionEvent(element, Mouse.moveEvent(), targetElement);
            },

            _event: function(element, event, params) {
                var promise = Promise.create();
                element = this._element(element);
                Async.eventually(function() {
                    Dom.triggerDomEvent(element, event, params, {
                        bubbles: true,
                        propagates: true
                    });
                    promise.asyncSuccess(element);
                }, this._options.delay);
                return promise;
            }

        };
    });
});