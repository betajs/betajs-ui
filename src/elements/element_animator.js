Scoped.define("module:Elements.Animators", [
    "base:Class",
    "base:Objs",
    "browser:Dom"
], function (Class, Objs, Dom, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element, options, callback, context) {
				inherited.constructor.call(this);
				this._element = Dom.unbox(element);
				this._options = Objs.extend({
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
				if (this.destroyed())
					return;
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
		
		};
	});
});


Scoped.define("module:Elements.DefaultAnimator", [
    "module:Elements.Animators",
    "base:Objs",
    "base:Types",
    "base:Timers.Timer"
], function (Animators, Objs, Types, Timer, scoped) {
	return Animators.extend({scoped: scoped}, function (inherited) {
		
		var Methods = {
			linear: function (x) {
				return x;
			},
			swing: function (x) {
				return Math.sin(x * Math.PI / 2);
			}
		};
		
		return {
	
			constructor: function (element, options, callback, context) {
				options = Objs.extend({
					duration: 250,
					delay: 10,
					styles: {},
					method: "swing"
				}, options);
				if (Types.is_string(options.method))
					options.method = Methods[options.method] || Methods.linear;
				this.__timer = this.auto_destroy(new Timer({
					delay: options.delay,
					start: false,
					context: this,
					fire: this.__fire
				}));
				inherited.constructor.call(this, element, options, callback, context);
			},

			__setProgress: function (progress) {
				progress = Math.max(0.0, Math.min(1.0, progress));
				Objs.iter(this.__styles, function (value, key) {
					this._element.style[key] = Math.round(value.start + (value.end - value.start) * progress) + value.postfix;
				}, this);
			},
			
			__fire: function () {
				this.__setProgress(this._options.method(this.__timer.duration() / this._options.duration));
				if (this.__timer.duration() >= this._options.duration)
					this._complete();
			},
		
			_start: function () {
				this.__timer.stop();
				this.__styles = Objs.map(this._options.styles, function (value, key) {
					return {
						start: parseFloat(this._element.style[key]),
						end: parseFloat(value),
						postfix: Types.is_string(value) ? value.replace(/[\d\.]/g, "") : ""
					};
				}, this);
				this.__timer.start();
			},
			
			_revert: function () {
				this.__timer.stop();
				this.__setProgress(0.0);
				this._reverted();
			},
			
			_complete: function () {
				this.__timer.stop();
				this.__setProgress(1.0);
				this._completed();
			}			
	
		};
	});
});
