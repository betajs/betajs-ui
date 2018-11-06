Scoped.define("module:Interactions.ElementInteraction", [
    "base:Class",
    "base:Events.EventsMixin",
    "module:Hardware.MouseCoords",
    "base:Async",
    "base:States.Host",
    "base:Ids",
    "base:Objs",
    "base:Classes.ClassRegistry",
    "browser:Dom",
    "browser:Events"
], function(Class, EventsMixin, MouseCoords, Async, StateHost, Ids, Objs, ClassRegistry, Dom, DomEvents, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            constructor: function(element, options, stateNS) {
                inherited.constructor.call(this);
                this._domEvents = new DomEvents();
                MouseCoords.require();
                this._element = Dom.unbox(element);
                this._enabled = false;
                this._options = options || {};
                if ("enabled" in this._options) {
                    var enabled = this._options.enabled;
                    delete this._options.enabled;
                    if (enabled)
                        Async.eventually(this.enable, this);
                }
                this._host = new StateHost({
                    stateRegistry: stateNS ? new ClassRegistry(stateNS) : null
                });
                this._host.parent = this;
            },

            __on: function(element, event, callback, context, options) {
                this._domEvents.on(Dom.unbox(element), event, callback, context || this, options);
            },

            destroy: function() {
                this._domEvents.destroy();
                this.disable();
                this._host.destroy();
                MouseCoords.unrequire();
                inherited.destroy.call(this);
            },

            enable: function() {
                if (this._enabled || this.destroyed())
                    return;
                this._enabled = true;
                this._enable();
            },

            disable: function() {
                if (!this._enabled)
                    return;
                this._enabled = false;
                this._disable();
            },

            element: function() {
                return this._element;
            },

            options: function() {
                return this._options;
            },

            _enable: function() {},

            _disable: function() {}

        };

    }], {

        multiple: function(elements, options, callback, context) {
            for (var i = 0; i < elements.length; ++i) {
                var obj = new this(elements[i], options);
                if (callback)
                    callback.call(context || obj, obj);
            }
        }

    });
});



Scoped.define("module:Interactions.State", [
    "base:States.State",
    "browser:Events",
    "browser:Dom",
    "base:Ids",
    "base:Objs"
], function(State, DomEvents, Dom, Ids, Objs, scoped) {
    return State.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function() {
                inherited.constructor.apply(this, arguments);
                this._domEvents = this.auto_destroy(new DomEvents());
            },

            parent: function() {
                return this.host.parent;
            },

            element: function() {
                return this.parent().element();
            },

            options: function() {
                return this.parent().options();
            },

            on: function(element, event, callback, context, options) {
                this._domEvents.on(Dom.unbox(element), event, function(ev) {
                    if (!this.destroyed()) {
                        callback.apply(context || this, arguments);
                        ev.preventDefault();
                    }
                }, this, options);
            },

            _end: function() {
                this._domEvents.clear();
            }

        };
    });
});