Scoped.define("module:Helpers.Interactor", [
    "base:Class",
    "base:Objs",
    "base:Types",
    "base:Promise",
    "base:Async",
    "browser:Dom"
], function (Class, Objs, Types, Promise, Async, Dom, scoped) {
    return Class.extend({scoped: scoped}, function (inherited) {
        return {

            constructor: function (options) {
                inherited.constructor.apply(this);
                this._options = Objs.extend({
                    delay: 1
                }, options);
            },

            _element: function (element) {
                return element ? (Types.is_string(element) ? document.querySelector(element) : element) : document.body;
            },

            mousedown: function (element) {
                return this._event(element, "mousedown");
            },

            mouseup: function (element) {
                return this._event(element, "mouseup");
            },

            mousemoveToElement: function (targetElement, element) {
                targetElement = this._element(targetElement);
                var offset = Dom.elementOffset(targetElement);
                var dims = Dom.elementDimensions(targetElement);
                return this._event(element, "mousemove", {
                    pageX: offset.left + dims.width/2,
                    pageY: offset.top + dims.height/2
                });
            },

            _event: function (element, event, params) {
                var promise = Promise.create();
                element = this._element(element ? (Types.is_string(element) ? document.querySelector(element) : element) : document.body);
                Async.eventually(function () {
                    Dom.triggerDomEvent(element, event, params);
                    promise.asyncSuccess(element);
                }, this._options.delay);
                return promise;
            }

        };
    });
});