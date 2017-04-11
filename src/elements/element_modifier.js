Scoped.define("module:Elements.ElementModifier", [
    "base:Class",
    "browser:Dom"
], function(Class, Dom, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(element) {
                inherited.constructor.call(this);
                this._element = Dom.unbox(element);
                this._css = {};
                this._cls = {};
            },

            css: function(key, value) {
                if (arguments.length < 2)
                    return this._element.style[key];
                if (this._element.style[key] === value)
                    return value;
                if (!(key in this._css))
                    this._css[key] = this._element.style[key];
                this._element.style[key] = value;
                return value;
            },

            csscls: function(key, value) {
                var has = Dom.elementHasClass(this._element, key);
                if (arguments.length < 2)
                    return key;
                if (has === value)
                    return value;
                if (!(key in this._cls))
                    this._cls[key] = has;
                if (value)
                    Dom.elementAddClass(this._element, key);
                else
                    Dom.elementRemoveClass(this._element, key);
                return value;
            },

            removeClass: function(cls) {
                if (!Dom.elementHasClass(this._element, cls))
                    return;
                if (!(cls in this._cls))
                    this._cls[cls] = true;
                Dom.elementAddClass(this._element, cls);
            },

            revert: function() {
                for (var key in this._css)
                    this._element.style[key] = this._css[key];
                for (key in this._cls) {
                    if (this._cls[key])
                        Dom.elementAddClass(this._element, key);
                    else
                        Dom.elementRemoveClass(this._element, key);
                }
            }

        };
    });
});