Scoped.define("module:Events.Support", [
    "base:Objs",
    "base:Types",
    "browser:Dom"
], function(Objs, Types, Dom) {
    return {

        dispatchElementEvent: function(element, label, data, options) {
            Dom.triggerDomEvent(element, label, {}, Objs.extend({
                bubbles: true,
                cancelable: true,
                detail: data
            }, options));
        },

        dispatchElementsEvent: function(elements, label, data, options) {
            for (var i = 0; i < elements.length; ++i) {
                Dom.triggerDomEvent(elements[i], label, {}, Objs.extend({
                    bubbles: false,
                    cancelable: true,
                    detail: data
                }, options));
            }
        },

        dispatchManualBubbleEvent: function(element, label, predicate, data, options) {
            var elements = [];
            var current = Dom.unbox(element);
            while (current) {
                if (predicate(current))
                    elements.push(current);
                current = current.parentNode;
            }
            this.dispatchElementsEvent(elements, label, data, options);
        },

        dispatchPointsSeparatorEvent: function(element, label, included, excluded, data, options) {
            included = included ? (Types.is_array(included) ? included : [included]) : [];
            excluded = excluded ? (Types.is_array(excluded) ? excluded : [excluded]) : [];
            this.dispatchManualBubbleEvent(element, label, function(element) {
                for (var i = 0; i < included.length; ++i) {
                    if (!Dom.pointWithinElement(included[i].x, included[i].y, element))
                        return false;
                }
                for (i = 0; i < excluded.length; ++i) {
                    if (Dom.pointWithinElement(excluded[i].x, excluded[i].y, element))
                        return false;
                }
                return true;
            }, data, options);
        }

    };
});