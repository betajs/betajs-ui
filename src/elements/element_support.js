Scoped.define("module:Elements.ElementSupport", ["base:Types", "jquery:"], function (Types, $) {
	return {		
	
		elementFromPoint : function(x, y, disregarding) {
			disregarding = disregarding || [];
			if (!Types.is_array(disregarding))
				disregarding = [ disregarding ];
			var backup = [];
			for (var i = 0; i < disregarding.length; ++i) {
				disregarding[i] = $(disregarding[i]);
				backup.push(disregarding[i].css("z-index"));
				disregarding[i].css("z-index", -1);
			}
			var element = document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
			for (i = 0; i < disregarding.length; ++i)
				disregarding[i].css("z-index", backup[i]);
			return element;
		},
	
		elementBoundingBox : function(element) {
			element = $(element);
			var offset = element.offset();
			return {
				left : offset.left,
				top : offset.top,
				right : offset.left + element.outerWidth() - 1,
				bottom : offset.top + element.outerHeight() - 1
			};
		},
	
		pointWithinElement : function(x, y, element) {
			var bb = this.elementBoundingBox(element);
			return bb.left <= x && x <= bb.right && bb.top <= y && y <= bb.bottom;
		},
		
		childContainingElement: function (parent, element) {
			parent = $(parent).get(0);
			element = $(element).get(0);
			while (element.parentNode != parent) {
				if (element == document.body)
					return null;
				element = element.parentNode;
			}
			return element;
		}
		
	};
});