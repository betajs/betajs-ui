Scoped.define("module:Dynamics.InteractionPartial", [
    "dynamics:Handlers.Partial",
    "module:Interactions",
    "base:Strings",
    "base:Objs",
    "base:Types"
], function (Partial, Interactions, Strings, Objs, Types, scoped) {
 	var Cls = Partial.extend({scoped: scoped}, function (inherited) {
 		return {
			
			_apply: function (value) {
				var node = this._node;
				var handler = node._handler;
				node.interactions = node.interactions || {};
				if (this._postfix in node.interactions && !node.interactions[this._postfix].destroyed()) {
					node.interactions[this._postfix].data = value.data;
					return;
				} 
				value = Objs.extend(value, value.options);
				var InteractionClass = Interactions[Strings.capitalize(value.type)];
				var elem = value.sub ? this._node.element().querySelector(value.sub) : this._node.element();
				var interaction = new InteractionClass(elem, Objs.extend({
					enabled: true,
					context: handler
				}, value), value.data);
				node.interactions[this._postfix] = interaction;
				Objs.iter(value.events, function (callee, event) {
					interaction.on(event, function (arg1, arg2, arg3, arg4) {
						if (Types.is_string(callee))
							handler.call(callee, this._value.data, arg1, arg2, arg3, arg4);
						else
							callee.call(handler, this._value.data, arg1, arg2, arg3, arg4);
					}, this);
				}, this);
			},
			
			_deactivate: function () {
				this.__release();
			},
			
			__release: function () {
				var node = this._node;
				node.interactions = node.interactions || {};
				if (this._postfix in node.interactions)
					node.interactions[this._postfix].weakDestroy();
			},
			
			destroy: function () {
				this.__release();
				inherited.destroy.call(this);
			}

 		};
 	});
 	Cls.register("ba-interaction");
	return Cls;
});
