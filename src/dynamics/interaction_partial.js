Scoped.define("module:Dynamics.InteractionPartial", [
    "dynamics:Handlers.Partial",
    "module:Interactions",
    "base:Strings",
    "base:Objs",
    "base:Types"
], function (Partial, Interactions, Strings, Objs, Types, scoped) {
 	var Cls = Partial.extend({scoped: scoped}, {
		
		_apply: function (value) {
			var node = this._node;
			var handler = node._handler;
			node.interactions = node.interactions || {};
			if (this._postfix in node.interactions && !node.interactions[this._postfix].destroyed())
				return;
			value = Objs.extend(value, value.options);
			var InteractionClass = Interactions[Strings.capitalize(value.type)];
			var interaction = new InteractionClass(value.sub ? this._node._$element.find(value.sub) : this._node._$element, Objs.extend({
				enabled: true
			}, value), value.data);
			node.interactions[this._postfix] = interaction;
			Objs.iter(value.events, function (callee, event) {
				interaction.on(event, function (arg1, arg2, arg3, arg4) {
					if (Types.is_string(callee))
						handler.call(callee, value.data, arg1, arg2, arg3, arg4);
					else
						callee.call(handler, value.data, arg1, arg2, arg3, arg4);
				}, this);
			}, this);
		},
		
		_deactivate: function () {
			var node = this._node;
			node.interactions = node.interactions || {};
			if (this._postfix in node.interactions)
				node.interactions[this._postfix].weakDestroy();
		}		

 	});
 	Cls.register("ba-interaction");
	return Cls;
});
