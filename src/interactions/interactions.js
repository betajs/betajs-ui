Scoped.define("module:Interactions.ElementInteraction", [
	    "base:Class",
	    "base:Events.EventsMixin",
	    "module:Hardware.MouseCoords",
	    "jquery:",
	    "base:Async",
	    "base:States.Host",
	    "base:Ids"
	], function (Class, EventsMixin, MouseCoords, $, Async, StateHost, Ids, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {

			constructor: function (element, options) {
				inherited.constructor.call(this);
				MouseCoords.require();
				this._element = $($(element).get(0));
				this._enabled = false;
				this._options = options || {};
				if ("enabled" in this._options) {
					var enabled = this._options.enabled;
					delete this._options.enabled;
					if (enabled) 
						Async.eventually(this.enable, this);
				}
				this._host = new StateHost();
				this._host.parent = this;
			},
			
			__on: function (element, event, callback, context) {
				var self = this;
				var events = event.split(" ");
				for (var i = 0; i < events.length; ++i)
					$(element).on(events[i] + "." + Ids.objectId(this), function () {
						callback.apply(context || self, arguments);
					});
			},
			
			destroy: function () {
				this.element().off("." + Ids.objectId(this));
				this.disable();
				this._host.destroy();
				MouseCoords.unrequire();
				inherited.destroy.call(this);
			},
			
			enable: function () {
				if (this._enabled)
					return;
				this._enabled = true;
				this._enable();
			},
			
			disable: function () {
				if (!this._enabled)
					return;
				this._enabled = false;
				this._disable();
			},
			
			element: function () {
				return this._element;
			},
			
			options: function () {
				return this._options;
			},
			
			_enable: function () {},
			
			_disable: function () {}
		
		};

	}], {
			
		multiple: function (element, options, callback, context) {
			var self = this;
			$(element).each(function () {
				var obj = new self(this, options);
				if (callback)
					callback.call(context || obj, obj);
			});
		}
		
	});
});



Scoped.define("module:Interactions.State", [
 	    "base:States.State",
 	    "jquery:",
 	    "base:Ids"
 	], function (State, $, Ids, scoped) {
 	return State.extend({scoped: scoped}, {
		
		parent: function () {
			return this.host.parent;
		},
		
		element: function () {
			return this.parent().element();
		},
		
		options: function () {
			return this.parent().options();
		},
		
		on: function (element, event, callback, context) {
			var self = this;
			var events = event.split(" ");
			for (var i = 0; i < events.length; ++i)
				$(element).on(events[i] + "." + Ids.objectId(this), function () {
					callback.apply(context || self, arguments);
				});
		},
		
		_end: function () {
			this.element().off("." + Ids.objectId(this));
			$("body").off("." + Ids.objectId(this));
		}	
	
 	});
});
