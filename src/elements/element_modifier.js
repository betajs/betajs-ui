Scoped.define("module:Elements.ElementModifier", [
	    "base:Class",
	    "jquery:"
	], function (Class, $, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element) {
				inherited.constructor.call(this);
				this._element = $(element);
				this._css = {};
				this._cls = {};
			},
			
			css: function (key, value) {
				if (arguments.length < 2)
					return this._element.css.apply(this._element, arguments);
				if (this._element.css(key) === value)
					return value;
				if (!(key in this._css))
					//this._css[key] = this._element.css(key);
					this._css[key] = this._element.get(0).style[key];
				this._element.css(key, value);
				return value;
			},
			
			csscls: function (key, value) {
				var has = this._element.hasClass(key);
				if (arguments.length < 2)
					return key;
				if (has === value)
					return value;
				if (!(key in this._cls))
					this._cls[key] = has;
				if (value)
					this._element.addClass(key);
				else
					this._element.removeClass(key);
				return value;
			},
			
			removeClass: function (cls) {
				if (!this._element.hasClass(cls))
					return;
				if (!(cls in this._cls))
					this._cls[cls] = true;
				this._element.addClass(cls);
			},
			
			revert: function () {
				for (var key in this._css)
					this._element.css(key, this._css[key]);
				for (key in this._cls) {
					if (this._cls[key])
						this._element.addClass(key);
					else
						this._element.removeClass(key);
				}
			}
		
		};
	});
});