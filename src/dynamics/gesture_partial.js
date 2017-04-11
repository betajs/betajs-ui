Scoped.define("module:Dynamics.GesturePartial", [
    "dynamics:Handlers.Partial",
    "module:Gestures.Gesture",
    "module:Gestures",
    "base:Objs"
], [
    "module:Gestures.defaultGesture"
], function(Partial, Gesture, Gestures, Objs, scoped) {
    var Cls = Partial.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            _apply: function(value) {
                var node = this._node;
                var handler = node._handler;
                node.gestures = node.gestures || {};
                if (this._postfix in node.gestures && !node.gestures[this._postfix].destroyed())
                    return;
                value = Objs.extend(value, value.options);
                var element = this._node.element();
                var gesture = new Gesture(element, Gestures.defaultGesture(value));
                node.gestures[this._postfix] = gesture;
                gesture.on("activate", function() {
                    if (value.activate_event)
                        handler.call(value.activate_event, value.data, this._node, gesture);
                    if (value.interaction && node.interactions && node.interactions[value.interaction] && node.interactions[value.interaction].start)
                        node.interactions[value.interaction].start();
                }, this);
                gesture.on("deactivate", function() {
                    if (value.deactivate_event)
                        handler.call(value.deactivate_event, value.data, this._node, gesture);
                    if (value.interaction && node.interactions && node.interactions[value.interaction] && node.interactions[value.interaction].stop)
                        node.interactions[value.interaction].stop();
                }, this);
                if (value.transition_event) {
                    gesture.on("start", function() {
                        handler.call(value.transition_event, element, gesture);
                    }, this);
                }
            },

            _deactivate: function() {
                this.__release();
            },

            __release: function() {
                var node = this._node;
                node.gestures = node.gestures || {};
                if (this._postfix in node.gestures)
                    node.gestures[this._postfix].weakDestroy();
                delete node.gestures[this._postfix];
            },

            destroy: function() {
                this.__release();
                inherited.destroy.call(this);
            }

        };
    });
    Cls.register("ba-gesture");
    return Cls;
});