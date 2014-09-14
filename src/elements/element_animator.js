BetaJS.Class.extend("BetaJS.UI.Elements.Animators", {
	
	constructor: function (element, options, callback, context) {
		this._inherited(BetaJS.UI.Elements.Animators, "constructor");
		this._element = element;
		this._options = BetaJS.Objs.extend({
			callback_on_revert: true,
			callback_on_complete: true,
			auto_start: true,
			auto_destroy: true
		}, options);
		this._callback = callback;
		this._context = context;
		this._running = false;
		if (this._options.auto_start)
			this.start();
	},
	
	start: function () {
		if (this._running)
			return;
		this._running = true;
		this._start();
	},
	
	revert: function () {
		if (!this._running)
			return;
		this._running = false;
		this._revert();
	},
	
	complete: function () {
		if (!this._running)
			return;
		this._complete();
	},
	
	__callback: function () {
		this._callback.apply(this._context || this);
		if (this._options && this._options.auto_destroy)
			this.destroy();
	},
	
	_finished: function () {
		this.__callback();
	},
	
	_reverted: function () {
		if (this._options.callback_on_revert)
			this.__callback();
	},
	
	_completed: function () {
		if (this._options.callback_on_complete)
			this.__callback();
	},
	
	_start: function () {
		this._finished();
	},
	
	_revert: function () {
		this._reverted();
	},
	
	_complete: function () {
		this._completed();
	}
	
});


BetaJS.UI.Elements.Animators.extend("BetaJS.UI.Elements.DefaultAnimator", {
	
	constructor: function (element, options, callback, context) {
		options = BetaJS.Objs.extend({
			duration: 250,
			styles: {},
			method: "swing"
		}, options);		
		this._inherited(BetaJS.UI.Elements.DefaultAnimator, "constructor", element, options, callback, context);
	},

	_start: function () {
		var self = this;
		this.__animate = this._element.animate(this._options.styles, this._options.duration, this._options.method, function () {
			self._finished();
		});
	},
	
	_revert: function () {
		this.__animate.stop();
		this._reverted();
	},
	
	_complete: function () {
		this.__animate.stop(true);
		this._completed();
	}
	
});