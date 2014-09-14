BetaJS.UI.Events = {};

BetaJS.UI.Events.Support = {

	dispatchElementEvent: function (element, label, data, options) {
		element.dispatchEvent(new CustomEvent(label, BetaJS.Objs.extend({
			bubbles: true,
			cancelable: true,
			detail: data
		}, options)));
	},
	
	dispatchElementsEvent: function (elements, label, data, options) {
		for (var i = 0; i < elements.length; ++i) {
			elements[i].dispatchEvent(new CustomEvent(label, BetaJS.Objs.extend({
				bubbles: false,
				cancelable: true,
				detail: data
			}, options)));
		}
	},
	
	dispatchManualBubbleEvent: function (element, label, predicate, data, options) {
		this.dispatchElementsEvent(BetaJS.$(element).parents().andSelf().filter(predicate), label, data, options); 
	},
	
	dispatchPointsSeparatorEvent: function (element, label, included, excluded, data, options) {
		included = included ? (BetaJS.Types.is_array(included) ? included : [included]) : [];
		excluded = excluded ? (BetaJS.Types.is_array(excluded) ? excluded : [excluded]) : [];
		this.dispatchManualBubbleEvent(element, label, function () {
			for (var i = 0; i < included.length; ++i) {
				if (!BetaJS.UI.Elements.Support.pointWithinElement(included[i].x, included[i].y, this))
					return false;
			}
			for (i = 0; i < excluded.length; ++i) {
				if (BetaJS.UI.Elements.Support.pointWithinElement(excluded[i].x, excluded[i].y, this))
					return false;
			}
			return true;
		}, data, options);
	}
	
};
