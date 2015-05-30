/*!
betajs-ui - v1.0.0 - 2015-05-30
Copyright (c) Oliver Friedmann,Victor Lingenthal
MIT Software License.
*/
/*!
betajs-scoped - v0.0.1 - 2015-03-26
Copyright (c) Oliver Friedmann
MIT Software License.
*/
var Scoped = (function () {
var Globals = {

	get : function(key) {
		if (typeof window !== "undefined")
			return window[key];
		if (typeof global !== "undefined")
			return global[key];
		return null;
	},

	set : function(key, value) {
		if (typeof window !== "undefined")
			window[key] = value;
		if (typeof global !== "undefined")
			global[key] = value;
		return value;
	},
	
	setPath: function (path, value) {
		var args = path.split(".");
		if (args.length == 1)
			return this.set(path, value);		
		var current = this.get(args[0]) || this.set(args[0], {});
		for (var i = 1; i < args.length - 1; ++i) {
			if (!(args[i] in current))
				current[args[i]] = {};
			current = current[args[i]];
		}
		current[args[args.length - 1]] = value;
		return value;
	},
	
	getPath: function (path) {
		var args = path.split(".");
		if (args.length == 1)
			return this.get(path);		
		var current = this.get(args[0]);
		for (var i = 1; i < args.length; ++i) {
			if (!current)
				return current;
			current = current[args[i]];
		}
		return current;
	}

};
var Helper = {
		
	method: function (obj, func) {
		return function () {
			return func.apply(obj, arguments);
		};
	},
	
	extend: function (base, overwrite) {
		base = base || {};
		overwrite = overwrite || {};
		for (var key in overwrite)
			base[key] = overwrite[key];
		return base;
	},
	
	typeOf: function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]' ? "array" : typeof obj;
	},
	
	isEmpty: function (obj) {
		if (obj === null || typeof obj === "undefined")
			return true;
		if (this.typeOf(obj) == "array")
			return obj.length === 0;
		if (typeof obj !== "object")
			return false;
		for (var key in obj)
			return false;
		return true;
	},
	
	matchArgs: function (args, pattern) {
		var i = 0;
		var result = {};
		for (var key in pattern) {
			if (pattern[key] === true || this.typeOf(args[i]) == pattern[key]) {
				result[key] = args[i];
				i++;
			} else if (this.typeOf(args[i]) == "undefined")
				i++;
		}
		return result;
	},
	
	stringify: function (value) {
		if (this.typeOf(value) == "function")
			return "" + value;
		return JSON.stringify(value);
	}	

};
var Attach = {
		
	__namespace: "Scoped",
	
	upgrade: function (namespace) {
		var current = Globals.get(namespace || Attach.__namespace);
		if (current && Helper.typeOf(current) == "object" && current.guid == this.guid && Helper.typeOf(current.version) == "string") {
			var my_version = this.version.split(".");
			var current_version = current.version.split(".");
			var newer = false;
			for (var i = 0; i < Math.min(my_version.length, current_version.length); ++i) {
				newer = my_version[i] > current_version[i];
				if (my_version[i] != current_version[i]) 
					break;
			}
			return newer ? this.attach(namespace) : current;				
		} else
			return this.attach(namespace);		
	},

	attach : function(namespace) {
		if (namespace)
			Attach.__namespace = namespace;
		var current = Globals.get(Attach.__namespace);
		if (current == this)
			return this;
		Attach.__revert = current;
		Globals.set(Attach.__namespace, this);
		return this;
	},
	
	detach: function (forceDetach) {
		if (forceDetach)
			Globals.set(Attach.__namespace, null);
		if (typeof Attach.__revert != "undefined")
			Globals.set(Attach.__namespace, Attach.__revert);
		delete Attach.__revert;
		return this;
	},
	
	exports: function (mod, object, forceExport) {
		mod = mod || (typeof module != "undefined" ? module : null);
		if (typeof mod == "object" && mod && "exports" in mod && (forceExport || mod.exports == this || !mod.exports || Helper.isEmpty(mod.exports)))
			mod.exports = object || this;
		return this;
	}	

};

function newNamespace (options) {
	
	options = Helper.extend({
		tree: false,
		global: false,
		root: {}
	}, options);
	
	function initNode(options) {
		return Helper.extend({
			route: null,
			parent: null,
			children: {},
			watchers: [],
			data: {},
			ready: false,
			lazy: []
		}, options);
	}
	
	var nsRoot = initNode({ready: true});
	
	var treeRoot = null;
	
	if (options.tree) {
		if (options.global) {
			try {
				if (window)
					treeRoot = window;
			} catch (e) { }
			try {
				if (global)
					treeRoot = global;
			} catch (e) { }
		} else
			treeRoot = options.root;
		nsRoot.data = treeRoot;
	}
	
	function nodeDigest(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready) {
			nodeDigest(node.parent);
			return;
		}
		if (node.route in node.parent.data) {
			node.data = node.parent.data[node.route];
			node.ready = true;
			for (var i = 0; i < node.watchers.length; ++i)
				node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
			node.watchers = [];
			for (var key in node.children)
				nodeDigest(node.children[key]);
		}
	}
	
	function nodeEnforce(node) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready)
			nodeEnforce(node.parent);
		node.ready = true;
		if (options.tree && typeof node.parent.data == "object")
			node.parent.data[node.route] = node.data;
		for (var i = 0; i < node.watchers.length; ++i)
			node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
		node.watchers = [];
	}
	
	function nodeSetData(node, value) {
		if (typeof value == "object") {
			for (var key in value) {
				node.data[key] = value[key];
				if (node.children[key])
					node.children[key].data = value[key];
			}
		} else
			node.data = value;
		nodeEnforce(node);
		for (var k in node.children)
			nodeDigest(node.children[k]);
	}
	
	function nodeClearData(node) {
		if (node.ready && node.data) {
			for (var key in node.data)
				delete node.data[key];
		}
	}
	
	function nodeNavigate(path) {
		if (!path)
			return nsRoot;
		var routes = path.split(".");
		var current = nsRoot;
		for (var i = 0; i < routes.length; ++i) {
			if (routes[i] in current.children)
				current = current.children[routes[i]];
			else {
				current.children[routes[i]] = initNode({
					parent: current,
					route: routes[i]
				});
				current = current.children[routes[i]];
				nodeDigest(current);
			}
		}
		return current;
	}
	
	function nodeAddWatcher(node, callback, context) {
		if (node.ready)
			callback.call(context || this, node.data);
		else {
			node.watchers.push({
				callback: callback,
				context: context
			});
			if (node.lazy.length > 0) {
				var f = function (node) {
					if (node.lazy.length > 0) {
						var lazy = node.lazy.shift();
						lazy.callback.call(lazy.context || this, node.data);
						f(node);
					}
				};
				f(node);
			}
		}
	}

	return {
		
		extend: function (path, value) {
			nodeSetData(nodeNavigate(path), value);
		},
		
		set: function (path, value) {
			var node = nodeNavigate(path);
			if (node.data)
				nodeClearData(node);
			nodeSetData(node, value);
		},
		
		lazy: function (path, callback, context) {
			var node = nodeNavigate(path);
			if (node.ready)
				callback(context || this, node.data);
			else {
				node.lazy.push({
					callback: callback,
					context: context
				});
			}
		},
		
		digest: function (path) {
			nodeDigest(nodeNavigate(path));
		},
		
		obtain: function (path, callback, context) {
			nodeAddWatcher(nodeNavigate(path), callback, context);
		}
		
	};
	
}
function newScope (parent, parentNamespace, rootNamespace, globalNamespace) {
	
	var self = this;
	var nextScope = null;
	var childScopes = [];
	var localNamespace = newNamespace({tree: true});
	var privateNamespace = newNamespace({tree: false});
	
	var bindings = {
		"global": {
			namespace: globalNamespace
		}, "root": {
			namespace: rootNamespace
		}, "local": {
			namespace: localNamespace
		}, "default": {
			namespace: privateNamespace
		}, "parent": {
			namespace: parentNamespace
		}, "scope": {
			namespace: localNamespace,
			readonly: false
		}
	};
	
	var custom = function (argmts, name, callback) {
		var args = Helper.matchArgs(argmts, {
			options: "object",
			namespaceLocator: true,
			dependencies: "array",
			hiddenDependencies: "array",
			callback: true,
			context: "object"
		});
		
		var options = Helper.extend({
			lazy: this.options.lazy
		}, args.options || {});
		
		var ns = this.resolve(args.namespaceLocator);
		
		var execute = function () {
			this.require(args.dependencies, args.hiddenDependencies, function () {
				arguments[arguments.length - 1].ns = ns;
				if (this.options.compile) {
					var params = [];
					for (var i = 0; i < argmts.length; ++i)
						params.push(Helper.stringify(argmts[i]));
					this.compiled += this.options.ident + "." + name + "(" + params.join(", ") + ");\n\n";
				}
				var result = args.callback.apply(args.context || this, arguments);
				callback.call(this, ns, result);
			}, this);
		};
		
		if (options.lazy)
			ns.namespace.lazy(ns.path, execute, this);
		else
			execute.apply(this);

		return this;
	};
	
	return {
		
		getGlobal: Helper.method(Globals, Globals.getPath),
		setGlobal: Helper.method(Globals, Globals.setPath),
		
		options: {
			lazy: false,
			ident: "Scoped",
			compile: false			
		},
		
		compiled: "",
		
		nextScope: function () {
			if (!nextScope)
				nextScope = newScope(this, localNamespace, rootNamespace, globalNamespace);
			return nextScope;
		},
		
		subScope: function () {
			var sub = this.nextScope();
			childScopes.push(sub);
			nextScope = null;
			return sub;
		},
		
		binding: function (alias, namespaceLocator, options) {
			if (!bindings[alias] || !bindings[alias].readonly) {
				var ns;
				if (Helper.typeOf(namespaceLocator) != "string") {
					ns = {
						namespace: newNamespace({
							tree: true,
							root: namespaceLocator
						}),
						path: null	
					};
				} else
					ns = this.resolve(namespaceLocator);
				bindings[alias] = Helper.extend(options, ns);
			}
			return this;
		},
		
		resolve: function (namespaceLocator) {
			var parts = namespaceLocator.split(":");
			if (parts.length == 1) {
				return {
					namespace: privateNamespace,
					path: parts[0]
				};
			} else {
				var binding = bindings[parts[0]];
				if (!binding)
					throw ("The namespace '" + parts[0] + "' has not been defined (yet).");
				return {
					namespace: binding.namespace,
					path : binding.path && parts[1] ? binding.path + "." + parts[1] : (binding.path || parts[1])
				};
			}
		},
		
		define: function () {
			return custom.call(this, arguments, "define", function (ns, result) {
				ns.namespace.set(ns.path, result);
			});
		},
		
		extend: function () {
			return custom.call(this, arguments, "extend", function (ns, result) {
				ns.namespace.extend(ns.path, result);
			});
		},
		
		condition: function () {
			return custom.call(this, arguments, "condition", function (ns, result) {
				if (result)
					ns.namespace.set(ns.path, result);
			});
		},
		
		require: function () {
			var args = Helper.matchArgs(arguments, {
				dependencies: "array",
				hiddenDependencies: "array",
				callback: "function",
				context: "object"
			});
			args.callback = args.callback || function () {};
			var dependencies = args.dependencies || [];
			var allDependencies = dependencies.concat(args.hiddenDependencies || []);
			var count = allDependencies.length;
			var deps = [];
			var environment = {};
			if (count) {
				var f = function (value) {
					if (this.i < deps.length)
						deps[this.i] = value;
					count--;
					if (count === 0) {
						deps.push(environment);
						args.callback.apply(args.context || this.ctx, deps);
					}
				};
				for (var i = 0; i < allDependencies.length; ++i) {
					var ns = this.resolve(allDependencies[i]);
					if (i < dependencies.length)
						deps.push(null);
					ns.namespace.obtain(ns.path, f, {
						ctx: this,
						i: i
					});
				}
			} else {
				deps.push(environment);
				args.callback.apply(args.context || this, deps);
			}
			return this;
		},
		
		digest: function (namespaceLocator) {
			var ns = this.resolve(namespaceLocator);
			ns.namespace.digest(ns.path);
			return this;
		}		
		
	};
	
}
var globalNamespace = newNamespace({tree: true, global: true});
var rootNamespace = newNamespace({tree: true});
var rootScope = newScope(null, rootNamespace, rootNamespace, globalNamespace);

var Public = Helper.extend(rootScope, {
		
	guid: "4b6878ee-cb6a-46b3-94ac-27d91f58d666",
	version: '9.1427403679672',
		
	upgrade: Attach.upgrade,
	attach: Attach.attach,
	detach: Attach.detach,
	exports: Attach.exports
	
});

Public = Public.upgrade();
Public.exports();
	return Public;
}).call(this);
/*!
betajs-ui - v1.0.0 - 2015-05-30
Copyright (c) Oliver Friedmann,Victor Lingenthal
MIT Software License.
*/
(function () {

var Scoped = this.subScope();

Scoped.binding("module", "global:BetaJS.UI");
Scoped.binding("base", "global:BetaJS");
Scoped.binding("browser", "global:BetaJS.Browser");

Scoped.binding("jquery", "global:jQuery");

Scoped.define("module:", function () {
	return {
		guid: "ff8d5222-1ae4-4719-b842-1dedb9162bc0",
		version: '39.1433007835145'
	};
});

Scoped.define("module:Elements.Animators", [
	    "base:Class",
	    "base:Objs"
	], function (Class, Objs, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element, options, callback, context) {
				inherited.constructor.call(this);
				this._element = element;
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
	    "base:Objs"
	], function (Animators, Objs, scoped) {
	return Animators.extend({scoped: scoped}, function (inherited) {
		return {
	
			constructor: function (element, options, callback, context) {
				options = Objs.extend({
					duration: 250,
					styles: {},
					method: "swing"
				}, options);		
				inherited.constructor.call(this, element, options, callback, context);
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
	
		};
	});
});

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
Scoped.define("module:Events.Mouse", ["browser:Info"], function (Info) {
	return {		
			
		downEvent: Info.isMobile() ? "touchstart" : "mousedown",	
		moveEvent: Info.isMobile() ? "touchmove" : "mousemove",	
		upEvent: Info.isMobile() ? "touchend" : "mouseup",
		clickEvent: Info.isMobile() ? "touchstart" : "click",
				
		customCoords: function (event, type, multi) {
			if (event.originalEvent.touches && event.originalEvent.touches.length) {
				var touches = event.originalEvent.touches;
				if (multi) {
					var touch_coords = [];
					for (var i = 0; i < touches.length; ++i) {
						touch_coords.push({
							x: touches[i][type + "X"],
							y: touches[i][type + "Y"]
						});
					}
					return touch_coords;
				}
				return {
					x: touches[0][type + "X"],
					y: touches[0][type + "Y"]
				};
			}
			var coords = {
				x: event[type + "X"],
				y: event[type + "Y"]
			};
			return multi ? [coords] : coords;
		},
		
		pageCoords: function (event, multi) {
			return this.customCoords(event, "page", multi);
		},
		
		clientCoords: function (event, multi) {
			return this.customCoords(event, "client", multi);
		},
	
		screenCoords: function (event, multi) {
			return this.customCoords(event, "screen", multi);
		}

	};
});
Scoped.define("module:Events.Support", [
	    "base:Objs",
	    "base:Types",
	    "jquery:",
	    "module:Elements.ElementSupport"
	], function (Objs, Types, $, ElemSupp) {
	return {		
	
		dispatchElementEvent: function (element, label, data, options) {
			element.dispatchEvent(new CustomEvent(label, Objs.extend({
				bubbles: true,
				cancelable: true,
				detail: data
			}, options)));
		},
		
		dispatchElementsEvent: function (elements, label, data, options) {
			for (var i = 0; i < elements.length; ++i) {
				elements[i].dispatchEvent(new CustomEvent(label, Objs.extend({
					bubbles: false,
					cancelable: true,
					detail: data
				}, options)));
			}
		},
		
		dispatchManualBubbleEvent: function (element, label, predicate, data, options) {
			this.dispatchElementsEvent($(element).parents().andSelf().filter(predicate), label, data, options); 
		},
		
		dispatchPointsSeparatorEvent: function (element, label, included, excluded, data, options) {
			included = included ? (Types.is_array(included) ? included : [included]) : [];
			excluded = excluded ? (Types.is_array(excluded) ? excluded : [excluded]) : [];
			this.dispatchManualBubbleEvent(element, label, function () {
				for (var i = 0; i < included.length; ++i) {
					if (!ElemSupp.pointWithinElement(included[i].x, included[i].y, this))
						return false;
				}
				for (i = 0; i < excluded.length; ++i) {
					if (ElemSupp.pointWithinElement(excluded[i].x, excluded[i].y, this))
						return false;
				}
				return true;
			}, data, options);
		}
	
	};
});

Scoped.define("module:Hardware.MouseCoords", [
	    "base:Ids",
	    "base:Objs",
	    "jquery:",
	    "module:Events.Mouse"
	], function (Ids, Objs, $, MouseEvents) {
	return {		
			
		__required: 0,
		
		coords: {x: 0, y: 0},
			
		require: function () {
			if (this.__required === 0) {
				var self = this;
				var events = [MouseEvents.moveEvent, MouseEvents.upEvent, MouseEvents.downEvent];
				Objs.iter(events, function (eventName) {
					$("body").on(eventName + "." + Ids.objectId(this), function (event) {
						var result = MouseEvents.pageCoords(event);
						if (result.x && result.y)
							self.coords = result; 
					});
				}, this);
			}
			this.__required++;
		},
		
		unrequire: function () {
			this.__required--;
			if (this.__required === 0) {
				$("body").off("." + Ids.objectId(this));
			}
		}
		
	};
});
Scoped.define("module:Interactions.Drag", [
        "module:Interactions.ElementInteraction",
	    "module:Elements.ElementModifier",
	    "module:Elements.ElementSupport",
	    "module:Events.Support",
	    "module:Events.Mouse",
	    "module:Hardware.MouseCoords",
	    "base:Ids",
	    "base:Objs",
	    "base:Functions"
	], function (ElemInter, ElemMod, ElemSupp, EventsSupp, MouseEvents, MouseCoords, Ids, Objs, Functions, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (element, options, data) {
				options = Objs.extend({
					start_event: MouseEvents.downEvent,
					stop_event: MouseEvents.upEvent,
					draggable_x: true,
					draggable_y: true,
					clone_element: false,
					drag_original_element: false,
					droppable: false,
					remove_element_on_drop: false,
					revertable: true,
					draggable: function () {
						return true;
					}
				}, options);
				inherited.constructor.call(this, element, options);
				this._host.initialize(this.cls.classname + "States.Idle");
				this._modifier = new ElemMod(this._element);
				this.data = data;
			},
			
			destroy: function () {
				this._modifier.revert();
				this._modifier.destroy();
				inherited.destroy.call(this);
			},
			
			_enable: function () {
				if (this._options.start_event)
					this._element.on(this._options.start_event + "." + Ids.objectId(this), Functions.as_method(this.start, this));
			},
			
			_disable: function () {
				this._element.off("." + Ids.objectId(this));
				this.stop();
			},
			
			start: function () {
				if (this._enabled )
					this._host.state().next("Dragging");
			},
			
			stop: function () {
				if (this._enabled)
					this._host.state().next("Stopping");
			},
		
			draggable: function () {
				return this._options.draggable.call(this._options.context, this);
			},
		
			abort: function () {
				if (this._enabled)
					this._host.state().next("Idle");
			},
		
			dropped: function (drop) {
				this.trigger("dropped", drop);
				this._host.state().next("Stopping", {immediately: true});
				if (this._options.remove_element_on_drop) {
					this.element().remove();
					this.destroy();
				}
			},
			
			actionable_element: function () {
				var c = this._host.state()._cloned_element;
				return c ? c : this._element;
			},
			
			modifier: function () {
				return this._modifier;
			},
			
			actionable_modifier: function () {
				var c = this._host.state()._cloned_modifier;
				return c ? c : this._modifier;
			},
			
			__eventData: function () {
				return {
					element: this.element(),
					actionable_element: this.actionable_element(),
					modifier: this.modifier(),
					actionable_modifier: this.actionable_modifier(),
					source: this,
					data: this.data,
					page_coords: MouseCoords.coords,
					underneath: this.__underneath
				};
			},
			
			__triggerEvent: function (label) {
				this.trigger(label, this.__eventData());
			},
			
			__triggerDomEvent: function (label) {
				var data = this.__eventData();
				var underneath = ElemSupp.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
				if (underneath)
					EventsSupp.dispatchElementEvent(underneath, "drag-" + label, data);
			},
			
			__triggerDomMove: function () {
				var data = this.__eventData();
				var underneath = ElemSupp.elementFromPoint(data.page_coords.x, data.page_coords.y, this.actionable_element());
				if (underneath) {
					if (this.__old_coords && this.__underneath && this.__underneath != underneath) {
						EventsSupp.dispatchPointsSeparatorEvent(underneath, "drag-enter", data.page_coords, this.__old_coords, data);
						EventsSupp.dispatchPointsSeparatorEvent(this.__underneath, "drag-leave", this.__old_coords, data.page_coords, data);
					}
					EventsSupp.dispatchElementEvent(underneath, "drag-hover", data);
				}
				this.__underneath = underneath;
				this.__old_coords = data.page_coords;
			}
		
		};
	});
});


Scoped.define("module:Interactions.DragStates.Idle", ["module:Interactions.State"], function (State, scoped) {
	return State.extend({scoped: scoped}, {
		
		_white_list: ["Dragging"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		},
		
		triggerDom: function (label) {
			this.parent().__triggerDomEvent(label);
		},
		
		triggerDomMove: function () {
			this.parent().__triggerDomMove();
		}

	});
});


Scoped.define("module:Interactions.DragStates.Dragging", [
	    "module:Interactions.DragStates.Idle",
	    "module:Hardware.MouseCoords",
	    "module:Elements.ElementModifier",
	    "module:Events.Mouse",
	    "jquery:"
	], function (State, MouseCoords, ElementMod, MouseEvents, $, scoped) {
	return State.extend({scoped: scoped}, {
		
		_white_list: ["Stopping"],
		_persistents: ["initial_element_coords", "cloned_element", "cloned_modifier", "placeholder_cloned_element"],
	
		_start: function () {
			var opts = this.parent().options();
			this._page_coords = MouseCoords.coords;
			if (opts.clone_element) {
				this._initial_element_coords = {
					x: this.element().offset().left,
					y: this.element().offset().top
				};
				var zindex = this.element().css("z-index");
				var width = this.element().width();
				var height = this.element().height();
				if (opts.drag_original_element) {
					this._placeholder_cloned_element = this.element().clone();
					this._cloned_element = this.element().replaceWith(this._placeholder_cloned_element);
				} else {
					this._cloned_element = this.element().clone();
				}
				this._cloned_modifier = new ElementMod(this._cloned_element); 
				this._cloned_modifier.css("position", "absolute");
				this._cloned_modifier.css("width", width + "px");
				this._cloned_modifier.css("height", height + "px");
				this._cloned_modifier.css("z-index", zindex + 1);
				this._cloned_modifier.css("left", this._initial_element_coords.x + "px");
				this._cloned_modifier.css("top", this._initial_element_coords.y + "px");
				$("body").append(this._cloned_element);
			} else {
				var modifier = this.parent().modifier();
				modifier.css("position", "relative");
				this._initial_element_coords = {};
				if (opts.draggable_x) {
					var left = modifier.css("left");
					if (left === "auto" || !left)
						modifier.css("left", "0px");
					this._initial_element_coords.x = parseInt(modifier.css("left"), 10);
				}
				if (opts.draggable_y) {
					var top = modifier.css("top");
					if (top === "auto" || !top)
						modifier.css("top", "0px");
					this._initial_element_coords.y = parseInt(modifier.css("top"), 10);
				}
			}
			this.trigger("start");
			this.on("body", MouseEvents.moveEvent, this.__dragging);
			if (opts.stop_event) {
				this.on("body", opts.stop_event, function () {
					if (opts.droppable)
						this.triggerDom("drop");
					if ("next" in this)
						this.next("Stopping", {released: true});
				});
			}
		},
		
		__dragging: function (event) {
			event.preventDefault();
			var page_coords = MouseEvents.pageCoords(event);
			var delta_coords = {
				x: page_coords.x - this._page_coords.x,
				y: page_coords.y - this._page_coords.y
			};
			this._page_coords = page_coords;
			var base = this.parent().actionable_modifier();
			if (this.options().draggable_x)
				base.css("left", (parseInt(base.css("left"), 10) + delta_coords.x) + "px");
			if (this.options().draggable_y)
				base.css("top", (parseInt(base.css("top"), 10) + delta_coords.y) + "px");
			this.trigger("move");
			this.triggerDomMove();
		}
		
	});
});


Scoped.define("module:Interactions.DragStates.Stopping", [
	    "module:Interactions.DragStates.Idle",
	    "module:Elements.DefaultAnimator"
	], function (State, Animator, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle"],
			_locals: ["initial_element_coords", "cloned_element", "cloned_modifier", "immediately", "released", "placeholder_cloned_element"],
			
			/* Linter */
			_immediately: null,
			
			_start: function () {
				this.trigger("stopping");
				this.triggerDom("stop");
				var options = this.options();
				if (!options.revertable || this._immediately) {
					if (this._released)
						this.trigger("release");
					this.next("Idle");
					return;
				}
				var styles = {};
				if (options.draggable_x)
					styles.left = this._initial_element_coords.x + "px";
				if (options.draggable_y)
					styles.top = this._initial_element_coords.y + "px";
				this.__animation = new Animator(this.parent().actionable_element(), {
					styles: styles
				}, function () {
					if (this.__animation)
						this.next("Idle");
				}, this);
				if (this._released)
					this.trigger("release");
			},
			
			_end: function () {
				if (this.__animation) {
					var animation = this.__animation;
					this.__animation = null;
					animation.complete();
				}
				if (this._cloned_modifier) {
					this._cloned_modifier.revert();
					this._cloned_modifier.destroy();
				}
				if (this._cloned_element) {
					if (this._placeholder_cloned_element) {
						this._cloned_element = this._placeholder_cloned_element.replaceWith(this._cloned_element);
					}
					this._cloned_element.remove();
				}
				this.parent().modifier().revert();
				this.trigger("stop");
				inherited._end.call(this);
			}
		
		};
	});
});
Scoped.define("module:Interactions.Drop", [
        "module:Interactions.ElementInteraction",
	    "base:Objs",
	    "module:Elements.ElementSupport",
	    "module:Elements.ElementModifier"
	], function (ElemInter, Objs, ElemSupp, ElemMod, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data) {
				options = Objs.extend({
					droppable: function () {
						return true;
					},
					context: this,
					bounding_box: function (bb) {
						return bb;
					}
				}, options);
				inherited.constructor.call(this, element, options);
				this._host.initialize(this.cls.classname + "States.Idle");
				this._modifier = new ElemMod(this._element);
				this.data = data;
			},
			
			destroy: function () {
				this._modifier.revert();
				this._modifier.destroy();
				this._host.destroy();
				inherited.destroy.call(this);
			},
			
			_enable: function () {
				this._host.state().next("Idle");
			},
			
			_disable: function () {
				this._host.state().next("Disabled");
			},
			
			modifier: function () {
				return this._modifier;
			},
			
			__eventData: function () {
				return {
					element: this.element(),
					modifier: this.modifier(),
					target: this,
					data: this.data,
					source: this._host.state()._drag_source ? this._host.state()._drag_source : null
				};
			},
			
			__triggerEvent: function (label) {
				this.trigger(label, this.__eventData());
			},
		
			droppable: function (source) {
				return this._options.droppable.call(this._options.context, source, this);
			},
			
			_is_hovering: function (source) {
				if (!source.source.options().droppable)
					return false;
				var bb = ElemSupp.elementBoundingBox(this.element());
				bb = this._options.bounding_box.call(this._options.context, bb);
				var co = source.page_coords;
				return bb.left <= co.x && co.x <= bb.right && bb.top <= co.y && co.y <= bb.bottom;
			}
			
		};
	});
});


Scoped.define("module:Interactions.DropStates.Disabled", ["module:Interactions.State"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

		_white_list: ["Idle"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		}	
	
	});
});


Scoped.define("module:Interactions.DropStates.Idle", ["module:Interactions.DropStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

		_white_list: ["Hover", "InvalidHover", "Disabled"],
	
		_start: function () {
			this.on(this.element(), "drag-hover", function (event) {
				if (!this.parent()._enabled)
					return;
				var drag_source = event.originalEvent.detail;
				if (this.parent()._is_hovering(drag_source))
					this.next(this.parent().droppable(drag_source) ? "Hover" : "InvalidHover", {drag_source: drag_source});
			});
		}

   	});
});


Scoped.define("module:Interactions.DropStates.Hover", ["module:Interactions.DropStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle", "Disabled", "Dropping"],
			_persistents: ["drag_source"],
		
			_start: function () {
				this.trigger("hover");
				this.on(this.element(), "drag-hover", function (event) {
					this._drag_source = event.originalEvent.detail;
					if (!this.parent()._is_hovering(this._drag_source))
						this.next("Idle");
				});
				this.on(this.element(), "drag-stop drag-leave", function (event) {
					this._drag_source = event.originalEvent.detail;
					this.next("Idle");
				});
				this.on(this.element(), "drag-drop", function (event) {
					this._drag_source = event.originalEvent.detail;
					this.next("Dropping");
				});
			},
			
			_end: function () {
				this.trigger("unhover");
				this.parent().modifier().revert();
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.Drop.InvalidHover", ["module:Interactions.Drop.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle", "Disabled"],
			_persistents: ["drag_source"],
		
			_start: function () {
				this.trigger("hover-invalid");
				this.on(this.element(), "drag-hover", function (event) {
					this._drag_source = event.originalEvent.detail;
					if (!this.parent()._is_hovering(this._drag_source))
						this.next("Idle");
				});
				this.on(this.element(), "drag-drop drag-stop drag-leave", function (event) {
					this._drag_source = event.originalEvent.detail;
					this.next("Idle");
				});
			},
			
			_end: function () {
				this.trigger("unhover");
				this.parent().modifier().revert();
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.DropStates.Dropping", ["module:Interactions.DropStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {
	
		_white_list: ["Idle", "Disabled"],
		_persistents: ["drag_source"],
	
		_start: function () {
			this.trigger("dropped");
			this._drag_source.source.dropped(this.parent());
			this.next("Idle");
		}
	
	});
});	

Scoped.define("module:Interactions.DropList", [
        "module:Interactions.ElementInteraction",
        "module:Elements.ElementSupport",
	    "base:Objs",
	    "jquery:"
	], function (ElemInter, ElemSupp, Objs, $, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data) {
				options = Objs.extend({
					droppable: function () {
						return true;
					},
					context: this,
					bounding_box: function (bb) {
						return bb;
					},
					floater: null
				}, options);
				inherited.constructor.call(this, element, options);
				this._host.initialize(this.cls.classname + "States.Idle");
				this.data = data;
				this._floater = $(this._options.floater);
				this._floater.css("display", "none");
			},
			
			destroy: function () {
				this._host.destroy();
				inherited.destroy.call(this);
			},
			
			_enable: function () {
				this._host.state().next("Idle");
			},
			
			_disable: function () {
				this._host.state().next("Disabled");
			},
			
			__eventData: function () {
				return {
					index: this._floater.index(),
					element: this.element(),
					target: this,
					data: this.data,
					source: this._host.state()._drag_source ? this._host.state()._drag_source : null
				};
			},
			
			__triggerEvent: function (label) {
				this.trigger(label, this.__eventData());
			},
		
			droppable: function (source) {
				return this._options.droppable.call(this._options.context, source, this);
			},
			
			__update_floater: function (data) {
			    this._floater.css("display", "none");
			    var coords = data.page_coords;
			    var child = ElemSupp.childContainingElement(this.element(), data.underneath);
			    if (!child)
			        return;
			    child = $(child);
			    if (child.get(0) == this._floater.get(0)) {
			        this._floater.css("display", "");
			        return;
			    }
			    var bb = ElemSupp.elementBoundingBox(child);
			    bb = this._options.bounding_box.call(this._options.context, bb);
			    if (bb.top <= coords.y && coords.y <= bb.bottom)
			    	return;
		        this._floater.css("display", "");
		        if (coords.y < bb.top)
		        	this._floater.insertBefore(child);
		        else
		        	this._floater.insertAfter(child);
			},
			
			insertAt: function (element, index) {
				var lastIndex = this.element().children().size();
				if (index < 0)
					index = Math.max(0, lastIndex + 1 + index);
				this.element().append(element);
				if (index < lastIndex) 
					this.element().children().eq(index).before(this.element().children().last());
			}
			
		};
	});
});



Scoped.define("module:Interactions.DropListStates.Disabled", ["module:Interactions.State"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {
		
		_white_list: ["Idle"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		}	
	
	});
});


Scoped.define("module:Interactions.DropListStates.Idle", ["module:Interactions.DropListStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {
		
   		_white_list: ["Hover", "Disabled"],

   		_start: function () {
   			this.on(this.element(), "drag-hover", function (event) {
   				var drag_source = event.originalEvent.detail;
   				if (this.parent().droppable(drag_source))
   					this.next("Hover");
   			});
   		}
	
	});
});


Scoped.define("module:Interactions.DropListStates.Hover", ["module:Interactions.DropListStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle", "Disabled", "Dropping"],
			_persistents: ["drag_source"],
		
			_start: function () {
				this.trigger("hover");
				this.on(this.element(), "drag-hover", function (event) {
					this._drag_source = event.originalEvent.detail;
					this.parent().__update_floater(this._drag_source);
				});
				this.on(this.element(), "drag-stop drag-leave", function (event) {
					this._drag_source = event.originalEvent.detail;
					this.next("Idle");
				});
				this.on(this.element(), "drag-drop", function (event) {
					this._drag_source = event.originalEvent.detail;
					this.parent().__update_floater(this._drag_source);
					this.next(this.parent()._floater.css("display") == "none" ? "Idle" : "Dropping");
				});
			},
			
			_end: function () {
				this.trigger("unhover");
				this.parent()._floater.css("display", "none");
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.DropListStates.Dropping", ["module:Interactions.DropListStates.Disabled"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {
	
		_white_list: ["Idle", "Disabled"],
		_persistents: ["drag_source"],
	
		_start: function () {
			this.trigger("dropped");
			this._drag_source.source.dropped(this.parent());
			this.next("Idle");
		}
	
	});
});

Scoped.define("module:Interactions.InfiniteScroll", [
        "module:Interactions.Scroll",
	    "base:Objs"
	], function (Scroll, Objs, scoped) {
	return Scroll.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (element, options, data) {
		    	options = Objs.extend({
		    		append_count: 25,
		    		prepend_count: 25,
		    		height_factor: 3,
		    		whitespace_bottom: false,
		    		context: null,
		    		append: null, // function (count, callback); callback should say how many and whether there could be more
		    		prepend: null // function (count, callback); callback should say how many and whether there could be more
				}, options);
		    	inherited.constructor.call(this, element, options);
				this._can_append = !!options.append;
				this._can_prepend = !!options.prepend;
				this._extending = false;
				if (options.prepend && this.options().whitespace) {
					this.__top_white_space = this._whitespaceCreate();
					this.itemsElement().prepend(this.__top_white_space);
				}
				if (this.options().whitespace_bottom) {
					this.__bottom_white_space = this._whitespaceCreate();
					this.itemsElement().append(this.__bottom_white_space);
				}
				this.reset(true);
		    },
		    
		    append: function (count) {
		    	var opts = this.options();
		    	if (this._can_append && !this._extending) {
		    		this._extending = true;
		    		var self = this;
		    		opts.append.call(opts.context, count || opts.append_count, function (added, done) {
		    			if (self.__bottom_white_space)
		    				self.itemsElement().append(self.__bottom_white_space);
		    			self._extending = false;
		    			self._can_append = done;
		    			self.appended(added);
		    		});
		    	}
		    },
		    
		    appendNeeded: function () {
		    	var total_height = this.element().get(0).scrollHeight;
		    	var element_height = this.element().innerHeight();
		    	var hidden_height = total_height - (this.element().scrollTop() + element_height) - this._whitespaceGetHeight(this.__bottom_white_space);
		    	return hidden_height < this.options().height_factor * element_height;
		    },
		    
		    prependNeeded: function () {
		    	if (!this.options().prepend)
		    		return false;
		    	var element_height = this.element().innerHeight();
		    	var hidden_height = this.element().scrollTop() - this._whitespaceGetHeight(this.__top_white_space);
		    	return hidden_height < this.options().height_factor * element_height;
		    },
		    
		    prepend: function (count) {
		    	var opts = this.options();
		    	if (this._can_prepend) {
		    		this._extending = true;
		    		var self = this;
		    		opts.prepend(opts.context, count || opts.prepend_count, function (added, done) {
		    			if (self.__top_white_space)
		    				self.itemsElement().prepend(self.__top_white_space);
		    			self._extending = false;
		    			self._can_prepend = done;
		    			self.prepended(added);
		    		});
		    	}
		    },
		    
		    appended: function (count) {
		    	// nothing to do
		    },
		    
		    prepended: function (count) {
		    	var first = this.itemsElement().find(":nth-child(2)");
		    	var last = this.itemsElement().find(":nth-child(" + (1 + count) + ")");
		    	var h = last.offset().top - first.offset().top + last.outerHeight();
		    	if (this.scrolling()) {
		    		this._whitespaceSetHeight(this.__top_white_space, this._whitespaceGetHeight(this.__top_white_space) - h);
		    	} else
		    		this.element().scrollTop(this.element().scrollTop() - h);
		    },
		    
		    extendFix: function () {
		    	if (this.scrollingDirection()) {
		    		if (this.appendNeeded())
		    			this.append();
		    	} else {
		    		if (this.prependNeeded())
		    			this.prepend();
		    	}
		    },
		    
		    _whitespaceFix: function () {
		    	if (!this.__top_white_space)
		    		return;
				var h = this._whitespaceGetHeight(this.__top_white_space);
		        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
				this.element().scrollTop(this.element().scrollTop() + this.options().whitespace - h);
		    },
		
		    reset: function (increment) {
		        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
		        if (this.options().prepend) {
			        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
			        this.element().scrollTop(this.options().whitespace + (increment ? this.element().scrollTop() : 0));
		        }
		    }
		    		
		};
	});
});


Scoped.define("module:Interactions.InfiniteScrollStates.Idle", ["module:Interactions.ScrollStates.Idle"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {});
});


Scoped.define("module:Interactions.InfiniteScrollStates.Scrolling", ["module:Interactions.ScrollStates.Scrolling"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent().extendFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});


Scoped.define("module:Interactions.InfiniteScrollStates.ScrollingTo", ["module:Interactions.ScrollStates.ScrollingTo"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent().extendFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});
Scoped.define("module:Interactions.ElementInteraction", [
	    "base:Class",
	    "base:Events.EventsMixin",
	    "module:Hardware.MouseCoords",
	    "jquery:",
	    "base:Async",
	    "base:States.Host",
	    "base:Ids",
	    "base:Objs"
	], function (Class, EventsMixin, MouseCoords, $, Async, StateHost, Ids, Objs, scoped) {
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
		        Objs.iter(events, function (eventName) {
					$(element).on(eventName + "." + Ids.objectId(this), function () {
						callback.apply(context || self, arguments);
					});
		        }, this);
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
 	    "base:Ids",
 	    "base:Objs"
 	], function (State, $, Ids, Objs, scoped) {
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
	        Objs.iter(events, function (eventName) {
				$(element).on(eventName + "." + Ids.objectId(this), function () {
					callback.apply(context || self, arguments);
				});
	        }, this);
		},
		
		_end: function () {
			this.element().off("." + Ids.objectId(this));
			$("body").off("." + Ids.objectId(this));
		}	
	
 	});
});

Scoped.define("module:Interactions.LoopScroll", ["module:Interactions.Scroll"], function (Scroll, scoped) {
	return Scroll.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (element, options, data) {
		    	inherited.constructor.call(this, element, options);
				this.__top_white_space = this._whitespaceCreate();
				this.itemsElement().prepend(this.__top_white_space);
				this.__bottom_white_space = this._whitespaceCreate();
				this.itemsElement().append(this.__bottom_white_space);
		        this.reset(true);
		    },
		
		    _rotateFix: function () {
		    	var top_ws_height = this._whitespaceGetHeight(this.__top_white_space);
		    	var bottom_ws_height = this._whitespaceGetHeight(this.__bottom_white_space);
		    	var full_height = this.element().get(0).scrollHeight;
		    	var visible_height = this.element().innerHeight();
		    	var elements_height = full_height - top_ws_height - bottom_ws_height;
		    	var scroll_top = this.element().scrollTop();
		    	var count = this.itemsElement().children().length - 2;
		    	var top_elements = (scroll_top - top_ws_height) / elements_height * count; 
		    	var bottom_elements = (elements_height - (scroll_top - top_ws_height) - visible_height) / elements_height * count;
		    	if (top_elements < 0) {
					top_ws_height = scroll_top - (elements_height - visible_height) / 2;
					this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
		    	} else if (bottom_elements < 0) {
					top_ws_height = scroll_top - (elements_height - visible_height) / 2;
		            this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
		    	} else if (top_elements < bottom_elements - 1) {
			    	while (top_elements < bottom_elements - 1) {
						var item = this.itemsElement().find(":nth-last-child(2)");
						item.insertAfter(this.__top_white_space);
						top_ws_height -= item.outerHeight();
		                this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
						bottom_elements--;
						top_elements++;
			    	}
				} else if (bottom_elements < top_elements - 1) {
			    	while (bottom_elements < top_elements - 1) {
						var item2 = this.itemsElement().find(":nth-child(2)");
						item2.insertBefore(this.__bottom_white_space);
						top_ws_height += item2.outerHeight();
		                this._whitespaceSetHeight(this.__top_white_space, top_ws_height);
						bottom_elements++;
						top_elements--;
			    	}
		    	}
		    },
		    
		    _whitespaceFix: function () {
		        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
				var h = this._whitespaceGetHeight(this.__top_white_space);
		        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
				this.element().scrollTop(this.element().scrollTop() + this.options().whitespace - h);
		    },
		
		    reset: function (increment) {
		        this._whitespaceSetHeight(this.__bottom_white_space, this.options().whitespace);
		        this._whitespaceSetHeight(this.__top_white_space, this.options().whitespace);
		        this.element().scrollTop(this.options().whitespace + (increment ? this.element().scrollTop() : 0));
		    }
		
		};
	});
});


Scoped.define("module:Interactions.LoopScrollStates.Idle", ["module:Interactions.ScrollStates.Idle"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {});
});


Scoped.define("module:Interactions.LoopScrollStates.Scrolling", ["module:Interactions.ScrollStates.Scrolling"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent()._rotateFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});


Scoped.define("module:Interactions.LoopScrollStates.ScrollingTo", ["module:Interactions.ScrollStates.ScrollingTo"], function (State, scoped) {
   	return State.extend({scoped: scoped}, {

   		_scroll: function () {
   			this.parent()._rotateFix();
   		},
   		
   		_scrollend: function () {
   			this.parent()._whitespaceFix();
   		}
   		
   	});
});

Scoped.define("module:Interactions.Pinch", ["module:Interactions.ElementInteraction"], function (ElemInter, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data) {
		    	inherited.constructor.call(this, element, options);
				this._host.initialize(this.cls.classname + "States.Idle");
				this.data = data;
			},
			
			_disable: function () {
				this.stop();
			},
			
			start: function () {
				if (this._enabled)
					this._host.state().next("Pinching");
			},
			
			stop: function () {
				if (this._enabled)
					this._host.state().next("Idle");
			},
			
			__eventData: function () {
				var state = this._host.state();
				return {
					element: this.element(),
					source: this,
					data: this.data,
					initial: state._initial_coords,
					delta_last: state._delta_last
				};
			},
			
			__triggerEvent: function (label) {
				this.trigger(label, this.__eventData());
			}
			
		};
	});
});


Scoped.define("module:Interactions.PinchStates.Idle", ["module:Interactions.State", "module:Events.Mouse"], function (State, MouseEvents, scoped) {
   	return State.extend({scoped: scoped}, {
		
		_white_list: ["Pinching"],
		
		trigger: function (label) {
			this.parent().__triggerEvent(label);
		},
		
		_start: function () {
			this.on(this.element(), "touchstart", function (event) {
				if (!this.parent()._enabled)
					return;
				if (!event.originalEvent.touches || event.originalEvent.touches.length != 2)
					return;
				this.next("Pinching", {
					initial_coords: MouseEvents.clientCoords(event, true)
				});
			});
		}
	
	});
});


Scoped.define("module:Interactions.PinchStates.Pinching", ["module:Interactions.PinchStates.Idle", "module:Events.Mouse"], function (State, MouseEvents, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_white_list: ["Idle"],
			_persistents: ["initial_coords", "current_coords"],
			
			/* Linter */
			_initial_coords: null,
		
			_start: function () {
				this._last_coords = null;
				this._current_coords = this._initial_coords;
				this.trigger("pinchstart");
				this.on(this.element(), "touchmove", function (event) {
					if (!event.originalEvent.touches || event.originalEvent.touches.length != 2) {
						this.next("Idle");
						return;
					}
					this.__pinching(event);
				});
				this.on(this.element(), "touchend", function () {
					this.next("Idle");
				});
			},
			
			_end: function () {
				this.trigger("pinchstop");
				inherited._end.call(this);
			},
			
			__pinching: function (event) {
				event.preventDefault();
				this._last_coords = this._current_coords;
				this._current_coords = MouseEvents.clientCoords(event, true);
				this.__compute_values();
				this.trigger("pinch");
			},
			
			__compute_values: function () {
				var min = function (obj, coord) {
					return obj[0][coord] <= obj[1][coord] ? obj[0][coord] : obj[1][coord];
				};
				var max = function (obj, coord) {
					return obj[0][coord] >= obj[1][coord] ? obj[0][coord] : obj[1][coord];
				};
				this._delta_last = {
					x: min(this._last_coords, "x") - min(this._current_coords, "x") + max(this._current_coords, "x") - max(this._last_coords, "x"),
					y: min(this._last_coords, "y") - min(this._current_coords, "y") + max(this._current_coords, "y") - max(this._last_coords, "y")
				};
			}
			
		};
	});
});
Scoped.define("module:Interactions.Scroll", [
        "module:Interactions.ElementInteraction",
	    "base:Objs",
	    "jquery:",
	    "module:Elements.ElementSupport"
	], function (ElemInter, Objs, $, ElemSupp, scoped) {
	return ElemInter.extend({scoped: scoped}, function (inherited) {
		return {
			
		    constructor: function (element, options, data) {
		    	options = Objs.extend({
		    		discrete: false,
		    		currentCenter: false,
		    		currentTop: true,
		    		scrollEndTimeout: 50,
		    		whitespace: 10000,
		    		display_type: "",
					elementMargin: 20
				}, options);
				inherited.constructor.call(this, element, options);
				this._itemsElement = options.itemsElement || element;
				this._disableScrollCounter = 0;
				this._host.initialize(this.cls.classname + "States.Idle");
				this._scrollingDirection = true;
				this._lastScrollTop = null;
				this.__on(this.element(), "scroll", function () {
					var scrollTop = this.element().scrollTop();
					if (this._lastScrollTop !== null)
						this._scrollingDirection = scrollTop >= this._lastScrollTop;
					this._lastScrollTop = scrollTop;
				});
		    },
		    
		    _whitespaceType: function () {
		        if (this.options().display_type)
		            return this.options().display_type;
		        return this.element().css("display").indexOf('flex') >= 0 ? "flex" : "default";
		    },
		
		    _whitespaceCreate: function () {
		        var whitespace = $("<whitespace></whitespace>");
		        var type = this._whitespaceType();
		
		        if (type == "flex") {
		            whitespace.css("display", "-ms-flexbox");
		            whitespace.css("display", "-webkit-flex");
		            whitespace.css("display", "flex");
		        } else
		            whitespace.css("display", "block");
		
		        return whitespace;
		    },
		
		    _whitespaceGetHeight: function (whitespace) {
		        return whitespace ? parseInt(whitespace.css("height"), 10) : 0;
		    },
		
		    _whitespaceSetHeight: function (whitespace, height) {
		    	if (!whitespace)
		    		return;
		        var type = this._whitespaceType();
		
		        if (type == "flex") {
		            whitespace.css("-webkit-flex", "0 0 " + height + "px");
		            whitespace.css("-ms-flex", "0 0 " + height + "px");
		            whitespace.css("flex", "0 0 " + height + "px");
		        } else
		            whitespace.css("height", height + "px");
		    },
		
		    itemsElement: function () {
		    	return this._itemsElement;
		    },
		    
		    scrollingDirection: function () {
		    	return this._scrollingDirection;
		    },
		    
		    currentElement: function () {
		    	var offset = this.element().offset();
		    	var h = this._options.currentTop ? this._options.elementMargin : (this.element().innerHeight() - 1 - this._options.elementMargin);
		    	var w = this.element().innerWidth() / 2;
		    	var current = $(ElemSupp.elementFromPoint(offset.left + w, offset.top + h));
		    	while (current && current.get(0) && current.parent().get(0) != this.itemsElement().get(0))
		    		current = current.parent();
		    	if (!current || !current.get(0))
		    		return null;
		    	if (!this._options.currentCenter)
		    		return current;    	
		    	if (this._options.currentTop) {
		    		var delta_top = this.element().offset().top - current.offset().top;
		    		if (delta_top > current.outerHeight() / 2)
		    			current = current.next();
		    	} else {
		    		var delta_bottom = this.element().offset().top + h - current.offset().top;
		    		if (delta_bottom < current.outerHeight() / 2)
		    			current = current.prev();
		    	}
		    	return current;
		    },
		    
		    scrollTo: function (position, options) {
		    	var scroll_top = position - (this._options.currentTop ? 0 : (this.element().innerHeight() - 1));
		    	options = options || {};
		    	options.scroll_top = scroll_top;
		    	this._host.state().next("ScrollingTo", options);
		    },
		    
		    scrollToElement: function (element, options) {
		    	var top = element.offset().top - this.element().offset().top + this.element().scrollTop();
		    	this.scrollTo(top + (this._options.currentTop ? 0 : (element.outerHeight() - 1)), options);
		    },
		    
		    disableScroll: function () {
		    	if (this._disableScrollCounter === 0)
		        	this.element().css("overflow", "hidden");
		    	this._disableScrollCounter++;
		    },
		    
		    enableScroll: function () {
		    	this._disableScrollCounter--;
		    	if (this._disableScrollCounter === 0)
		    		this.element().css("overflow", "scroll");
		    },
		    
		    scrolling: function () {
		    	return this._host.state().state_name() != "Idle";
		    }
		    
		};
	});
});


Scoped.define("module:Interactions.ScrollStates.Idle", ["module:Interactions.State"], function (State, scoped) {
	return State.extend({scoped: scoped}, {
		
		itemsElement: function () {
			return this.parent().itemsElement();
		},
		
		_start: function () {
			this.on(this.element(), "scroll", function () {
				this.next("Scrolling");
			});
		}
		
	});
});


Scoped.define("module:Interactions.ScrollStates.Scrolling", ["module:Interactions.ScrollStates.Idle"], function (State, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_start: function () {
				this.__timer = null;
				this.on(this.element(), "scroll", function () {
					this._scroll();
					this.parent().trigger("scroll");
					clearTimeout(this.__timer);
					var opts = this.options();
					var self = this;
					this.__timer = setTimeout(function () {
						self.parent().disableScroll();
						self.parent().trigger("scrollend");
						self._scrollend();
						var current = self.parent().currentElement();
						if (opts.discrete && current)
							self.parent().scrollToElement(current, {
								animate: true,
								abortable: true
							});
						else
							self.eventualNext("Idle");
					}, opts.scrollEndTimeout);
				});
			},
			
			_scroll: function () {
			},
			
			_scrollend: function () {
			},
			
		    _end: function () {
		    	clearTimeout(this.__timer);
				this.parent().enableScroll();
				inherited._end.call(this);
			}
		
		};
	});
});


Scoped.define("module:Interactions.ScrollStates.ScrollingTo", ["module:Interactions.ScrollStates.Idle", "module:Elements.DefaultAnimator"], function (State, Animator, scoped) {
	return State.extend({scoped: scoped}, function (inherited) {
		return {
			
			_locals: ["scroll_top", "animate", "abortable"],
			
			/* Linter */
			_scroll_top: null,
			_abortable: null,
			
			_start: function () {
				if (!this._abortable)
					this.parent().disableScroll();
				this.parent().trigger("scrollto");
				this.on(this.element(), "scroll", function () {
					this._scroll();
				});
				if (this._abortable) {
					this.on(this.element(), "wheel", function () {
						this._moved = true;
						this._abort();
					});
					this.on(this.element(), "touchstart", function () {
						this._moved = true;
						this._abort();
					});
				}
				this.suspend();
				if (this._animate) {
					this._animation = new Animator(
						this.element(),
						{styles: {scrollTop: this._scroll_top}},
						this._finished,
						this);
					this._animation.start();
				} else {
					this.element().scrollTop(this._scroll_top);
					this._finished();
				}
			},
			
			_abort: function () {
				if (this._aborted)
						return;
				this._aborted = true;
				if (this._animate) {
					if (this._animation)
						this._animation.complete();
					this._animation = null;
				} else
					this._finished();
			},
			
			_finished: function () {
				this.parent().trigger("scrolltoend");
				this._scrollend();
				if (this._transitioning)
					this.eventualResume();
				else {
					this.resume();
					this.eventualNext(this._moved ? "Scrolling" : "Idle");
				}
			},
			
			_scroll: function () {		
			},
		
			_scrollend: function () {		
			},
			
		    _transition: function () {
		    	this._abort();
		    },
		
		    _end: function () {
		    	if (!this._abortable)
		    		this.parent().enableScroll();
				inherited._end.call(this);
			}
			
		};
	});
});
Scoped.define("module:Gestures.ElementStateHost", ["base:States.CompetingHost"], function (CompetingHost, scoped) {
	return CompetingHost.extend({scoped: scoped}, function (inherited) {
		return {
		    
		    constructor: function (element, composite) {
		        inherited.constructor.call(this, composite);
		        this._element = element;
		    },
		    
		    element: function () {
		        return this._element;
		    }

		};
	});
});


Scoped.define("module:Gestures.Gesture", [
	    "module:Gestures.ElementStateHost",
	    "module:Hardware.MouseCoords",
	    "base:States.CompetingComposite",
	    "base:Objs"
	], function (ElementStateHost, MouseCoords, CompetingComposite, Objs, scoped) {
	return ElementStateHost.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (element, machine) {
		        var composite = element.data("gestures");
		        if (!composite) {
		            composite = new CompetingComposite();
		            element.data("gestures", composite);
		        }
		        inherited.constructor.call(this, element, composite);
		        MouseCoords.require();
		        for (var key in machine) {
		        	machine[key] = Objs.extend({
		        		priority: 1,
		        		exclusive: false,
		        		retreat: "Retreat"
		        	}, machine[key]);
		        }
		        this.initialize(this.cls.classname + "States.EventDrivenState", {
		            state_descriptor: machine,
		            current_state: "Initial"
		        });
			},
			
			destroy: function () {
		        MouseCoords.unrequire();
		        inherited.destroy.call(this);
			}
	
		};
	});	
});


Scoped.define("module:Gestures.Gesture.ElementState", [
  	    "base:States.CompetingState",
  	    "base:Ids",
  	    "base:Objs"
  	], function (CompetingState, Ids, Objs, scoped) {
  	return CompetingState.extend({scoped: scoped}, function (inherited) {
  		return {

		    _persistents: ["client_pos", "screen_pos"],
		
		    _start: function () {
		    	inherited._start.call(this);
		        this.on("mousemove touchmove", function (event) {
		            var original = event.type == "mousemove" ? event.originalEvent : event.originalEvent.touches[0];
		            this._client_pos = {
		                x: original.clientX,
		                y: original.clientY
		            };
		            this._screen_pos = {
		                x: original.screenX,
		                y: original.screenY
		            };
		        });
		    },
		
		    element: function () {
		        return this.host.element();
		    },
		    
		    on: function (event, func) {
		        var self = this;
		        var events = event.split(" ");
		        Objs.iter(events, function (eventName) {
		            this.element().on(eventName + "." + Ids.objectId(this), function (event) {
		                func.call(self, event);
		            });
		        }, this);
		    },
		    
		    _end: function () {
		        this.element().off("." + Ids.objectId(this));
		    },
		    
		    trigger: function () {
		    	this.host.trigger.apply(this.host, arguments);
		    }
		   
  		};
  	});
});


Scoped.define("module:Gestures.ElementEvent", [
 	    "base:Class",
 	    "base:Ids",
 	    "base:Objs",
 	    "jquery:"
 	], function (Class, Ids, Objs, $, scoped) {
 	return Class.extend({scoped: scoped}, function (inherited) {
 		return {
		    
		    constructor: function (element, callback, context) {
		        inherited.constructor.call(this);
		        this._element = element;
		        this._callback = callback;
		        this._context = context;
		    },
		    
		    callback: function () {
		        if (this._callback)
		            this._callback.apply(this._context, arguments);
		    },
		    
		    on: function (event, func, context, element) {
		        var self = this;
		        var events = event.split(" ");
		        element = element || this._element;
		        Objs.iter(events, function (eventName) {
		            element.on(eventName + "." + Ids.objectId(this), function (event) {
		                func.call(context || self, event);
		            });
		        }, this);
		    },
		
		    destroy: function () {
		        this._element.off("." + Ids.objectId(this));
		        $("body").off("." + Ids.objectId(this));
		        inherited.destroy.call(this);
		    }
		
 		};
 	});
}); 


Scoped.define("module:Gestures.ElementTriggerEvent", ["module:Gestures.ElementEvent"], function (ElementEvent, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (ev, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        this.on(ev, function () {
		            this.callback();
		        });
		    }
		
		};
	});	
});


Scoped.define("module:Gestures.BodyTriggerEvent", ["module:Gestures.ElementEvent", "jquery:"], function (ElementEvent, $, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (ev, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        this.on(ev, function () {
		            this.callback();
		        }, this, $("body"));
		    }
		
		};
	});	
});


Scoped.define("module:Gestures.ElementTimerEvent", ["module:Gestures.ElementEvent"], function (ElementEvent, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {

		    constructor: function (time, element, callback, context) {
		        inherited.constructor.call(this, element, callback, context);
		        var self = this;
		        if (time <= 0)
		        	return;
		        this._timer = setTimeout(function () {
		            self.callback();
		        }, time);
		    },
		    
		    destroy: function () {
		        clearTimeout(this._timer);
		        inherited.destroy.call(this);
		    }		    
		
		};
	});	
});



Scoped.define("module:Gestures.ElementMouseMoveOutEvent", [
        "module:Gestures.ElementEvent",
        "module:Hardware.MouseCoords",
        "module:Events.Mouse"
    ], function (ElementEvent, MouseCoords, MouseEvents, scoped) {
	return ElementEvent.extend({scoped: scoped}, function (inherited) {
		return {
		
		    constructor: function (box, element, callback, context) {
		    	inherited.constructor.call(this, element, callback, context);
		        var position = MouseCoords.coords;
		        var delta = {x: 0, y: 0};
		        this.on(MouseEvents.moveEvent, function (event) {
		        	if (!position.x && !position.y)
		        		position = MouseEvents.pageCoords(event);
		            var current = MouseEvents.pageCoords(event);
		            delta.x = Math.max(delta.x, Math.abs(position.x - current.x));
		            delta.y = Math.max(delta.y, Math.abs(position.y - current.y));
		            if (("x" in box && box.x >= 0 && delta.x >= box.x) || ("y" in box && box.y >= 0 && delta.y >= box.y)) {
		                this.callback();
		            }
		        });
		    }

		};
	});
});


Scoped.define("module:Gestures.GestureStates.EventDrivenState", [
       "module:Gestures.Gesture.ElementState",
       "module:Gestures"
   ], function (ElementState, Gestures, scoped) {
	return ElementState.extend({scoped: scoped}, function (inherited) {
		return {
		
		    _persistents: ["client_pos", "screen_pos", "state_descriptor"],
		    _locals: ["current_state"],
		    
		    /* Defining for linter */
		    _state_descriptor: null,
		    _current_state: null,
		    
		    current_state: function () {
		        return this._state_descriptor[this._current_state];
		    },
		    
		    description: function () {
		        return this._current_state;
		    },
		    
		    nextDrivenState: function (state) {
		        this.next("EventDrivenState", {current_state: state});
		    },
		
		    _start: function () {
		    	inherited._start.call(this);
		        var state = this.current_state();
		        if (state.start)
		            state.start.apply(this);
		        state.events = state.events || [];
	            var helper = function (event) {
	                this._auto_destroy(new Gestures[event.event](event.args, this.element(), function () {
	                    this.nextDrivenState(event.target);
	                }, this));
	            };
		        for (var i = 0; i < state.events.length; ++i)
		            helper.call(this, state.events[i]);
		    },
		    
		    _end: function () {
		        var state = this.current_state();
		        if (state.end)
		            state.end.apply(this);
		        inherited._end.call(this);
		    },
		    
		    can_coexist_with: function (foreign_state) {
		        return !this.current_state().exclusive && !foreign_state.current_state().exclusive;
		    },
		    
		    can_prevail_against: function (foreign_state) {
		        return this.current_state().priority > foreign_state.current_state().priority;
		    },
		    
		    retreat_against: function (foreign_state) {
		        this.nextDrivenState(this.current_state().retreat);
		    }  
		    
		};
	});  
});



Scoped.define("module:Gestures.defaultGesture", [
        "base:Objs",
        "module:Events.Mouse"
    ], function (Objs, MouseEvents) {
	return function (options) {
	    options = Objs.extend({
	    	mouse_up_activate: false,
	        wait_time: 750,
	        wait_activate: true,
	        disable_x: 10,
	        disable_y: 10,
	        enable_x: -1,
	        enable_y: -1,
	        active_priority: 2
	    }, options);
	    return {
	        "Initial": {
	            events: [{
	                event: "ElementTriggerEvent",
	                args: MouseEvents.downEvent,
	                target: "DownState"
	            }]
	        },
	        "Retreat": {
	            start: function () {
	            	this.trigger("deactivate");
	            	this.nextDrivenState("Initial");
	            }
	        },
	        "DownState": {
	            events: [{
	                event: "BodyTriggerEvent",
	                args: MouseEvents.upEvent,
	                target: options.mouse_up_activate ? "ActiveState" : "Initial"
	            }, {
	                event: "ElementMouseMoveOutEvent",
	                args: {x: options.disable_x, y: options.disable_y},
	                target: "Initial"
	            }, {
	                event: "ElementMouseMoveOutEvent",
	                args: {x: options.enable_x, y: options.enable_y},
	                target: "ActiveState"
	            }, {
	                event: "ElementTimerEvent",
	                args: options.wait_time,
	                target: options.wait_activate ? "ActiveState" : "Initial"
	            }]
	        },
	        "ActiveState": {
	            priority: options.active_priority,
	            exclusive: true,
	            start: function () {
	            	this.trigger("activate");
	            	this.nextDrivenState("Initial");
	            }
	        }
	    };
	};
});
}).call(Scoped);