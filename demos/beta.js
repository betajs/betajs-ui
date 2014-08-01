/*!
  betajs - v0.0.2 - 2014-08-01
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.2 - 2014-08-01
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
/*!
  betajs - v0.0.2 - 2014-08-01
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
var BetaJS = BetaJS || {};
/*
 * Export for NodeJS
 */
if (typeof module != "undefined" && "exports" in module)
	module.exports = BetaJS;

/** @class */
BetaJS.Types = {
	
    /** Returns whether argument is an object
     * 
     * @param x argument
     * @return true if x is an object
     */
	is_object: function (x) {
		return typeof x == "object";
	},
	
    /** Returns whether argument is an array
     * 
     * @param x argument
     * @return true if x is an array
     */
	is_array: function (x) {
		return Object.prototype.toString.call(x) === '[object Array]';
	},
	
    /** Returns whether argument is undefined (which is different from being null)
     * 
     * @param x argument
     * @return true if x is undefined
     */
	is_undefined: function (x) {
		return typeof x == "undefined";		
	},
	
    /** Returns whether argument is null (which is different from being undefined)
     * 
     * @param x argument
     * @return true if x is null
     */
	is_null: function (x) {
		return x === null;
	},
	
    /** Returns whether argument is undefined or null
     * 
     * @param x argument
     * @return true if x is undefined or null
     */
	is_none: function (x) {
		return this.is_undefined(x) || this.is_null(x);
	},
	
    /** Returns whether argument is defined (could be null)
     * 
     * @param x argument
     * @return true if x is defined
     */
	is_defined: function (x) {
		return typeof x != "undefined";
	},
	
    /** Returns whether argument is empty (undefined, null, an empty array or an empty object)
     * 
     * @param x argument
     * @return true if x is empty
     */
	is_empty: function (x) {
		if (this.is_none(x)) 
			return true;
		if (this.is_array(x))
			return x.length === 0;
		if (this.is_object(x)) {
			for (var key in x)
				return false;
			return true;
		}
		return false; 
	},
	
    /** Returns whether argument is a string
     * 
     * @param x argument
     * @return true if x is a a string
     */
	is_string: function (x) {
		return typeof x == "string";
	},
	
    /** Returns whether argument is a function
     * 
     * @param x argument
     * @return true if x is a function
     */
	is_function: function (x) {
		return typeof x == "function";
	},
	
    /** Returns whether argument is boolean
     * 
     * @param x argument
     * @return true if x is boolean
     */
	is_boolean: function (x) {
		return typeof x == "boolean";
	},
	
    /** Compares two values
     * 
     * If values are booleans, we compare them directly.
     * If values are arrays, we compare them recursively by their components.
     * Otherwise, we use localeCompare which compares strings.
     * 
     * @param x left value
     * @param y right value
     * @return 1 if x > y, -1 if x < y and 0 if x == y
     */
	compare: function (x, y) {
		if (BetaJS.Types.is_boolean(x) && BetaJS.Types.is_boolean(y))
			return x == y ? 0 : (x ? 1 : -1);
		if (BetaJS.Types.is_array(x) && BetaJS.Types.is_array(y)) {
			var len_x = x.length;
			var len_y = y.length;
			var len = Math.min(len_x, len_y);
			for (var i = 0; i < len; ++i) {
				var c = this.compare(x[i], y[i]);
				if (c !== 0)
					return c;
			}
			return len_x == len_y ? 0 : (len_x > len_y ? 1 : -1);
		}
		return x.localeCompare(y);			
	},
	
    /** Parses a boolean string
     * 
     * @param x boolean as a string
     * @return boolean value
     */	
	parseBool: function (x) {
		if (this.is_boolean(x))
			return x;
		if (x == "true")
			return true;
		if (x == "false")
			return false;
		return null;
	},
	
    /** Returns the type of a given expression
     * 
     * @param x expression
     * @return type string
     */	
	type_of: function (x) {
		if (this.is_array(x))
			return "array";
		return typeof x;
	}

};

/** @class */
BetaJS.Strings = {

	/** Converts a string new lines to html <br /> tags
	 *
	 * @param s string
	 * @return string with new lines replaced by <br />
	 */
	nl2br : function(s) {
		return (s + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
	},

	/** Converts special characters in a string to html entitiy symbols
	 *
	 * @param s string
	 * @return converted string
	 */
	htmlentities : function(s) {
		return (s + "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
	},

	JS_ESCAPES : {
		"'" : "'",
		'\\' : '\\',
		'\r' : 'r',
		'\n' : 'n',
		'\t' : 't',
		'\u2028' : 'u2028',
		'\u2029' : 'u2029'
	},

	JS_ESCAPER_REGEX : function() {
		if (!this.JS_ESCAPER_REGEX_CACHED)
			this.JS_ESCAPER_REGEX_CACHED = new RegExp(BetaJS.Objs.keys(this.JS_ESCAPES).join("|"), 'g');
		return this.JS_ESCAPER_REGEX_CACHED;
	},

	/** Converts string such that it can be used in javascript by escaping special symbols
	 *
	 * @param s string
	 * @return escaped string
	 */
	js_escape : function(s) {
		var self = this;
		return s.replace(this.JS_ESCAPER_REGEX(), function(match) {
			return '\\' + self.JS_ESCAPES[match];
		});
	},

	/** Determines whether a string starts with a sub string
	 *
	 * @param s string in question
	 * @param needle sub string
	 * @return true if string in question starts with sub string
	 */
	starts_with : function(s, needle) {
		return s.substring(0, needle.length) == needle;
	},

	/** Determines whether a string ends with a sub string
	 *
	 * @param s string in question
	 * @param needle sub string
	 * @return true if string in question ends with sub string
	 */
	ends_with : function(s, needle) {
		return s.indexOf(needle, s.length - needle.length) !== -1;
	},

	/** Removes sub string from a string if string starts with sub string
	 *
	 * @param s string in question
	 * @param needle sub string
	 * @return string without sub string if it starts with sub string otherwise it returns the original string
	 */
	strip_start : function(s, needle) {
		return this.starts_with(s, needle) ? s.substring(needle.length) : s;
	},

	/** Returns the complete remaining part of a string after a the last occurrence of a sub string
	 *
	 * @param s string in question
	 * @param needle sub string
	 * @return remaining part of the string in question after the last occurrence of the sub string
	 */
	last_after : function(s, needle) {
		return s.substring(s.lastIndexOf(needle) + needle.length, s.length);
	},

	EMAIL_ADDRESS_REGEX : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

	/** Determines whether a string is a syntactically valid email address
	 *
	 * @param s string in question
	 * @return true if string looks like an email address
	 */
	is_email_address : function(s) {
		return this.EMAIL_ADDRESS_REGEX.test(s);
	},

	STRIP_HTML_TAGS : ["script", "style", "head"],
	STRIP_HTML_REGEX : /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi,
	STRIP_HTML_COMMENT_REGEX : /<![^>]*>/gi,

	/** Removes all html from data and returns plain text
	 *
	 * @param html string containing html
	 * @return string containing the plain text part of it
	 */
	strip_html : function(html) {
		var result = html;
		for ( i = 0; i < this.STRIP_HTML_TAGS.length; ++i)
			result = result.replace(new RegExp("<" + this.STRIP_HTML_TAGS[i] + ".*</" + this.STRIP_HTML_TAGS[i] + ">", "i"), '');
		result = result.replace(this.STRIP_HTML_REGEX, '').replace(this.STRIP_HTML_COMMENT_REGEX, '');
		return result;
	},

	/** Trims all trailing and leading whitespace and removes block indentations
	 *
	 * @param s string
	 * @return string with trimmed whitespaces and removed block indentation
	 */
	nltrim : function(s) {
		var a = s.replace(/\t/g, "  ").split("\n");
		var len = null;
		var i = 0;
		for ( i = 0; i < a.length; ++i) {
			var j = 0;
			while (j < a[i].length) {
				if (a[i].charAt(j) != ' ')
					break;
				++j;
			}
			if (j < a[i].length)
				len = len === null ? j : Math.min(j, len);
		}
		for ( i = 0; i < a.length; ++i)
			a[i] = a[i].substring(len);
		return a.join("\n").trim();
	},

	read_cookie_string : function(raw, key) {
		var cookie = "; " + raw;
		var parts = cookie.split("; " + key + "=");
		if (parts.length == 2)
			return parts.pop().split(";").shift();
		return null;
	},

	write_cookie_string : function(raw, key, value) {
		var cookie = "; " + raw;
		var parts = cookie.split("; " + key + "=");
		if (parts.length == 2)
			cookie = parts[0] + parts[1].substring(parts[1].indexOf(";"));
		return key + "=" + value + cookie;
	},

	capitalize : function(input) {
		return input.replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	},

	email_get_name : function(input) {
	    input = input || "";
		var temp = input.split("<");
		input = temp[0].trim();
		if (!input && temp.length > 1) {
			temp = temp[1].split(">");
			input = temp[0].trim();
		}		
		input = input.replace(/['"]/g, "").replace(/[\\._@]/g, " ");
		return this.capitalize(input);
	},

	email_get_email : function(input) {
        input = input || "";
		var temp = input.split("<");
		input = temp[0].trim();
		if (temp.length > 1) {
			temp = temp[1].split(">");
			input = temp[0].trim();
		}
		input = input.replace(/'/g, "").replace(/"/g, "").trim();
		return input;
	},

	email_get_salutatory_name : function(input) {
        input = input || "";
		return (this.email_get_name(input).split(" "))[0];
	}
};

/** @class */
BetaJS.Functions = {
	
    /** Takes a function and an instance and returns the method call as a function
     * 
     * @param func function
     * @param instance instance
     * @return method call 
     */
	as_method: function (func, instance) {
		return function() {
			return func.apply(instance, arguments);
		};
	},
	
    /** Takes a function and returns a function that calls the original function on the first call and returns the return value on all subsequent call. In other words a lazy function cache.
     * 
     * @param func function
     * @return cached function 
     */
	once: function (func) {
		var result = false;
		var executed = false;
		return function () {
			if (executed)
				return result;
			executed = true;
			result = func.apply(this, arguments);
			func = null;
			return result;
		};
	},
	
    /** Converts some other function's arguments to an array
     * 
     * @param func function arguments
     * @param slice number of arguments to be omitted (default: 0)
     * @return arguments as array 
     */	
	getArguments: function (args, slice) {
		return Array.prototype.slice.call(args, slice || 0);
	},
	
    /** Matches functions arguments against some pattern
     * 
     * @param args function arguments
     * @param pattern typed pattern
     * @return matched arguments as associative array 
     */	
	matchArgs: function (args, pattern) {
		var i = 0;
		var result = {};
		for (var key in pattern) {
			if (pattern[key] === true || BetaJS.Types.type_of(args[i]) == pattern[key]) {
				result[key] = args[i];
				i++;
			}
		}
		return result;
	}
	
};

/** @class */
BetaJS.SyncAsync = {
	
	eventually: function (func, params, context) {
		var timer = setTimeout(function () {
			clearTimeout(timer);
			func.apply(context || this, params || []);
		}, 0);
	},
	
    /** Converts a synchronous function to an asynchronous one and calls it
     * 
     * @param callbacks callbacks object with success and exception
     * @param syncCall the synchronous function
     * @param params optional syncCall params
     * @param context optional object context
     */	
	syncToAsync: function (callbacks, syncCall) {
		var args = BetaJS.Functions.matchArgs(BetaJS.Functions.getArguments(arguments, 2), {
			params: "array",
			context: "object"
		});
		try {
			if (callbacks && callbacks.success)
				callbacks.success.call(callbacks.context || this, syncCall.apply(args.context || this, args.params || []));
		} catch (e) {
			if (callbacks && callbacks.exception)
				callbacks.exception.call(callbacks.context || this, e);
		}
	},
	
    /** Either calls a synchronous or asynchronous function depending on whether preferSync is given
     * 
     * @param callbacks callbacks object with success and exception (or null)
     * @param preferSync prefer synchronous call?
     * @param syncCall the synchronous function
     * @param asyncCall the asynchronous function
     * @param params optional syncCall params
     * @param context optional object context
     * @return the function return data
     */	
	either: function (callbacks, preferSync, syncCall, asyncCall) {
		var args = BetaJS.Functions.matchArgs(BetaJS.Functions.getArguments(arguments, 4), {
			params: "array",
			context: "object"
		});
		if (callbacks && !preferSync && !callbacks.sync) {
			var params = args.params || [];
			params.push(callbacks); 
			asyncCall.apply(args.context || this, params);
			return null;
		} else
			return this.eitherSync(callbacks, syncCall, args.params, args.context);
	},
	
	eitherSync: function (callbacks, syncCall) {
		var args = BetaJS.Functions.matchArgs(BetaJS.Functions.getArguments(arguments, 2), {
			params: "array",
			context: "object"
		});
		var context = args.context || this;
		var params = args.params || [];
		if (callbacks)
			this.syncToAsync(callbacks, syncCall, params, context);
		else
			return syncCall.apply(context, params);
		return null;
	},
	
	SYNC: 1,
	ASYNC: 2,
	ASYNCSINGLE: 3,
	
	toCallbackType: function (callbacks, type) {
		if (type == this.ASYNCSINGLE)
			return function (err, result) {
                var caller = err ? "exception" : "success";
                if (caller in callbacks)
                    callbacks[caller].call(callbacks.context || this, err ? err : result);
			};
		return callbacks;
	},
	
	then: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: "function",
			exception: "function"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (!callbacks || callbacks.sync ? this.SYNC : this.ASYNC);
		var success_ctx = args.success_ctx || func_ctx;
		var success = args.success;
		var exception = args.exception;
		if (type != this.SYNC) {			
			params.push(this.toCallbackType({
				context: callbacks.context,
				success: success ? function (ret) {
					success.call(success_ctx, ret, callbacks);
				} : callbacks.success,
				exception: exception ? function (error) {
					exception.call(success_ctx, error, callbacks);
				} : callbacks.exception
			}, type));
			func.apply(func_ctx, params);
		} else if (callbacks) {
			try {
				if (success)
					success.call(success_ctx, func.apply(func_ctx, params), callbacks);
				else
					callbacks.success.call(callbacks.context || this, func.apply(func_ctx, params));
			} catch (e) {
				if (exception)
					exception.call(success_ctx, e, callbacks);
				else if (callbacks.exception)
					callbacks.exception.call(callbacks.context || this, e);
				else
					throw e;
			}
		} else {
			try {
				var ret = func.apply(func_ctx, params);
				if (success)
					success.call(success_ctx, ret, {
						sync: true,
						success: function (retv) {
							ret = retv;
						},
						exception: function (err) {
							throw err;
						}
					});
				return ret;
			} catch (e) {
				if (exception) {
					exception.call(success_ctx, e, {
						sync: true,
						success: function (retv) {
							ret = retv;
						},
						exception: function (err) {
							throw err;
						}
					});
					return ret;
				} else
					throw e;
			}
		}
		return null;
	},
	
	PROMISE_LAZY: 1,
	PROMISE_ACTIVE: 2,
	PROMISE_SUCCESS: 3,
	PROMISE_EXCEPTION: 4,

	lazy: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number"
		});
		return {
			state: this.PROMISE_LAZY,
			func_ctx: args.func_ctx || this,
			func: args.func,
			params: args.params || [],
			type: args.type || this.ASYNC
		};
	},
	
	promise: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var type = args.type || this.ASYNC;
		if (type == this.SYNC) {
			try {
				return {
					state: this.PROMISE_SUCCESS,
					result: func.apply(func_ctx, params)
				};
			} catch (e) {
				return {
					state: this.PROMISE_EXCEPTION,
					exception: e
				};
			}
		} else {
			var promise = {
				state: this.PROMISE_ACTIVE,
				listeners: []
			};
			params.push({
				context: promise,
				success: function (result) {
					this.state = BetaJS.SyncAsync.PROMISE_SUCCESS;
					this.result = result;
					for (var i = 0; i < this.listeners.length; ++i)
						this.listeners[i].success.call(this.listeners[i].context || this, result);
				},
				exception: function (error) {
					this.state = BetaJS.SyncAsync.PROMISE_EXCEPTION;
					this.exception = error;
					for (var i = 0; i < this.listeners.length; ++i)
						this.listeners[i].exception.call(this.listeners[i].context || this, error);
				}
			});
			func.apply(func_ctx, params);
			return promise;
		}
	},
	
	reveal: function (promise, callbacks) {
		if (promise.state == this.PROMISE_LAZY) {
			var promise_temp = this.promise(promise.func_ctx, promise.func, promise.params, promise.type);
			for (var key in promise_temp)
				promise[key] = promise_temp[key];
		}
		if (promise.state == this.PROMISE_ACTIVE)
			promise.listeners.push(callbacks);
		else if (promise.state == this.PROMISE_SUCCESS)
			callbacks.success.call(callbacks.context || this, promise.result);
		else if (promise.state == this.PROMISE_EXCEPTION)
			callbacks.exception.call(callbacks.context || this, promise.exception);
	},
	
	join: function (promises, callbacks) {
		var monitor = {
			count: promises.length,
			exception: false,
			results: []
		};
		for (var i = 0; i < promises.length; ++i) {
			monitor.results.push(null);
			this.reveal(promises[i], {
				context: {
					monitor: monitor,
					index: i
				},
				sync: callbacks && callbacks.sync,
				success: function (result) {
					this.monitor.count = this.monitor.count - 1;
					if (this.monitor.exception)
						return;
					this.monitor.results[this.index] = result;
					if (this.monitor.count <= 0) {
						if (callbacks)
							callbacks.success.apply(callbacks.context || this, this.monitor.results);
					}
				},
				exception: function (error) {
					this.monitor.count = this.monitor.count - 1;
					if (this.monitor.exception)
						return;
					this.monitor.exception = true;
					if (callbacks)
						callbacks.exception.apply(callbacks.context || this, error);
					else
						throw error;
				}
			});
		}
		return monitor.results;
	},
	
	mapSuccess: function (callbacks, success) {
		var obj = BetaJS.Objs.clone(callbacks, 1);
		obj.success = success;
		return obj;
	},
	
	mapException: function (callbacks, exception) {
		var obj = BetaJS.Objs.clone(callbacks, 1);
		obj.exception = exception;
		return obj;
	},

	callback: function (callbacks, type) {
		if (!callbacks || (type != "success" && type != "exception"))
			return;
		var context = callbacks.context || this;
		var params = BetaJS.Functions.getArguments(arguments, 2);
		if (type in callbacks)
			callbacks[type].apply(context, params);
		if ("complete" in callbacks)
			callbacks.complete.apply(context);
	}
	
};



BetaJS.SyncAsync.SyncAsyncMixin = {
	
	supportsSync: function () {
		return this._supportsSync;
	},
	
	supportsAsync: function () {
		return this._supportsAsync;
	},
	
	eitherSync: function (callbacks, syncFunc, params) {
		return BetaJS.SyncAsync.eitherSync(callbacks, syncFunc, params || [], this);
	},
		
	either: function (callbacks, syncFunc, asyncFunc, preferSync, params) {
		if (BetaJS.Types.is_undefined(preferSync))
			preferSync = !this.supportsAsync();
		return BetaJS.SyncAsync.either(callbacks, preferSync, syncFunc, asyncFunc, params || [], this);
	},
	
	eitherSyncFactory: function (property, callbacks, syncFunc, params) {
		return BetaJS.SyncAsync.eitherSync(callbacks, function () {
			if (!this[property])
				this[property] = syncFunc.apply(this, params);
			return this[property];				
		}, this);
	},

	eitherAsyncFactory: function (property, callbacks, asyncFunc, params) {
		var ctx = this;
		return this.either(callbacks, function () {
			return ctx[property];				
		}, function () {
			asyncFunc.call(this, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				ctx[property] = result;
				ctx.callback(callbacks, "success", result);
			}));
		}, property in this, this);
	},

	eitherFactory: function (property, callbacks, syncFunc, asyncFunc, params) {
		var ctx = this;
		return this.either(callbacks, function () {
			if (!this[property])
				this[property] = syncFunc.apply(this, params);
			return this[property];				
		}, function () {
			asyncFunc.call(this, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				ctx[property] = result;
				callbacks.success.call(this, result);
			}));
		}, this[property] || !this.supportsAsync());
	},
	
	then: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: true,
			exception: "function"
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (!callbacks || !this.supportsAsync() ? BetaJS.SyncAsync.SYNC : BetaJS.SyncAsync.ASYNC);
		var success_ctx = args.success_ctx || this;
		return BetaJS.SyncAsync.then(func_ctx, func, params, type, callbacks, success_ctx, args.success, args.exception);
	},
	
	thenSingle: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number",
			callbacks: true,
			success_ctx: "object",
			success: true
		});
		var func_ctx = args.func_ctx || this;
		var func = args.func;
		var params = args.params || [];
		var callbacks = args.callbacks;
		var type = args.type || (!callbacks || !this.supportsAsync() ? BetaJS.SyncAsync.SYNC : BetaJS.SyncAsync.ASYNCSINGLE);
		var success_ctx = args.success_ctx || this;
		var success = args.success;
		return BetaJS.SyncAsync.then(func_ctx, func, params, type, callbacks, success_ctx, success);
	},
	
	promise: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			type: "number"
		});
		return BetaJS.SyncAsync.promise(args.func_ctx || this, args.func, args.params || [], args.type);
	},
	
	join: function (promises, callbacks) {
		return BetaJS.SyncAsync.join(promises, callbacks);
	},
	
	delegate: function () {
		var args = BetaJS.Functions.matchArgs(arguments, {
			func_ctx: "object",
			func: true,
			params: "array",
			callbacks: "object"
		});
		var ctx = args.func_ctx || this;
		var params = args.params || [];
		if (args.callbacks) {
			if (this.supportsAsync() && !args.callbacks.sync) {
				params.push(args.callbacks);
				return args.func.apply(ctx, params);
			} else
				return BetaJS.SyncAsync.syncToAsync(args.callbacks, args.func, params, ctx);
		} else
			return args.func.apply(ctx, params);
	},
	
	callback: function () {
		return BetaJS.SyncAsync.callback.apply(this, arguments);
	}
	
};


/** @class */
BetaJS.Scopes = {
	
	/** Takes a string and returns the global object associated with it by name.
     * 
     * @param s string (example: "BetaJS")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example: BetaJS object)
     */
	base: function (s, base, initialize) {
		if (!BetaJS.Types.is_string(s))
			return s;
		if (base)
			return base[s];
		try {
			if (window && window[s])
				return window[s];
		} catch (e) {}
		try {
			if (global && global[s])
				return global[s];
		} catch (e) {}
		try {
			if (module && module.exports)
				return module.exports;
		} catch (e) {}
		if (!initialize)
		    return null;
        try {
            if (window) {
                window[s] = {};
                return window[s];
            }
        } catch (e) {}
        try {
            if (global) {
                global[s] = {};
                return global[s];
            }
        } catch (e) {}
        try {
            if (module && module.exports) {
                module.exports = {};
                return module.exports;
            }
        } catch (e) {}
        return null;
	},
	
	/** Takes an object address string and returns the object associated with it.
     * 
     * @param s string (example: "BetaJS.Strings")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example BetaJS.Strings object)
     */
	resolve: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base);
		for (var i = 1; i < a.length; ++i)
			object = object[a[i]];
		return object;
	},
	
	/** Takes an object address string and returns the object associated with it.
	 *  If the address does not exist, it will be created.
     * 
     * @param s string (example: "BetaJS.Strings.FooBar")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example BetaJS.Strings.FooBar object)
     */
	touch: function (s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");		
		var object = this.base(a[0], base, true);
		for (var i = 1; i < a.length; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		return object;
	},
	
	/** Takes an object address string and overwrites it by a given object.
	 *  If the address does not exist, it will be created.
     * 
     * @param obj object (example: {test: "foobar"})
     * @param s string (example: "BetaJS.Strings.FooBar")
     * @param base a global namespace base (optional, will autodetect the right one if not provided)
     * @return global object (example BetaJS.Strings.FooBar object)
     */
	set: function (obj, s, base) {
		if (!BetaJS.Types.is_string(s))
			return s;
		var a = s.split(".");			
		var object = this.base(a[0], base, true);
		for (var i = 1; i < a.length - 1; ++i) {
			if (!(a[i] in object))
				object[a[i]] = {};
			object = object[a[i]];
		}
		if (a.length > 1)
			object[a[a.length - 1]] = obj;
		return obj;
	}
	
};

/** @class */
BetaJS.Ids = {
	
	__uniqueId: 0,
	
    /** Returns a unique identifier
     * 
     * @param prefix a prefix string for the identifier (optional)
     * @return unique identifier
     */
	uniqueId: function (prefix) {
		return (prefix || "") + (this.__uniqueId++);
	},
	
    /** Returns the object's unique identifier or sets it
     * 
     * @param object the object
     * @param id (optional)
     * @return object's unique identifier
     */
	objectId: function (object, id) {
		if (typeof id != "undefined")
			object.__cid = id;
		else if (!object.__cid)
			object.__cid = this.uniqueId("cid_");
		return object.__cid;
	}
	
};
/** @class */
BetaJS.Tokens = {
	
    /** Returns a new token
     * 
     * @param length optional length of token, default is 16
     * @return token
     */
	generate_token: function (length) {
		length = length || 16;
		var s = "";
		while (s.length < length)
			s += Math.random().toString(36).substr(2); 
		return s.substr(0, length);
	}
	
};
BetaJS.Objs = {
	
	count: function (obj) {
		if (BetaJS.Types.is_array(obj))
			return obj.length;
		else {
			var c = 0;
			for (var key in obj)
				c++;
			return c;
		}
	},
	
	clone: function (item, depth) {
		if (!depth || depth <= 0)
			return item;
		if (BetaJS.Types.is_array(item))
			return item.slice(0);
		else if (BetaJS.Types.is_object(item))
			return this.extend({}, item, depth-1);
		else
			return item;
	},
	
	acyclic_clone: function (object, def) {
		if (object === null || ! BetaJS.Types.is_object(object))
			return object;
		var s = "__acyclic_cloned";
		if (object[s])
			return def || "CYCLE";
		object[s] = true;
		var result = {};
		for (var key in object) {
			if (key != s)
				result[key] = this.acyclic_clone(object[key], def);
		}
		delete object[s];
		return result;
	},
	
	extend: function (target, source, depth) {
		target = target || {};
		if (source) {
			for (var key in source)
				target[key] = this.clone(source[key], depth);
		}
		return target;
	},
	
	merge: function (secondary, primary, options) {
		secondary = secondary || {};
		primary = primary || {};
		var result = {};
		var keys = BetaJS.Objs.extend(BetaJS.Objs.keys(secondary, true), BetaJS.Objs.keys(primary, true));
		for (var key in keys) {
			var opt = key in options ? options[key] : "primary";
			if (opt == "primary" || opt == "secondary") {
				if (key in primary || key in secondary) {
					if (opt == "primary")
						result[key] = key in primary ? primary[key] : secondary[key];
					else
						result[key] = key in secondary ? secondary[key] : primary[key];
				}			
			}
			else if (BetaJS.Types.is_function(opt))
				result[key] = opt(secondary[key], primary[key]);
			else if (BetaJS.Types.is_object(opt))
				result[key] = BetaJS.Objs.merge(secondary[key], primary[key], opt);
		}
		return result;
	},
	
	tree_merge: function (secondary, primary) {
		secondary = secondary || {};
		primary = primary || {};
		var result = {};
		var keys = BetaJS.Objs.extend(BetaJS.Objs.keys(secondary, true), BetaJS.Objs.keys(primary, true));
		for (var key in keys) {
			if (BetaJS.Types.is_object(primary[key]) && secondary[key])
				result[key] = BetaJS.Objs.tree_merge(secondary[key], primary[key]);
			else
				result[key] = key in primary ? primary[key] : secondary[key];
		}
		return result;
	},

	keys: function(obj, mapped) {
		var result = null;
		var key = null;
		if (BetaJS.Types.is_undefined(mapped)) {
			result = [];
			for (key in obj)
				result.push(key);
			return result;
		} else {
			result = {};
			for (key in obj)
				result[key] = mapped;
			return result;
		}
	},
	
	map: function (obj, f, context) {
		var result = null;
		if (BetaJS.Types.is_array(obj)) {
			result = [];
			for (var i = 0; i < obj.length; ++i)
				result.push(context ? f.apply(context, [obj[i], i]) : f(obj[i], i));
			return result;
		} else {
			result = {};
			for (var key in obj)
				result[key] = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
			return result;
		}
	},
	
	values: function (obj) {
		var result = [];
		for (var key in obj)
			result.push(obj[key]);
		return result;
	},
	
	filter: function (obj, f, context) {
		var ret = null;
		if (BetaJS.Types.is_array(obj)) {
			ret = [];
			for (var i = 0; i < obj.length; ++i) {
				if (context ? f.apply(context, [obj[i], i]) : f(obj[i], i))
					ret.push(obj[i]);
			}
			return ret;
		} else {
			ret = {};
			for (var key in obj) {
				if (context ? f.apply(context, [obj[key], key]) : f(obj[key], key))
					ret[key] = obj[key];
			}
			return ret;
		}
	},
	
	equals: function (obj1, obj2, depth) {
		var key = null;
		if (depth && depth > 0) {
			for (key in obj1) {
				if (!key in obj2 || !this.equals(obj1[key], obj2[key], depth-1))
					return false;
			}
			for (key in obj2) {
				if (!key in obj1)
					return false;
			}
			return true;
		} else
			return obj1 == obj2;
	},
	
	iter: function (obj, f, context) {
		var result = null;
		if (BetaJS.Types.is_array(obj)) {
			for (var i = 0; i < obj.length; ++i) {
				result = context ? f.apply(context, [obj[i], i]) : f(obj[i], i);
				if (BetaJS.Types.is_defined(result) && !result)
					return false;
			}
		} else {
			for (var key in obj) {
				result = context ? f.apply(context, [obj[key], key]) : f(obj[key], key);
				if (BetaJS.Types.is_defined(result) && !result)
					return false;
			}
		}
		return true;
	},
	
	intersect: function (a, b) {
		var c = {};
		for (var key in a) {
			if (key in b)
				c[key] = a[key];
		}
		return c;
	},
	
	contains_key: function (obj, key) {
		if (BetaJS.Types.is_array(obj))
			return BetaJS.Types.is_defined(obj[key]);
		else
			return key in obj;
	},
	
	contains_value: function (obj, value) {
		if (BetaJS.Types.is_array(obj)) {
			for (var i = 0; i < obj.length; ++i) {
				if (obj[i] === value)
					return true;
			}
		} else {
			for (var key in obj) {
				if (obj[key] === value)
					return true;
			}
		}
		return false;
	},
	
	exists: function (obj, f, context) {
		var success = false;
		BetaJS.Objs.iter(obj, function () {
			success = success || f.apply(this, arguments);
			return !success;
		}, context);
		return success;
	},
	
	all: function (obj, f, context) {
		var success = true;
		BetaJS.Objs.iter(obj, function () {
			success = success && f.apply(this, arguments);
			return success;
		}, context);
		return success;
	},
	
	objectify: function (arr, f, context) {
		var result = {};
		var is_function = BetaJS.Types.is_function(f);
		if (BetaJS.Types.is_undefined(f))
			f = true;
		for (var i = 0; i < arr.length; ++i)
			result[arr[i]] = is_function ? f.apply(context || this, [arr[i], i]) : f;
		return result;
	},
	
	peek: function (obj) {
		if (BetaJS.Types.is_array(obj))
			return obj.length > 0 ? obj[0] : null;
		else {
			for (var key in obj)
				return obj[key];
			return null;
		} 
	},
	
	poll: function (obj) {
		if (BetaJS.Types.is_array(obj))
			return obj.shift();
		else {
			for (var key in obj) {
				var item = obj[key];
				delete obj[key];
				return item;
			}
			return null;
		} 
	},
	
	objectBy: function () {
		var obj = {};
		var count = arguments.length / 2;
		for (var i = 0; i < count; ++i)
			obj[arguments[2 * i]] = arguments[2 * i + 1];
		return obj;
	},
	
	valueByIndex: function (obj, idx) {
		idx = idx || 0;
		if (BetaJS.Types.is_array(obj))
			return obj[idx];
		for (var key in obj) {
			if (idx === 0)
				return obj[key];
			idx--;
		}
		return null;
	},
	
	keyByIndex: function (obj, idx) {
		idx = idx || 0;
		if (BetaJS.Types.is_array(obj))
			return idx;
		for (var key in obj) {
			if (idx === 0)
				return key;
			idx--;
		}
		return null;
	}

};

BetaJS.Class = function () {};

BetaJS.Class.classname = "Class";

BetaJS.Class.extend = function (classname, objects, statics, class_statics) {
	objects = objects || [];
	if (!BetaJS.Types.is_array(objects))
		objects = [objects];
	statics = statics || [];
	if (!BetaJS.Types.is_array(statics))
		statics = [statics];
	class_statics = class_statics || [];
	if (!BetaJS.Types.is_array(class_statics))
		class_statics = [class_statics];
	
	var parent = this;
	
	var result;
	
	// Setup JavaScript Constructor
	BetaJS.Objs.iter(objects, function (obj) {
		if (obj.hasOwnProperty("constructor"))
			result = obj.constructor;
	});
	var has_constructor = BetaJS.Types.is_defined(result);
	if (!BetaJS.Types.is_defined(result))
		result = function () { parent.apply(this, arguments); };

	// Add Parent Statics
	BetaJS.Objs.extend(result, parent);

	// Add External Statics
	BetaJS.Objs.iter(statics, function (stat) {
		BetaJS.Objs.extend(result, stat);
	});
	
	
	// Add Class Statics
	var class_statics_keys = {};
	if (parent.__class_statics_keys) {
		for (var key in parent.__class_statics_keys) 
			result[key] = BetaJS.Objs.clone(parent[key], 1);
	}
	BetaJS.Objs.iter(class_statics, function (stat) {
		BetaJS.Objs.extend(result, stat);
		BetaJS.Objs.extend(class_statics_keys, BetaJS.Objs.keys(stat, true));
	});
	if (parent.__class_statics_keys)
		BetaJS.Objs.extend(class_statics_keys, parent.__class_statics_keys);
	result.__class_statics_keys = class_statics_keys;
	
	// Parent & Children Hierarchy
	result.parent = parent;
	result.children = [];
	result.extend = this.extend;
	if (!parent.children)
		parent.children = [];
	parent.children.push(result);
	
	// Setup Prototype
	var ctor = function () {};
	ctor.prototype = parent.prototype;
	result.prototype = new ctor();

	// ClassNames
	result.prototype.cls = result;
	result.classname = classname;
	
	// Enforce ClassName in namespace
	if (classname)
		BetaJS.Scopes.set(result, classname);
	
	// Setup Prototype
	result.__notifications = {};
	
	if (parent.__notifications)
		BetaJS.Objs.extend(result.__notifications, parent.__notifications, 1);		

	BetaJS.Objs.iter(objects, function (object) {
		BetaJS.Objs.extend(result.prototype, object);

		// Note: Required for Internet Explorer
		if ("constructor" in object)
			result.prototype.constructor = object.constructor;

		if (object._notifications) {
			for (var key in object._notifications) {
				if (!result.__notifications[key])
					result.__notifications[key] = [];
				result.__notifications[key].push(object._notifications[key]);
			}
		}
	});	
	delete result.prototype._notifications;

	if (!has_constructor)
		result.prototype.constructor = parent.prototype.constructor;
		
	return result; 
};



BetaJS.Class.prototype.constructor = function () {
	this._notify("construct");
};

BetaJS.Class.prototype.as_method = function (s) {
	return BetaJS.Functions.as_method(this[s], this);
};

BetaJS.Class.prototype._auto_destroy = function (obj) {
	if (!this.__auto_destroy_list)
		this.__auto_destroy_list = [];
	var target = obj;
	if (!BetaJS.Types.is_array(target))
	   target = [target];
	for (var i = 0; i < target.length; ++i)
	   this.__auto_destroy_list.push(target[i]);
	return obj;
};

BetaJS.Class.prototype._notify = function (name) {
	if (!this.cls.__notifications)
		return;
	var rest = Array.prototype.slice.call(arguments, 1);
	var table = this.cls.__notifications[name];
	if (table) {
		for (var i in table) {
			var method = BetaJS.Types.is_function(table[i]) ? table[i] : this[table[i]];
			if (!method)
				throw this.cls.classname  + ": Could not find " + name + " notification handler " + table[i];
			method.apply(this, rest);
		}
	}
};

BetaJS.Class.prototype.destroy = function () {
	this._notify("destroy");
	if (this.__auto_destroy_list) {
		for (var i = 0; i < this.__auto_destroy_list.length; ++i) {
			if ("destroy" in this.__auto_destroy_list[i])
				this.__auto_destroy_list[i].destroy();
		}
	}
	for (var key in this)
		delete this[key];
};

BetaJS.Class.prototype._inherited = function (cls, func) {
	return cls.parent.prototype[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
};

BetaJS.Class._inherited = function (cls, func) {
	return cls.parent[func].apply(this, Array.prototype.slice.apply(arguments, [2]));
};

BetaJS.Class.prototype.instance_of = function (cls) {
	return this.cls.ancestor_of(cls);
};

BetaJS.Class.ancestor_of = function (cls) {
	return (this == cls) || (this != BetaJS.Class && this.parent.ancestor_of(cls));
};

BetaJS.Class.prototype.cid = function () {
	return BetaJS.Ids.objectId(this);
};



BetaJS.Class.prototype.cls = BetaJS.Class;

BetaJS.Class.__notifications = {};

BetaJS.Class.is_class_instance = function (object) {
	return object && BetaJS.Types.is_object(object) && ("_inherited" in object) && ("cls" in object);
};


BetaJS.Exceptions = {
	
	ensure: function (e) {
		if (e && BetaJS.Types.is_object(e) && ("instance_of" in e) && (e.instance_of(BetaJS.Exceptions.Exception)))
			return e;
		return new BetaJS.Exceptions.NativeException(e);
	}
	
};


BetaJS.Class.extend("BetaJS.Exceptions.Exception", {
	
	constructor: function (message) {
		this._inherited(BetaJS.Exceptions.Exception, "constructor");
		this.__message = message;
	},
	
	assert: function (exception_class) {
		if (!this.instance_of(exception_class))
			throw this;
		return this;
	},
	
	callstack: function () {
		var callstack = [];
		var current = arguments.callee.caller;
		while (current) {
			callstack.push(current.toString());
			current = current.caller;
		}
		return callstack;
	},
	
	callstack_to_string: function () {
		return this.callstack().join("\n");
	},
	
	message: function () {
		return this.__message;
	},
	
	toString: function () {
		return this.message();
	},
	
	format: function () {
		return this.cls.classname + ": " + this.toString() + "\n\nCall Stack:\n" + this.callstack_to_string();
	},
	
	json: function () {
		return {
			classname: this.cls.classname,
			message: this.message()
		};
	}
	
}, {
	
	ensure: function (e) {
		e = BetaJS.Exceptions.ensure(e);
		e.assert(this);
		return e;
	}
	
});


BetaJS.Exceptions.Exception.extend("BetaJS.Exceptions.NativeException", {
	
	constructor: function (object) {
		this._inherited(BetaJS.Exceptions.NativeException, "constructor", object ? ("toString" in object ? object.toString() : object) : "null");
		this.__object = object;
	},
	
	object: function () {
		return this.__object;
	}
	
});

BetaJS.Class.extend("BetaJS.Lists.AbstractList", {
	
	_add: function (object) {},
	_remove: function (ident) {},
	_get: function (ident) {},
	_iterate: function (callback, context) {},
	
	get_ident: function (object) {
		var ident = null;
		this._iterate(function (obj, id) {
			if (obj == object) {
				ident = id;
				return false;
			}
			return true;	
		});
		return ident;
	},
	
	exists: function (object) {
		return object && this.get_ident(object) !== null;
	},
	
	_ident_changed: function (object, new_ident) {},
	
	constructor: function (objects) {
		this._inherited(BetaJS.Lists.AbstractList, "constructor");
		this.__count = 0;
		if (objects)
			BetaJS.Objs.iter(objects, function (object) {
				this.add(object);
			}, this);
	},
	
	add: function (object) {
		var ident = this._add(object);
		if (BetaJS.Types.is_defined(ident))
			this.__count++;
		return ident;
	},
	
	count: function () {
		return this.__count;
	},
	
	clear: function () {
		this._iterate(function (object, ident) {
			this.remove_by_ident(ident);
			return true;
		}, this);
	},
	
	remove_by_ident: function (ident) {
		var ret = this._remove(ident);
		if (BetaJS.Types.is_defined(ret))
			this.__count--;
		return ret;
	},
	
	remove: function (object) {
		return this.remove_by_ident(this.get_ident(object));
	},
	
	remove_by_filter: function (filter) {
		this._iterate(function (object, ident) {
			if (filter(object))
				this.remove_by_ident(ident);
			return true;
		}, this);
	},
	
	get: function (ident) {
		return this._get(ident);
	},
	
	iterate: function (cb, context) {
		this._iterate(function (object, ident) {
			var ret = cb.apply(this, [object, ident]);
			return BetaJS.Types.is_defined(ret) ? ret : true;
		}, context);
	},
	
	iterator: function () {
		return BetaJS.Iterators.ArrayIterator.byIterate(this.iterate, this);
	}

});

BetaJS.Lists.AbstractList.extend("BetaJS.Lists.LinkedList", {
	
	constructor: function (objects) {
		this.__first = null;
		this.__last = null;
		this._inherited(BetaJS.Lists.LinkedList, "constructor", objects);
	},
	
	_add: function (obj) {
		this.__last = {
			obj: obj,
			prev: this.__last,
			next: null
		};
		if (this.__first)
			this.__last.prev.next = this.__last;
		else
			this.__first = this.__last;
		return this.__last;
	},
	
	_remove: function (container) {
		if (container.next)
			container.next.prev = container.prev;
		else
			this.__last = container.prev;
		if (container.prev)
			container.prev.next = container.next;
		else
			this.__first = container.next;
		return container.obj;
	},
	
	_get: function (container) {
		return container.obj;
	},
	
	_iterate: function (cb, context) {
		var current = this.__first;
		while (current) {
			var prev = current;
			current = current.next;
			if (!cb.apply(context || this, [prev.obj, prev]))
				return;
		}
	}
});


BetaJS.Lists.AbstractList.extend("BetaJS.Lists.ObjectIdList",  {
	
	constructor: function (objects, id_generator) {
		this.__map = {};
		this.__id_generator = id_generator;
		this._inherited(BetaJS.Lists.ObjectIdList, "constructor", objects);
	},

	_add: function (object) {
	    while (true) {
	        var id = object.__cid;
	        if (!id) {
                id = this.__id_generator ? BetaJS.Ids.objectId(object, this.__id_generator()) : BetaJS.Ids.objectId(object);
        		if (this.__map[id] && this.__id_generator)
        		  continue;
            }
    		this.__map[id] = object;
    		return id;
    	}
    	return null;
	},
	
	_remove: function (ident) {
		var obj = this.__map[ident];
		delete this.__map[ident];
		return obj;
	},
	
	_get: function (ident) {
		return this.__map[ident];
	},
	
	_iterate: function (callback, context) {
		for (var key in this.__map)
			callback.apply(context || this, [this.__map[key], key]);
	},
	
	get_ident: function (object) {
		var ident = BetaJS.Ids.objectId(object);
		return this.__map[ident] ? ident : null;
	}
	
});



BetaJS.Lists.AbstractList.extend("BetaJS.Lists.ArrayList", {
	
	constructor: function (objects, options) {
		this.__idToIndex = {};
		this.__items = [];
		options = options || {};
		if ("compare" in options)
			this._compare = options["compare"];
		this._inherited(BetaJS.Lists.ArrayList, "constructor", objects);
	},
	
	set_compare: function (compare) {
		this._compare = compare;
		if (compare)
			this.sort();
	},
	
	get_compare: function () {
		return this._compare;
	},
	
	sort: function (compare) {
		compare = compare || this._compare;
		if (!compare)
			return;
		this.__items.sort(compare);
		for (var i = 0; i < this.__items.length; ++i)
			this.__ident_changed(this.__items[i], i);
		this._sorted();
	},
	
	_sorted: function () {},
		
	re_index: function (index) {
		if (!this._compare)
			return index;
		var last = this.__items.length - 1;
		var object = this.__items[index];
		var i = index;	
		while (i < last && this._compare(this.__items[i], this.__items[i + 1]) > 0) {
			this.__items[i] = this.__items[i + 1];
			this.__ident_changed(this.__items[i], i);
			this.__items[i + 1] = object;
			++i;
		}
		if (i == index) {
			while (i > 0 && this._compare(this.__items[i], this.__items[i - 1]) < 0) {
				this.__items[i] = this.__items[i - 1];
				this.__ident_changed(this.__items[i], i);
				this.__items[i - 1] = object;
				--i;
			}
		}
		if (i != index) {
			this.__ident_changed(object, i);
			this._re_indexed(object);
		}
		return i;
	},
	
	_re_indexed: function (object) {},
	
	_add: function (object) {
		var last = this.__items.length;
		this.__items.push(object);
		var i = this.re_index(last);
		this.__idToIndex[BetaJS.Ids.objectId(object)] = i;
		return i;
	},
	
	_remove: function (ident) {
		var obj = this.__items[ident];
		for (var i = ident + 1; i < this.__items.length; ++i) {
			this.__items[i-1] = this.__items[i];
			this.__ident_changed(this.__items[i-1], i-1);
		}
		this.__items.pop();
		delete this.__idToIndex[BetaJS.Ids.objectId(obj)];
		return obj;
	},
	
	_get: function (ident) {
		return this.__items[ident];
	},
	
	_iterate: function (callback, context) {
		var items = BetaJS.Objs.clone(this.__items, 1);
		for (var i = 0; i < items.length; ++i)
			callback.apply(context || this, [items[i], this.get_ident(items[i])]);
	},

	__ident_changed: function (object, index) {
		this.__idToIndex[BetaJS.Ids.objectId(object)] = index;
		this._ident_changed(object, index);
	},

	get_ident: function (object) {
		var id = BetaJS.Ids.objectId(object);
		return id in this.__idToIndex ? this.__idToIndex[id] : null;
	},
	
	ident_by_id: function (id) {
		return this.__idToIndex[id];
	}

});
BetaJS.Iterators = {
	
	ensure: function (mixed) {
		if (mixed === null)
			return new BetaJS.Iterators.ArrayIterator([]);
		if (mixed.instance_of(BetaJS.Iterators.Iterator))
			return mixed;
		if (BetaJS.Types.is_array(mixed))
			return new BetaJS.Iterators.ArrayIterator(mixed);
		return new BetaJS.Iterators.ArrayIterator([mixed]);
	}
	
};

BetaJS.Class.extend("BetaJS.Iterators.Iterator", {
	
	asArray: function () {
		var arr = [];
		while (this.hasNext())
			arr.push(this.next());
		return arr;
	},
	
	asArrayDelegate: function (f) {
		var arr = [];
		while (this.hasNext()) {
			var obj = this.next();			
			arr.push(obj[f].apply(obj, BetaJS.Functions.getArguments(arguments, 1)));
		}
		return arr;
	},
	
	iterate: function (callback, context) {
		while (this.hasNext())
			callback.call(context || this, this.next());
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.ArrayIterator", {
	
	constructor: function (arr) {
		this._inherited(BetaJS.Iterators.ArrayIterator, "constructor");
		this.__array = arr;
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__array.length;
	},
	
	next: function () {
		var ret = this.__array[this.__i];
		this.__i++;
		return ret;
	}
	
}, {
	
	byIterate: function (iterate_func, iterate_func_ctx) {
		var result = [];
		iterate_func.call(iterate_func_ctx || this, function (item) {
			result.push(item);
		}, this);
		return new this(result);
	}
	
});

BetaJS.Iterators.ArrayIterator.extend("BetaJS.Iterators.ObjectKeysIterator", {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Iterators.ObjectKeysIterator, "constructor", BetaJS.Objs.keys(obj));
	}
	
});

BetaJS.Iterators.ArrayIterator.extend("BetaJS.Iterators.ObjectValuesIterator", {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Iterators.ObjectValuesIterator, "constructor", BetaJS.Objs.values(obj));
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.MappedIterator", {
	
	constructor: function (iterator, map, context) {
		this._inherited(BetaJS.Iterators.MappedIterator, "constructor");
		this.__iterator = iterator;
		this.__map = map;
		this.__context = context || this;
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.hasNext() ? this.__map.call(this.__context, this.__iterator.next()) : null;
	}
	
});

BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.FilteredIterator", {
	
	constructor: function (iterator, filter, context) {
		this._inherited(BetaJS.Iterators.FilteredIterator, "constructor");
		this.__iterator = iterator;
		this.__filter = filter;
		this.__context = context || this;
		this.__next = null;
	},
	
	hasNext: function () {
		this.__crawl();
		return this.__next !== null;
	},
	
	next: function () {
		this.__crawl();
		var item = this.__next;
		this.__next = null;
		return item;
	},
	
	__crawl: function () {
		while (!this.__next && this.__iterator.hasNext()) {
			var item = this.__iterator.next();
			if (this.__filter_func(item))
				this.__next = item;
		}
	},
	
	__filter_func: function (item) {
		return this.__filter.apply(this.__context, [item]);
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.SkipIterator", {
	
	constructor: function (iterator, skip) {
		this._inherited(BetaJS.Iterators.SkipIterator, "constructor");
		this.__iterator = iterator;
		while (skip > 0) {
			iterator.next();
			skip--;
		}
	},
	
	hasNext: function () {
		return this.__iterator.hasNext();
	},
	
	next: function () {
		return this.__iterator.next();
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.LimitIterator", {
	
	constructor: function (iterator, limit) {
		this._inherited(BetaJS.Iterators.LimitIterator, "constructor");
		this.__iterator = iterator;
		this.__limit = limit;
	},
	
	hasNext: function () {
		return this.__limit > 0 && this.__iterator.hasNext();
	},
	
	next: function () {
		if (this.__limit <= 0)
			return null;
		this.__limit--;
		return this.__iterator.next();
	}

});


BetaJS.Iterators.Iterator.extend("BetaJS.Iterators.SortedIterator", {
	
	constructor: function (iterator, compare) {
		this._inherited(BetaJS.Iterators.SortedIterator, "constructor");
		this.__array = iterator.asArray();
		this.__array.sort(compare);
		this.__i = 0;
	},
	
	hasNext: function () {
		return this.__i < this.__array.length;
	},
	
	next: function () {
		var ret = this.__array[this.__i];
		this.__i++;
		return ret;
	}
	
});

BetaJS.Events = {};

BetaJS.Events.EVENT_SPLITTER = /\s+/;

BetaJS.Events.EventsMixin = {
	
	__create_event_object: function (callback, context, options) {
		options = options || {};
		var obj = {
			callback: callback,
			context: context
		};
		if (options.eventually)
			obj.eventually = options.eventually;
		if (options.min_delay)
			obj.min_delay = new BetaJS.Timers.Timer({
				delay: options.min_delay,
				once: true,
				start: false,
				context: this,
				fire: function () {
					if (obj.max_delay)
						obj.max_delay.stop();
					obj.callback.apply(obj.context || this, obj.params);
				}
			});
		if (options.max_delay)
			obj.max_delay = new BetaJS.Timers.Timer({
				delay: options.max_delay,
				once: true,
				start: false,
				context: this,
				fire: function () {
					if (obj.min_delay)
						obj.min_delay.stop();
					obj.callback.apply(obj.context || this, obj.params);
				}
			});
		return obj;
	},
	
	__destroy_event_object: function (object) {
		if (object.min_delay)
			object.min_delay.destroy();
		if (object.max_delay)
			object.max_delay.destroy();
	},
	
	__call_event_object: function (object, params) {
		if (object.min_delay)
			object.min_delay.restart();
		if (object.max_delay)
			object.max_delay.start();
		if (!object.min_delay && !object.max_delay) {
			if (object.eventually)
				BetaJS.SyncAsync.eventually(object.callback, params, object.context || this);
			else
				object.callback.apply(object.context || this, params);
		} else
			object.params = params;
	},
	
	on: function(events, callback, context, options) {
		this.__events_mixin_events = this.__events_mixin_events || {};
		events = events.split(BetaJS.Events.EVENT_SPLITTER);
		var event;
		while (true) {
			event = events.shift();
			if (!event)
				break;
			this.__events_mixin_events[event] = this.__events_mixin_events[event] || new BetaJS.Lists.LinkedList();
			this.__events_mixin_events[event].add(this.__create_event_object(callback, context, options));
		}
		return this;
	},
	
	off: function(events, callback, context) {
		this.__events_mixin_events = this.__events_mixin_events || {};
		if (events) {
			events = events.split(BetaJS.Events.EVENT_SPLITTER);
			var event;
			while (true) {
				event = events.shift();
				if (!event)
					break;
				if (this.__events_mixin_events[event]) {
					this.__events_mixin_events[event].remove_by_filter(function (object) {
						var result = (!callback || object.callback == callback) && (!context || object.context == context);
						if (result && this.__destroy_event_object)
							this.__destroy_event_object(object);
						return result;
					});
					if (this.__events_mixin_events[event].count() === 0) {
						this.__events_mixin_events[event].destroy();
						delete this.__events_mixin_events[event];
					}
				}
			}
		} else {
			for (event in this.__events_mixin_events) {
				this.__events_mixin_events[event].remove_by_filter(function (object) {
					var result = (!callback || object.callback == callback) && (!context || object.context == context);
					if (result && this.__destroy_event_object)
						this.__destroy_event_object(object);
					return result;
				});
				if (this.__events_mixin_events[event].count() === 0) {
					this.__events_mixin_events[event].destroy();
					delete this.__events_mixin_events[event];
				}
			}
		}
		return this;
	},
	
	triggerAsync: function () {
		var self = this;
		var args = BetaJS.Functions.getArguments(arguments);
		var timeout = setTimeout(function () {
			clearTimeout(timeout);
			self.trigger.apply(self, args);
		}, 0);
	},

    trigger: function(events) {
    	var self = this;
    	events = events.split(BetaJS.Events.EVENT_SPLITTER);
    	var rest = BetaJS.Functions.getArguments(arguments, 1);
		var event;
		if (!this.__events_mixin_events)
			return this;
		while (true) {
			event = events.shift();
			if (!event)
				break;
    		if (this.__events_mixin_events[event])
    			this.__events_mixin_events[event].iterate(function (object) {
    				self.__call_event_object(object, rest);
    			});
			if (this.__events_mixin_events && "all" in this.__events_mixin_events)
				this.__events_mixin_events["all"].iterate(function (object) {
					self.__call_event_object(object, [event].concat(rest));
				});
		}
    	return this;
    },
    
    once: function (events, callback, context, options) {
        var self = this;
        var once = BetaJS.Functions.once(function() {
          self.off(events, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context, options);
    },
    
    delegateEvents: function (events, source, prefix, params) {
    	params = params || []; 
    	prefix = prefix ? prefix + ":" : "";
    	if (events === null) {
    		source.on("all", function (event) {
				var rest = BetaJS.Functions.getArguments(arguments, 1);
				this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
    		}, this);
    	} else {
    		if (!BetaJS.Types.is_array(events))
    			events = [events];
	   		BetaJS.Objs.iter(events, function (event) {
				source.on(event, function () {
					var rest = BetaJS.Functions.getArguments(arguments);
					this.trigger.apply(this, [prefix + event].concat(params).concat(rest));
				}, this);
			}, this);
		}
    }
	
};

BetaJS.Class.extend("BetaJS.Events.Events", BetaJS.Events.EventsMixin);



BetaJS.Events.ListenMixin = {
		
	_notifications: {
		"destroy": "listenOff" 
	},
		
	listenOn: function (target, events, callback, options) {
		if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
		this.__listen_mixin_listen[BetaJS.Ids.objectId(target)] = target;
		target.on(events, callback, this, options);
	},
	
	listenOnce: function (target, events, callback, options) {
		if (!this.__listen_mixin_listen) this.__listen_mixin_listen = {};
		this.__listen_mixin_listen[BetaJS.Ids.objectId(target)] = target;
		target.once(events, callback, this, options);
	},
	
	listenOff: function (target, events, callback) {
		if (!this.__listen_mixin_listen)
			return;
		if (target) {
			target.off(events, callback, this);
			if (!events && !callback)
				delete this.__listen_mixin_listen[BetaJS.Ids.objectId(target)];
		}
		else
			BetaJS.Objs.iter(this.__listen_mixin_listen, function (obj) {
				obj.off(events, callback, this);
				if (!events && !callback)
					delete this.__listen_mixin_listen[BetaJS.Ids.objectId(obj)];
			}, this);
	}
	
};

BetaJS.Class.extend("BetaJS.Events.Listen", BetaJS.Events.ListenMixin);

BetaJS.Classes = {};

BetaJS.Classes.InvokerMixin = {

	invoke_delegate : function(invoker, members) {
		if (!BetaJS.Types.is_array(members))
			members = [members];
		invoker = this[invoker];
		var self = this;
		for (var i = 0; i < members.length; ++i) {
			var member = members[i];
			this[member] = function(member) {
				return function() {
					var args = BetaJS.Functions.getArguments(arguments);
					args.unshift(member);
					return invoker.apply(self, args);
				};
			}.call(self, member);
		}
	}
};

BetaJS.Classes.AutoDestroyMixin = {

	_notifications : {
		construct : "__initialize_auto_destroy",
		destroy : "__finalize_auto_destroy"
	},

	__initialize_auto_destroy : function() {
		this.__auto_destroy = {};
	},

	__finalize_auto_destroy : function() {
		var copy = this.__auto_destroy;
		this.__auto_destroy = {};
		BetaJS.Objs.iter(copy, function(object) {
			object.unregister(this);
		}, this);
	},

	register_auto_destroy : function(object) {
		if (object.cid() in this.__auto_destroy)
			return;
		this.__auto_destroy[object.cid()] = object;
		object.register(this);
		this._notify("register_auto_destroy", object);
	},

	unregister_auto_destroy : function(object) {
		if (!(object.cid() in this.__auto_destroy))
			return;
		this._notify("unregister_auto_destroy", object);
		delete this.__auto_destroy[object.cid()];
		object.unregister(this);
		if (BetaJS.Types.is_empty(this.__auto_destroy))
			this.destroy();
	}
};

BetaJS.Class.extend("BetaJS.Classes.AutoDestroyObject", {

	constructor : function() {
		this._inherited(BetaJS.Classes.AutoDestroyObject, "constructor");
		this.__objects = {};
	},

	register : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if ( id in this.__objects)
			return;
		this.__objects[id] = object;
		object.register_auto_destroy(this);
	},

	unregister : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if (!( id in this.__objects))
			return;
		delete this.__objects[id];
		object.unregister_auto_destroy(this);
	},

	clear : function() {
		BetaJS.Objs.iter(this.__objects, function(object) {
			this.unregister(object);
		}, this);
	}
});

BetaJS.Class.extend("BetaJS.Classes.ObjectCache", [BetaJS.Events.EventsMixin, {

	constructor : function(options) {
		this._inherited(BetaJS.Classes.ObjectCache, "constructor");
		this.__size = "size" in options ? options.size : null;
		this.__destroy_on_remove = "destroy_on_remove" in options ? options.destroy_on_remove : true;
		this.__id_to_container = {};
		this.__first = null;
		this.__last = null;
		this.__count = 0;
	},

	destroy : function() {
		this.clear();
		this._inherited(BetaJS.Classes.ObjectCache, "destroy");
	},

	add : function(object) {
		if (this.get(object))
			return;
		if (this.__size !== null && this.__count >= this.__size && this.__first)
			this.remove(this.__first.object);
		var container = {
			object : object,
			prev : this.__last,
			next : null
		};
		this.__id_to_container[BetaJS.Ids.objectId(object)] = container;
		if (this.__first)
			this.__last.next = container;
		else
			this.__first = container;
		this.__last = container;
		this.__count++;
		this.trigger("cache", object);
	},

	remove : function(id) {
		if (BetaJS.Class.is_class_instance(id))
			id = BetaJS.Ids.objectId(id);
		var container = this.__id_to_container[id];
		if (!container)
			return;
		delete this.__id_to_container[id];
		if (container.next)
			container.next.prev = container.prev;
		else
			this.__last = container.prev;
		if (container.prev)
			container.prev.next = container.next;
		else
			this.__first = container.next;
		this.__count--;
		this.trigger("release", container.object);
		if (this.__destroy_on_remove)
			container.object.destroy();
	},

	get : function(id) {
		if (BetaJS.Class.is_class_instance(id))
			id = BetaJS.Ids.objectId(id);
		return this.__id_to_container[id] ? this.__id_to_container[id].object : null;
	},

	clear : function() {
		BetaJS.Objs.iter(this.__id_to_container, function(container) {
			this.remove(container.object);
		}, this);
	}
}]);

BetaJS.Classes.ModuleMixin = {

	_notifications : {
		construct : function() {
			this.__modules = {};
		},
		destroy : function() {
			BetaJS.Objs.iter(this.__modules, this.remove_module, this);
		}
	},

	add_module : function(module) {
		if (module.cid() in this.__modules)
			return;
		this.__modules[module.cid()] = module;
		module.register(this);
		this._notify("add_module", module);
	},

	remove_module : function(module) {
		if (!(module.cid() in this.__modules))
			return;
		delete this.__modules[module.cid()];
		module.unregister(this);
		this._notify("remove_module", module);
	}
};

BetaJS.Class.extend("BetaJS.Classes.Module", {

	constructor : function(options) {
		this._inherited(BetaJS.Classes.Module, "constructor");
		this._objects = {};
		this.__auto_destroy = "auto_destroy" in options ? options.auto_destroy : true;
	},

	destroy : function() {
		BetaJS.Objs.iter(this._objects, this.unregister, this);
		this._inherited(BetaJS.Classes.Module, "destroy");
	},

	register : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if ( id in this._objects)
			return;
		var data = {};
		this._objects[id] = {
			object : object,
			data : data
		};
		object.add_module(this);
		this._register(object, data);
	},

	_register : function(object) {
	},

	unregister : function(object) {
		var id = BetaJS.Ids.objectId(object);
		if (!( id in this._objects))
			return;
		var data = this._objects[id].data;
		this._unregister(object, data);
		delete this._objects[id];
		object.remove_module(this);
		if ("off" in object)
			object.off(null, null, this);
		if (this.__auto_destroy && BetaJS.Types.is_empty(this._objects))
			this.destroy();
	},

	_unregister : function(object) {
	},

	_data : function(object) {
		return this._objects[BetaJS.Ids.objectId(object)].data;
	}
}, {

	__instance : null,

	singleton : function() {
		if (!this.__instance)
			this.__instance = new this({
				auto_destroy : false
			});
		return this.__instance;
	}
});


BetaJS.Classes.ObjectIdMixin = {

    _notifications: {
        construct: "__register_object_id",
        destroy: "__unregister_object_id"
    },

    __object_id_scope: function () {
        if (this.object_id_scope)
            return this.object_id_scope;
        if (!BetaJS.Classes.ObjectIdScope)
            BetaJS.Classes.ObjectIdScope = BetaJS.Objs.clone(BetaJS.Classes.ObjectIdScopeMixin, 1);
        return BetaJS.Classes.ObjectIdScope;
    },

    __register_object_id: function () {
        var scope = this.__object_id_scope();
        scope.__objects[BetaJS.Ids.objectId(this)] = this;
    },

    __unregister_object_id: function () {
        var scope = this.__object_id_scope();
        delete scope.__objects[BetaJS.Ids.objectId(this)];
    }

};

BetaJS.Classes.ObjectIdScopeMixin = {

    __objects: {},

    get: function (id) {
        return this.__objects[id];
    }

};
BetaJS.Properties = {};


BetaJS.Properties.TYPE_VALUE = 0;
BetaJS.Properties.TYPE_BINDING = 1;
BetaJS.Properties.TYPE_COMPUTED = 2;



BetaJS.Properties.PropertiesMixin = {
    
    raw_get: function (key) {
        return key in this.__properties ? this.__properties[key].value : null;    
    },
	
	get: function (key) {
	    keys = key.split(".");
	    var value = this.raw_get(keys[0]);
	    for (var i = 1; i < keys.length; ++i) {
	       if (value && BetaJS.Types.is_object(value))
	           value = value[keys[i]];
	       else
	           return null;
	    }
		return value;
	},
	
	_canSet: function (key, value) {
		return true;
	},
	
	_beforeSet: function (key, value) {
		return value;
	},
	
	_afterSet: function (key, value, options) {
	},
	
	has: function (key) {
		return key in this.__properties;
	},
	
	setAll: function (obj, options) {
		for (var key in obj)
			this.set(key, obj[key], options);
	},
	
	keys: function (mapped) {
		return BetaJS.Objs.keys(this.__properties, mapped);
	},
	
	binding: function (key) {
		return {
			type: BetaJS.Properties.TYPE_BINDING,
			bindee: this,
			property: key
		};
	},
	
	computed : function (f, dependencies) {
		return {
			type: BetaJS.Properties.TYPE_COMPUTED,
			func: f,
			dependencies: dependencies || []
		};
	},
	
	_isBinding: function (object) {
		return BetaJS.Types.is_object(object) && object && object.type && object.type == BetaJS.Properties.TYPE_BINDING && object.bindee && object.property;
	},
	
	_isComputed: function (object) {
		return BetaJS.Types.is_object(object) && object && object.type && object.type == BetaJS.Properties.TYPE_COMPUTED && object.func && object.dependencies;
	},
		
	getAll: function () {
		var obj = {};
		for (var key in this.__properties)
			obj[key] = this.get(key);
		return obj;
	},
	
	unset: function (key) {
		if (key in this.__properties) {
			var entry = this.__properties[key];
			if (entry.type == BetaJS.Properties.TYPE_BINDING) {
				entry.bindee.off("change:" + entry.property, null, this.__properties[key]);
			} else if (entry.type == BetaJS.Properties.TYPE_COMPUTED) {
				var self = this;
				BetaJS.Objs.iter(entry.dependencies, function (dep) {
					if (this._isBinding(dep))
						dep.bindee.off("change:" + dep.property, null, this.__properties[key]);
					else if (this._isTimer(dep))
						entry.timers[dep].destroy();
					else
						self.off("change:" + dep, null, this.__properties[key]);
				}, this);
			}
			this.trigger("unset", key);
			this.trigger("unset:" + key);
			delete this.__properties[key];
		}
	},
	
	_set_changed: function (key, old_value, options) {
		this._afterSet(key, this.get(key), old_value, options);
		this.trigger("change", key, this.get(key), old_value, options);
		this.trigger("change:" + key, this.get(key), old_value, options);
	},
	
	_isTimer: function (dep) {
		return BetaJS.Strings.starts_with("dep", "timer:");
	},
	
	_parseTimer: function (dep) {
		return parseInt(BetaJS.Strings.strip_start("timer:"), 10);
	},
	
	set: function (key, value, options) {
	    var keys = key.split(".");
	    if (keys.length < 2) {
	        this.raw_set(key, value, options);
	    } else {
    	    var obj = this.raw_get(key, obj);
    	    if (!obj) {
    	        obj = {};
    	        this.raw_set(key, obj, options);
    	    }
    	    for (var i = 2; i < keys.length - 1; ++i) {
    	        obj[keys[i]] = obj[keys[i]] || {};
    	        obj = obj[keys[i]];
    	    }
    	    var old_value = obj[keys[keys.length - 1]];
    	    obj[keys[keys.length - 1]] = value;
    	    if (old_value != value) {
                this.trigger("change", key, value, old_value);
                this.trigger("change:" + key.replace(".", "->"), value, old_value);
            }
        }
	},
	
	raw_set: function (key, value, options) {
		var old = this.get(key);
		if (old == value)
			return; 
		var self = this;
		var entry = this.__properties[key];
		if (this._isBinding(value)) {
			this.unset(key);
			this.__properties[key] = {
				type: BetaJS.Properties.TYPE_BINDING,
				bindee: value.bindee,
				property: value.property,
				value: value.bindee.get(value.property)
			};
			value.bindee.on("change:" + value.property, function () {
				var old = self.__properties[key].value;
				self.__properties[key].value = value.bindee.get(value.property);
				self._set_changed(key, old);
			}, this.__properties[key]);
			this._set_changed(key, old, options);
		} else if (this._isComputed(value)) {
			this.unset(key);
			this.__properties[key] = {
				type: BetaJS.Properties.TYPE_COMPUTED,
				func: value.func,
				dependencies: value.dependencies,
				value: value.func.apply(self),
				timers: {}
			};
			BetaJS.Objs.iter(value.dependencies, function (dep) {
				if (this._isBinding(dep))
					dep.bindee.on("change:" + dep.property, function () {
						var old = self.__properties[key].value;
						self.__properties[key].value = value.func.apply(self);
						self._set_changed(key, old);
					}, this.__properties[key]);
				else if (this._isTimer(dep)) {
					this.__properties[key].timers[dep] = new BetaJS.Timers.Timer({
						delay: this._parseTimer(dep),
						fire: function () {
							var old = self.__properties[key].value;
							self.__properties[key].value = value.func.apply(self);
							self._set_changed(key, old);
						}
					});
				} else
					self.on("change:" + dep, function () {
						var old = self.__properties[key].value;
						self.__properties[key].value = value.func.apply(self);
						self._set_changed(key, old);
					}, this.__properties[key]);
			}, this);
			this._set_changed(key, old);
		} else {
			value = this._beforeSet(key, value);
			if (this._canSet(key, value)) {
				if (this.__properties[key] && this.__properties[key].type == BetaJS.Properties.TYPE_BINDING) {
					this.__properties[key].bindee.set(this.__properties[key].property, value);
				} else {
					this.unset(key);
					this.__properties[key] = {
						type: BetaJS.Properties.TYPE_VALUE,
						value: value
					};
					this._set_changed(key, old, options);
				}
			}
		}
	},
	
	_notifications: {
		"construct": "__properties_construct",
		"destroy": "__properties_destroy"
	},
	
	__properties_construct: function () {
		this.__properties = {};
	},
	
	__properties_destroy: function () {
		for (var key in this.__properties) 
			this.unset(key);
		this.trigger("destroy");
	}
	
};

BetaJS.Class.extend("BetaJS.Properties.Properties", [
	BetaJS.Events.EventsMixin,
	BetaJS.Properties.PropertiesMixin, {
	
	constructor: function (obj) {
		this._inherited(BetaJS.Properties.Properties, "constructor");
		if (obj)
			this.setAll(obj);
	}
	
}]);



BetaJS.Class.extend("BetaJS.Properties.PropertiesData", {
	
	constructor: function (properties) {
		this._inherited(BetaJS.Properties.PropertiesData, "constructor");
		this.__properties = properties;
		this.data = this.__properties.getAll();
		this.__properties.on("change", function (key, value) {
			this.data[key] = value;
		}, this);
		this.__properties.on("unset", function (key) {
			delete this.data[key];
		}, this);
		this.__properties.on("destroy", function () {
			this.destroy();
		}, this);
	},
	
	properties: function () {
		return this.__properties;
	}
	
});

BetaJS.Class.extend("BetaJS.Collections.Collection", [
	BetaJS.Events.EventsMixin, {
		
	constructor: function (options) {
		this._inherited(BetaJS.Collections.Collection, "constructor");
		options = options || {};
		var list_options = {};
		if ("compare" in options)
			list_options["compare"] = options["compare"];
		this.__data = new BetaJS.Lists.ArrayList([], list_options);
		var self = this;
		this.__data._ident_changed = function (object, index) {
			self._index_changed(object, index);
		};
		this.__data._re_indexed = function (object) {
			self._re_indexed(object);
		};
		this.__data._sorted = function () {
			self._sorted();
		};
		if ("objects" in options)
			this.add_objects(options["objects"]);
	},
	
	set_compare: function (compare) {
		this.__data.set_compare(compare);
	},
	
	get_compare: function () {
		this.__data.get_compare();
	},

	destroy: function () {
		this.__data.iterate(function (object) {
			if ("off" in object)
				object.off(null, null, this);
		}, this);
		this.__data.destroy();
		this.trigger("destroy");
		this._inherited(BetaJS.Collections.Collection, "destroy");
	},
	
	count: function () {
		return this.__data.count();
	},
	
	_index_changed: function (object, index) {
		this.trigger("index", object, index);
	},
	
	_re_indexed: function (object) {
		this.trigger("reindexed", object);
	},
	
	_sorted: function () {
		this.trigger("sorted");
	},
	
	_object_changed: function (object, key, value) {
		this.trigger("update");
		this.trigger("change", object, key, value);
		this.trigger("change:" + key, object, value);
		this.__data.re_index(this.getIndex(object));
	},
	
	add: function (object) {
		if (!BetaJS.Class.is_class_instance(object))
			object = new BetaJS.Properties.Properties(object);
		if (this.exists(object))
			return null;
		var ident = this.__data.add(object);
		if (ident !== null) {
			this.trigger("add", object);
			this.trigger("update");
			if ("on" in object)
				object.on("change", function (key, value) {
					this._object_changed(object, key, value);
				}, this);
		}
		return ident;
	},
	
	add_objects: function (objects) {
		var count = 0;
		BetaJS.Objs.iter(objects, function (object) {
			if (this.add(object))
				count++;
		}, this);		
		return count;
	},
	
	exists: function (object) {
		return this.__data.exists(object);
	},
	
	remove: function (object) {
		if (!this.exists(object))
			return null;
		this.trigger("remove", object);
		this.trigger("update");
		var result = this.__data.remove(object);
		if ("off" in object)
			object.off(null, null, this);
		return result;
	},
	
	getByIndex: function (index) {
		return this.__data.get(index);
	},
	
	getById: function (id) {
		return this.__data.get(this.__data.ident_by_id(id));
	},
	
	getIndex: function (object) {
		return this.__data.get_ident(object);
	},
	
	iterate: function (cb, context) {
		this.__data.iterate(cb, context);
	},
	
	iterator: function () {
		return BetaJS.Iterators.ArrayIterator.byIterate(this.iterate, this);
	},
	
	clear: function () {
		this.iterate(function (obj) {
			this.remove(obj);
		}, this);
	}
		
}]);


BetaJS.Class.extend("BetaJS.Collections.CollectionData", {
	
	constructor: function (collection) {
		this._inherited(BetaJS.Collections.CollectionData, "constructor");
		this.__collection = collection;
		this.__properties_data = {};
		this.data = {};
		this.__collection.iterate(this.__insert, this);
		this.__collection.on("add", this.__insert, this);
		this.__collection.on("remove", this.__remove, this);
		this.__collection.on("destroy", function () {
			this.destroy();
		}, this);
	},
	
	collection: function () {
		return this.__collection;
	},
	
	__insert: function (property) {
		var id = BetaJS.Ids.objectId(property);
		this.__properties_data[id] = new BetaJS.Properties.PropertiesData(property);
		this.data[id] = this.__properties_data[id].data;
	},
	
	__remove: function (property) {
		var id = BetaJS.Ids.objectId(property);
		this.__properties_data[id].destroy();
		delete this.__properties_data[id];
		delete this.data[id];
	}
	
});



BetaJS.Collections.Collection.extend("BetaJS.Collections.FilteredCollection", {
	
	constructor: function (parent, options) {
		this.__parent = parent;
		options = options || {};
		delete options["objects"];
		options.compare = options.compare || parent.get_compare();
		this._inherited(BetaJS.Collections.FilteredCollection, "constructor", options);
		if ("filter" in options)
			this.filter = options["filter"];
		this.__parent.iterate(function (object) {
			this.add(object);
			return true;
		}, this);
		this.__parent.on("add", this.add, this);
		this.__parent.on("remove", this.remove, this);
	},
	
	filter: function (object) {
		return true;
	},
	
	_object_changed: function (object, key, value) {
		this._inherited(BetaJS.Collections.FilteredCollection, "_object_changed", object, key, value);
		if (!this.filter(object))
			this.__selfRemove(object);
	},
	
	destroy: function () {
		this.__parent.off(null, null, this);
		this._inherited(BetaJS.Collections.FilteredCollection, "destroy");
	},
	
	__selfAdd: function (object) {
		return this._inherited(BetaJS.Collections.FilteredCollection, "add", object);
	},
	
	add: function (object) {
		if (this.exists(object) || !this.filter(object))
			return null;
		var id = this.__selfAdd(object);
		this.__parent.add(object);
		return id;
	},
	
	__selfRemove: function (object) {
		return this._inherited(BetaJS.Collections.FilteredCollection, "remove", object);
	},

	remove: function (object) {
		if (!this.exists(object))
			return null;
		var result = this.__selfRemove(object);
		if (!result)
			return null;
		return this.__parent.remove(object);
	}
	
});

BetaJS.Comparators = {
	
	byObject: function (object) {
		return function (left, right) {
			for (key in object) {
				var c = 0;
				if (BetaJS.Properties.Properties.is_class_instance(left) && BetaJS.Properties.Properties.is_class_instance(right))
					c = BetaJS.Comparators.byValue(left.get(key) || null, right.get(key) || null);
				else
					c = BetaJS.Comparators.byValue(left[key] || null, right[key] || null);
				if (c !== 0)
					return c * object[key];
			}
			return 0;
		};
	},
	
	byValue: function (a, b) {
		if (BetaJS.Types.is_string(a))
			return a.localeCompare(b);
		if (a < b)
			return -1;
		if (a > b)
			return 1;
		return 0;
	}
		
};

BetaJS.Sort = {

	sort_object : function(object, f) {
		var a = [];
		for (var key in object)
		a.push({
			key : key,
			value : object[key]
		});
		a.sort(function (x, y) {
			return f(x.key, y.key, x.value, y.value);
		});
		var o = {};
		for (var i = 0; i < a.length; ++i)
			o[a[i].key] = a[i].value;
		return o;
	},
	
	deep_sort: function (object, f) {
		f = f || BetaJS.Comparators.byValue;
		if (BetaJS.Types.is_array(object)) {
			for (var i = 0; i < object.length; ++i)
				object[i] = this.deep_sort(object[i], f);
			return object.sort(f);
		} else if (BetaJS.Types.is_object(object)) {
			for (var key in object)
				object[key] = this.deep_sort(object[key], f);
			return this.sort_object(object, f);
		} else
			return f;
	},

	dependency_sort : function(items, identifier, before, after) {
		var identifierf = BetaJS.Types.is_string(identifier) ? function(obj) {
			return obj[identifier];
		} : identifier;
		var beforef = BetaJS.Types.is_string(before) ? function(obj) {
			return obj[before];
		} : before;
		var afterf = BetaJS.Types.is_string(after) ? function(obj) {
			return obj[after];
		} : after;
		var n = items.length;
		var data = [];
		var identifier_to_index = {};
		var todo = {};
		var i = null;
		for ( i = 0; i < n; ++i) {
			todo[i] = true;
			var ident = identifierf(items[i], i);
			identifier_to_index[ident] = i;
			data.push({
				before : {},
				after : {}
			});
		}
		for ( i = 0; i < n; ++i) {
			BetaJS.Objs.iter(beforef(items[i], i) || [], function(before) {
				var before_index = identifier_to_index[before];
				if (BetaJS.Types.is_defined(before_index)) {
					data[i].before[before_index] = true;
					data[before_index].after[i] = true;
				}
			});
			BetaJS.Objs.iter(afterf(items[i]) || [], function(after) {
				var after_index = identifier_to_index[after];
				if (BetaJS.Types.is_defined(after_index)) {
					data[i].after[after_index] = true;
					data[after_index].before[i] = true;
				}
			});
		}
		var result = [];
		while (!BetaJS.Types.is_empty(todo)) {
			for (i in todo) {
				if (BetaJS.Types.is_empty(data[i].after)) {
					delete todo[i];
					result.push(items[i]);
					for (bef in data[i].before)
					delete data[bef].after[i];
				}
			}
		}
		return result;
	}
};

BetaJS.Locales = {
	
	__data: {},
	
	get: function (key) {
		return key in this.__data ? this.__data[key] : key;
	},
	
	register: function (strings, prefix) {
		prefix = prefix ? prefix + "." : "";
		for (var key in strings)
			this.__data[prefix + key] = strings[key];
	},
	
	view: function (base) {
		return {
			context: this,
			base: base,
			get: function (key) {
				return this.context.get(this.base + "." + key);
			},
			base: function (base) {
				return this.context.base(this.base + "." + base);
			}
		};
	}
	
};
BetaJS.Time = {
	
	format_time: function(t, s) {
		var seconds = this.seconds(t);
		var minutes = this.minutes(t);
		var hours = this.hours(t);
		var replacers = {
			"hh": hours < 10 ? "0" + hours : hours, 
			"h": hours, 
			"mm": minutes < 10 ? "0" + minutes : minutes, 
			"m": minutes, 
			"ss": seconds < 10 ? "0" + seconds : seconds, 
			"s": seconds
		};
		for (var key in replacers)
			s = s.replace(key, replacers[key]);
		return s;
	},
	
	make: function (data) {
		var t = 0;
		var multipliers = {
			hours: 60,
			minutes: 60,
			seconds: 60,
			milliseconds: 1000
		};
		for (var key in multipliers) {
			t *= multipliers[key];
			if (key in data)
				t += data[key];
		}
		return t;
	},
	
	seconds: function (t) {
		return Math.floor(t / 1000) % 60;
	},
	
	minutes: function (t) {
		return Math.floor(t / 60 / 1000) % 60;
	},

	hours: function (t) {
		return Math.floor(t / 60 / 60 / 1000) % 24;
	},

	days: function (t) {
		return Math.floor(t / 24 / 60 / 60 / 1000);
	},

	now: function () {
		var d = new Date();
		return d.getTime();
	},
	
	ago: function (t) {
		return this.now() - t;
	},
	
	days_ago: function (t) {
		return this.days(this.ago(t));
	},
	
	format_ago: function (t) {
		if (this.days_ago(t) > 1)
			return this.format(t, {time: false});
		else
			return this.format_period(Math.max(this.ago(t), 0)) + " ago";
	},
	
	format_period: function (t) {
		t = Math.round(t / 1000);
		if (t < 60)
			return t + " " + BetaJS.Locales.get(t == 1 ? "second" : "seconds");
		t = Math.round(t / 60);
		if (t < 60)
			return t + " " + BetaJS.Locales.get(t == 1 ? "minute" : "minutes");
		t = Math.round(t / 60);
		if (t < 24)
			return t + " " + BetaJS.Locales.get(t == 1 ? "hour" : "hours");
		t = Math.round(t / 24);
		return t + " " + BetaJS.Locales.get(t == 1 ? "day" : "days");
	},
	
	format: function (t, options) {
		options = BetaJS.Objs.extend({
			time: true,
			date: true,
			locale: true
		}, options || {});
		var d = new Date(t);
		if (options.locale) {
			if (options.date) {
				if (options.time)
					return d.toLocaleString();
				else
					return d.toLocaleDateString();
			} else
				return d.toLocaleTimeString();
		} else {
			if (options.date) {
				if (options.time) 
					return d.toString();
				else
					return d.toDateString();
			} else
				return d.toTimeString();
		}
	}
	
};

BetaJS.Class.extend("BetaJS.Timers.Timer", {
	
	/*
	 * int delay (mandatory): number of milliseconds until it fires
	 * bool once (optional, default false): should it fire infinitely often
	 * func fire (optional): will be fired
	 * object context (optional): for fire
	 * bool start (optional, default true): should it start immediately
	 * 
	 */
	constructor: function (options) {
		this._inherited(BetaJS.Timers.Timer, "constructor");
		options = BetaJS.Objs.extend({
			once: false,
			start: true,
			fire: null,
			context: this,
			destroy_on_fire: false
		}, options);
		this.__delay = options.delay;
		this.__destroy_on_fire = options.destroy_on_fire;
		this.__once = options.once;
		this.__fire = options.fire;
		this.__context = options.context;
		this.__started = false;
		if (options.start)
			this.start();
	},
	
	destroy: function () {
		this.stop();
		this._inherited(BetaJS.Timers.Timer, "destroy");
	},
	
	fire: function () {
		if (this.__once)
			this.__started = false;
		if (this.__fire)
			this.__fire.apply(this.__context, [this]);
		if (this.__destroy_on_fire)
			this.destroy();
	},
	
	stop: function () {
		if (!this.__started)
			return;
		if (this.__once)
			clearTimeout(this.__timer);
		else
			clearInterval(this.__timer);
		this.__started = false;
	},
	
	start: function () {
		if (this.__started)
			return;
		var self = this;
		if (this.__once)
			this.__timer = setTimeout(function () {
				self.fire();
			}, this.__delay);
		else
			this.__timer = setInterval(function () {
				self.fire();
			}, this.__delay);
		this.__started = true;
	},
	
	restart: function () {
		this.stop();
		this.start();
	}
	
});
/*
 * Inspired by Underscore's Templating Engine
 * (which itself is inspired by John Resig's implementation)
 */

BetaJS.Templates = {
	
	tokenize: function (s) {
		// Already tokenized?
		if (BetaJS.Types.is_array(s))
			return s;
		var tokens = [];
		var index = 0;
		s.replace(BetaJS.Templates.SYNTAX_REGEX(), function(match, expr, esc, code, offset) {
			if (index < offset) 
				tokens.push({
					type: BetaJS.Templates.TOKEN_STRING,
					data: BetaJS.Strings.js_escape(s.slice(index, offset))
				});
			if (code)
				tokens.push({type: BetaJS.Templates.TOKEN_CODE, data: code});
			if (expr)
				tokens.push({type: BetaJS.Templates.TOKEN_EXPR, data: expr});
			if (esc)
				tokens.push({type: BetaJS.Templates.TOKEN_ESC, data: esc});
		    index = offset + match.length;
		    return match;
		});
		return tokens;
	},
	
	/*
	 * options
	 *  - start_index: token start index
	 *  - end_index: token end index
	 */
	compile: function(source, options) {
		if (BetaJS.Types.is_string(source))
			source = this.tokenize(source);
		options = options || {};
		var start_index = options.start_index || 0;
		var end_index = options.end_index || source.length;
		var result = "__p+='";
		for (var i = start_index; i < end_index; ++i) {
			switch (source[i].type) {
				case BetaJS.Templates.TOKEN_STRING:
					result += source[i].data;
					break;
				case BetaJS.Templates.TOKEN_CODE:
					result += "';\n" + source[i].data + "\n__p+='";
					break;
				case BetaJS.Templates.TOKEN_EXPR:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':__t)+\n'";
					break;
				case BetaJS.Templates.TOKEN_ESC:
					result += "'+\n((__t=(" + source[i].data + "))==null?'':BetaJS.Strings.htmlentities(__t))+\n'";
					break;
				default:
					break;
			}	
		}
		result += "';\n";
		result = 'with(obj||{}){\n' + result + '}\n';
		result = "var __t,__p='',__j=Array.prototype.join," +
		  "echo=function(){__p+=__j.call(arguments,'');};\n" +
		  result + "return __p;\n";
		var func = new Function('obj', result);
		var func_call = function(data) {
			return func.call(this, data);
		};
		func_call.source = 'function(obj){\n' + result + '}';
		return func_call;
	}
		
};

BetaJS.Templates.SYNTAX = {
	OPEN: "{%",
	CLOSE: "%}",
	MODIFIER_CODE: "",
	MODIFIER_EXPR: "=",
	MODIFIER_ESC: "-"
};

BetaJS.Templates.SYNTAX_REGEX = function () {
	var syntax = BetaJS.Templates.SYNTAX;
	if (!BetaJS.Templates.SYNTAX_REGEX_CACHED)
		BetaJS.Templates.SYNTAX_REGEX_CACHED = new RegExp(
			syntax.OPEN + syntax.MODIFIER_EXPR + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_ESC + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			syntax.OPEN + syntax.MODIFIER_CODE + "([\\s\\S]+?)" + syntax.CLOSE + "|" +
			"$",
		'g');
	return BetaJS.Templates.SYNTAX_REGEX_CACHED;
};

BetaJS.Templates.TOKEN_STRING = 1;
BetaJS.Templates.TOKEN_CODE = 2;
BetaJS.Templates.TOKEN_EXPR = 3;
BetaJS.Templates.TOKEN_ESC = 4;



BetaJS.Class.extend("BetaJS.Templates.Template", {
	
	constructor: function (template_string) {
		this._inherited(BetaJS.Templates.Template, "constructor");
		this.__tokens = BetaJS.Templates.tokenize(template_string);
		this.__compiled = BetaJS.Templates.compile(this.__tokens);
	},
	
	evaluate: function (obj) {
		return this.__compiled.apply(this, [obj]);
	}
	
}, {
	
	bySelector: function (selector) {
		return new this(BetaJS.$(selector).html());
	}
	
});
BetaJS.Class.extend("BetaJS.States.Host", [
    BetaJS.Events.EventsMixin,
    {
    
    initialize: function (initial_state, initial_args) {
        var cls = BetaJS.Scopes.resolve(initial_state);
        var obj = new cls(this, initial_args, {});
        obj.start();
    },
    
    destroy: function () {
        if (this._state)
            this._state.destroy();
        this._inherited(BetaJS.States.Host, "destroy");
    },
    
    state: function () {
        return this._state;
    },

    _start: function (state) {
        this._stateEvent(state, "before_start");
        this._state = state;
    },
    
    _afterStart: function (state) {
        this._stateEvent(state, "start");
    },
    
    _end: function (state) {
        this._stateEvent(state, "end");
        this._state = null;
    },
    
    _afterEnd: function (state) {
        this._stateEvent(state, "after_end");
    },
    
    _next: function (state) {
        this._stateEvent(state, "next");
    },
    
    _afterNext: function (state) {
        this._stateEvent(state, "after_next");
    },
    
    _can_transition_to: function (state) {
        return true;
    },
    
    _stateEvent: function (state, s) {
        this.trigger("event", s, state.state_name(), state.description());
        this.trigger(s, state.state_name(), state.description());
        this.trigger(s + ":" + state.state_name(), state.description());
    }

}]);


BetaJS.Class.extend("BetaJS.States.State", {

    _locals: [],
    _persistents: [],

    constructor: function (host, args, transitionals) {
        this._inherited(BetaJS.States.State, "constructor");
        this.host = host;
        this.transitionals = transitionals;
        this._started = false;
        args = args || {};
        this._locals = BetaJS.Types.is_function(this._locals) ? this._locals() : this._locals;
        for (var i = 0; i < this._locals.length; ++i)
            this["_" + this._locals[i]] = args[this._locals[i]];
        this._persistents = BetaJS.Types.is_function(this._persistents) ? this._persistents() : this._persistents;
        for (i = 0; i < this._persistents.length; ++i)
            this["_" + this._persistents[i]] = args[this._persistents[i]];
    },

    state_name: function () {
        return BetaJS.Strings.last_after(this.cls.classname, ".");
    },
    
    description: function () {
        return this.state_name();
    },
    
    start: function () {
        this.host._start(this);
        this._start();
        if (this.host) {
            this.host._afterStart(this);
            this._started = true;
        }
    },
    
    end: function () {
        this.host._end(this);
        this._end();
        this.host._afterEnd(this);
        this.destroy();
    },
    
    next: function (state_name, args, transitionals) {
        var clsname = this.cls.classname;
        var scope = BetaJS.Scopes.resolve(clsname.substring(0, clsname.lastIndexOf(".")));
        var cls = scope[state_name];
        args = args || {};
        for (var i = 0; i < this._persistents.length; ++i) {
            if (!(this._persistents[i] in args))
                args[this._persistents[i]] = this["_" + this._persistents[i]];
        }
        var obj = new cls(this.host, args, transitionals);
        if (!this.can_transition_to(obj)) {
            obj.destroy();
            return;
        }
        if (!this._started) {
            this.host._afterStart(this);
            this._started = true;
        }
        var host = this.host;
        host._next(obj);
        this.end();
        obj.start();
        host._afterNext(obj);
    },

    can_transition_to: function (state) {
        return this.host && this.host._can_transition_to(state) && this._can_transition_to(state);
    },
    
    _start: function () {},
    
    _end: function () {},
    
    _can_transition_to: function (state) {
        return true;
    }

});



BetaJS.Class.extend("BetaJS.States.CompetingComposite", {

    _register_host: function (competing_host) {
        this._hosts = this._hosts || [];
        this._hosts.push(this._auto_destroy(competing_host));
    },
    
    other_hosts: function (competing_host) {
        return BetaJS.Objs.filter(this._hosts || [], function (other) {
            return other != competing_host;
        }, this);
    },
    
    _next: function (competing_host, state) {
        var others = this.other_hosts(competing_host);
        for (var i = 0; i < others.length; ++i) {
            var other = others[i];
            var other_state = other.state();
            if (!other_state.can_coexist_with(state))
                other_state.retreat_against(state);
        }
    }

});


BetaJS.States.Host.extend("BetaJS.States.CompetingHost", {

    constructor: function (composite) {
        this._inherited(BetaJS.States.CompetingHost, "constructor");
        this._composite = composite;
        if (composite)
            composite._register_host(this);
    },
    
    composite: function () {
        return this._composite;
    },

    _can_transition_to: function (state) {
        if (!this._composite)
            return true;
        var others = this._composite.other_hosts(this);
        for (var i = 0; i < others.length; ++i) {
            var other = others[i];
            var other_state = other.state();
            if (!state.can_coexist_with(other_state) && !state.can_prevail_against(other_state))
                return false;
        }
        return true;
    },
    
    _next: function (state) {
        if (this._composite)
            this._composite._next(this, state);
        this._inherited(BetaJS.States.CompetingHost, "_next", state);
    }
    
});


BetaJS.States.State.extend("BetaJS.States.CompetingState", {

    can_coexist_with: function (foreign_state) {
        return true;
    },
    
    can_prevail_against: function (foreign_state) {
        return false;
    },
    
    retreat_against: function (foreign_state) {
    }
    
});

BetaJS.Class.extend("BetaJS.Channels.Sender", [
	BetaJS.Events.EventsMixin,
	{
	
	send: function (message, data) {
		this.trigger("send", message, data);
		this._send(message, data);
	},
	
	_send: function (message, data) {}
	
}]);

BetaJS.Class.extend("BetaJS.Channels.Receiver", [
	BetaJS.Events.EventsMixin,
	{
		
	_receive: function (message, data) {
		this.trigger("receive", message, data);
		this.trigger("receive:" + message, data);
	}
	
}]);


BetaJS.Channels.Sender.extend("BetaJS.Channels.ReveiverSender", {
	
	constructor: function (receiver) {
		this._inherited(BetaJS.Channels.ReveiverSender, "constructor");
		this.__receiver = receiver;
	},
	
	_send: function (message, data) {
		this.__receiver._receive(message, data);
	}
	
});

BetaJS.Channels.Sender.extend("BetaJS.Channels.SenderMultiplexer", {
	
	constructor: function (sender, prefix) {
		this._inherited(BetaJS.Channels.SenderMultiplexer, "constructor");
		this.__sender = sender;
		this.__prefix = prefix;
	},
	
	_send: function (message, data) {
		this.__sender.send(this.__prefix + ":" + message, data);
	}
	
});

BetaJS.Channels.Receiver.extend("BetaJS.Channels.ReceiverMultiplexer", {

	constructor: function (receiver, prefix) {
		this._inherited(BetaJS.Channels.ReceiverMultiplexer, "constructor");
		this.__receiver = receiver;
		this.__prefix = prefix;
		this.__receiver.on("receive", function (message, data) {
			if (BetaJS.Strings.starts_with(message, this.__prefix + ":")) {
				this._receive(BetaJS.Strings.strip_start(message, this.__prefix + ":"), data);
			}
		}, this);
	}
		
});



BetaJS.Class.extend("BetaJS.Channels.TransportChannel", {
	
	constructor: function (sender, receiver, options) {
		this._inherited(BetaJS.Channels.TransportChannel, "constructor");
		this.__sender = sender;
		this.__receiver = receiver;
		this.__options = BetaJS.Objs.extend(options, {
			timeout: 10000,
			tries: 1,
			timer: 500
		});
		this.__receiver.on("receive:send", function (data) {
			this.__reply(data);
		}, this);
		this.__receiver.on("receive:reply", function (data) {
			this.__complete(data);
		}, this);
		this.__sent_id = 0;
		this.__sent = {};
		this.__received = {};
		this.__timer = this._auto_destroy(new BetaJS.Timers.Timer({
			delay: this.__options.timer,
			context: this,
			fire: this.__maintenance
		}));
	},
	
	_reply: function (message, data, callbacks) {},
	
	send: function (message, data, callbacks, options) {
		options = options || {};
		if (options.stateless) {
			this.__sender.send("send", {
				message: message,
				data: data,
				stateless: true
			});
		} else {
			this.__sent_id++;
			this.__sent[this.__sent_id] = {
				message: message,
				data: data,
				tries: 1,
				time: BetaJS.Time.now(),
				id: this.__sent_id,
				callbacks: callbacks
			};
			this.__sender.send("send", {
				message: message,
				data: data,
				id: this.__sent_id
			});
		}
	},
	
	__reply: function (data) {
		if (data.stateless) {
			this._reply(data.message, data.data);
			return;
		}
		if (!this.__received[data.id]) {
			this.__received[data.id] = data;
			this.__received[data.id].time = BetaJS.Time.now();
			this.__received[data.id].returned = false;
			this.__received[data.id].success = false;
			this._reply(data.message, data.data, {
				context: this,
				success: function (result) {
					this.__received[data.id].reply = result;
					this.__received[data.id].success = true;
				}, complete: function () {
					this.__received[data.id].returned = true;
					this.__sender.send("reply", {
						id: data.id,
						reply: data.reply,
						success: data.success
					});
				}
			});
			  
		} else if (this.__received[data.id].returned) {
			this.__sender.send("reply", {
				id: data.id,
				reply: data.reply,
				success: data.success
			});
		}
	},
	
	__complete: function (data) {
		if (this.__sent[data.id]) {
			BetaJS.SyncAsync.callback(this.__sent[data.id].callbacks, "success", data.reply);
			delete this.__sent[data.id];
		}
	},
	
	__maintenance: function () {
		var now = BetaJS.Time.now();
		for (var received_key in this.__received) {
			var received = this.__received[received_key];
			if (received.time + this.__options.tries * this.__options.timeout <= now)
				delete this.__received[received_key];
		}
		for (var sent_key in this.__sent) {
			var sent = this.__sent[sent_key];
			if (sent.time + sent.tries * this.__options.timeout <= now) {
				if (sent.tries < this.__options.tries) {
					sent.tries++;
					this.__sender.send("send", {
						message: sent.message,
						data: sent.data,
						id: sent.id
					});
				} else {
					BetaJS.SyncAsync.callback(sent.callbacks, "failure", {
						message: sent.message,
						data: sent.data
					});
					delete this.__sent[sent_key];
				}
			}
		}
	}
	
});

BetaJS.Class.extend("BetaJS.RMI.Stub", [
	BetaJS.Classes.InvokerMixin,
	BetaJS.Events.EventsMixin,
	{
		
	intf: [],
	
	constructor: function () {
		this._inherited(BetaJS.RMI.Stub, "constructor");
		this.invoke_delegate("invoke", this.intf);
	},
	
	destroy: function () {
		this.invoke("_destroy");
		this.trigger("destroy");
		this._inherited(BetaJS.RMI.Stub, "destroy");
	},
	
	invoke: function (message) {
		var promise = {
			context: this,
			success: function (f) {
				this.__success = f;
				if (this.is_complete && this.is_success)
					this.__success.call(this.context, this.result);
				return this;
			},
			failure: function (f) {
				this.__failure = f;
				if (this.is_complete && this.is_failure)
					this.__failure.call(this.context);
				return this;
			},
			callbacks: function (c) {
			    c = c.callbacks ? c.callbacks : c;
			    this.context = c.context || this;
			    if (c.success)
			        this.success(c.success);
                if (c.failure)
                    this.failure(c.failure);
                return this;
			}
		};
		this.trigger("send", message, BetaJS.Functions.getArguments(arguments, 1), {
			context: this,
			success: function (result) {
				promise.result = result;
				promise.is_complete = true;
				promise.is_success = true;
				if (promise.__success)
					promise.__success.call(this.context, result);
			},
			failure: function () {
				promise.is_complete = true;
				promise.is_failure = true;		
				if (promise.__failure)
					promise.__failure.call(this.context);
			}
		});
		return promise;
	}
	
}]);


BetaJS.Class.extend("BetaJS.RMI.Skeleton", [
	BetaJS.Events.EventsMixin,
	{
	
	_stub: null,
	intf: [],
	intfSync: [],
	_intf: {},
	_intfSync: {},
	__superIntf: [],
	__superIntfSync: ["_destroy"],
	
	constructor: function (options) {
		this._options = BetaJS.Objs.extend({
			destroyable: false
		}, options);
		this._inherited(BetaJS.RMI.Skeleton, "constructor");
		this.intf = this.intf.concat(this.__superIntf);
		this.intfSync = this.intfSync.concat(this.__superIntfSync);
		for (var i = 0; i < this.intf.length; ++i)
			this._intf[this.intf[i]] = true;
		for (i = 0; i < this.intfSync.length; ++i)
			this._intfSync[this.intfSync[i]] = true;
	},
	
	_destroy: function () {
		if (this._options.destroyable)
			this.destroy();
	},
	
	destroy: function () {
		this.trigger("destroy");
		this._inherited(BetaJS.RMI.Skeleton, "destroy");
	},
	
	invoke: function (message, data, callbacks, caller) {
		if (!(this._intf[message] || this._intfSync[message])) {
			this._failure(callbacks);
			return;
		}
		var ctx = {
			callbacks: callbacks,
			caller: caller
		};
		if (this._intf[message]) {
			data.unshift(ctx);
			this[message].apply(this, data);
		} else {
			try {
				this._success(ctx, this[message].apply(this, data));
			} catch (e) {
				this._failure(ctx, e);
			}
		}
	},
	
	_success: function (callbacks, result) {
		callbacks = callbacks.callbacks ? callbacks.callbacks : callbacks;
		BetaJS.SyncAsync.callback(callbacks, "success", result);
	},
	
	_failure: function (callbacks) {
		callbacks = callbacks.callbacks ? callbacks.callbacks : callbacks;
		BetaJS.SyncAsync.callback(callbacks, "failure");
	},
	
	stub: function () {
		if (this._stub)
			return this._stub;
		var stub = this.cls.classname;
		return stub.indexOf("Skeleton") >= 0 ? stub.replace("Skeleton", "Stub") : stub;
	}
	
}]);

BetaJS.Class.extend("BetaJS.RMI.Server", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (sender_or_channel_or_null, receiver_or_null) {
		this._inherited(BetaJS.RMI.Server, "constructor");
		this.__channels = new BetaJS.Lists.ObjectIdList();
		this.__instances = {};
		if (sender_or_channel_or_null) {
			var channel = sender_or_channel_or_null;
			if (receiver_or_null)
				channel = this._auto_destroy(new BetaJS.Channels.TransportChannel(sender_or_channel_or_null, receiver_or_null));
			this.registerClient(channel);
		}
	},
	
	destroy: function () {
		this.__channels.iterate(this.unregisterClient, this);
		BetaJS.Objs.iter(this.__instances, function (inst) {
			this.unregisterInstance(inst.instance);
		}, this);
		this.__channels.destroy();
		this._inherited(BetaJS.RMI.Server, "destroy");
	},
	
	registerInstance: function (instance, options) {
		options = options || {};
		this.__instances[BetaJS.Ids.objectId(instance, options.name)] = {
			instance: instance,
			options: options
		};
		return instance;
	},
	
	unregisterInstance: function (instance) {
		delete this.__instances[BetaJS.Ids.objectId(instance)];
		instance.destroy();
	},
	
	registerClient: function (channel) {
		var self = this;
		this.__channels.add(channel);
		channel._reply = function (message, data, callbacks) {
			var components = message.split(":");
			if (components.length == 2)
				self._invoke(channel, components[0], components[1], data, callbacks);
			else
				BetaJS.SyncAsync.callback(callbacks, "failure");
		};
	},
	
	unregisterClient: function (channel) {
		this.__channels.remove(channel);
		channel._reply = null;
	},
	
	_invoke: function (channel, instance_id, method, data, callbacks) {
		var instance = this.__instances[instance_id];
		if (!instance) {
			this.trigger("loadInstance", channel, instance_id);
			instance = this.__instances[instance_id];
		}
		if (!instance) {
			BetaJS.SyncAsync.callback(callbacks, "failure");
			return;
		}
		instance = instance.instance;
		var self = this;
		instance.invoke(method, data, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
			if (BetaJS.RMI.Skeleton.is_class_instance(result) && result.instance_of(BetaJS.RMI.Skeleton)) {
				self.registerInstance(result);
				BetaJS.SyncAsync.callback(callbacks, "success", {
					__rmi_meta: true,
					__rmi_stub: result.stub(),
					__rmi_stub_id: BetaJS.Ids.objectId(result)
				});
			} else
				BetaJS.SyncAsync.callback(callbacks, "success", result);
		}), channel);
	}
		
}]);


BetaJS.Class.extend("BetaJS.RMI.Client", {
	
	constructor: function (sender_or_channel_or_null, receiver_or_null) {
		this._inherited(BetaJS.RMI.Client, "constructor");
		this.__channel = null;
		this.__instances = {};
		if (sender_or_channel_or_null) {
			var channel = sender_or_channel_or_null;
			if (receiver_or_null)
				channel = this._auto_destroy(new BetaJS.Channels.TransportChannel(sender_or_channel_or_null, receiver_or_null));
			this.__channel = channel;
		}
	},
	
	destroy: function () {
		if (this.__channel)
			this.disconnect();
		this._inherited(BetaJS.RMI.Client, "destroy");
	},
	
	connect: function (channel) {
		if (this.__channel)
			return;
		this.__channel = channel;
	},
	
	disconnect: function () {
		if (!this.__channel)
			return;
		this.__channel = null;
		BetaJS.Objs.iter(this.__instances, function (inst) {
			this.release(inst);
		}, this);
	},
	
	acquire: function (class_type, instance_name) {
		if (this.__instances[instance_name])
			return this.__instances[instance_name];
		if (BetaJS.Types.is_string(class_type))
			class_type = BetaJS.Scopes.resolve(class_type);
		if (!class_type || !class_type.ancestor_of(BetaJS.RMI.Stub))
			return null;
		var instance = new class_type();
		this.__instances[BetaJS.Ids.objectId(instance, instance_name)] = instance;
		var self = this;
		instance.on("send", function (message, data, callbacks) {
			this.__channel.send(instance_name + ":" + message, data, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				if (BetaJS.Types.is_object(result) && result.__rmi_meta)
					BetaJS.SyncAsync.callback(callbacks, "success", self.acquire(result.__rmi_stub, result.__rmi_stub_id));
				else
					BetaJS.SyncAsync.callback(callbacks, "success", result);
			}));
		}, this);
		return instance;		
	},
	
	release: function (instance) {
		var instance_name = BetaJS.Ids.objectId(instance);
		if (!this.__instances[instance_name])
			return;
		instance.off(null, null, this);
		instance.destroy();
		delete this.__instances[instance_name];
	}
	
});


BetaJS.Class.extend("BetaJS.RMI.Peer", {

	constructor: function (sender, receiver) {
		this._inherited(BetaJS.RMI.Peer, "constructor");
		this.__sender = sender;
		this.__receiver = receiver;
		this.__client_sender = this._auto_destroy(new BetaJS.Channels.SenderMultiplexer(sender, "client"));
		this.__server_sender = this._auto_destroy(new BetaJS.Channels.SenderMultiplexer(sender, "server"));
		this.__client_receiver = this._auto_destroy(new BetaJS.Channels.ReceiverMultiplexer(receiver, "server"));
		this.__server_receiver = this._auto_destroy(new BetaJS.Channels.ReceiverMultiplexer(receiver, "client"));
		this.client = this._auto_destroy(new BetaJS.RMI.Client(this.__client_sender, this.__client_receiver));
		this.server = this._auto_destroy(new BetaJS.RMI.Server(this.__server_sender, this.__server_receiver));
	},	
	
	acquire: function (class_type, instance_name) {
		return this.client.acquire(class_type, instance_name);
	},
	
	release: function (instance) {
		this.client.release(instance);
	},

	registerInstance: function (instance, options) {
		return this.server.registerInstance(instance, options);
	},
	
	unregisterInstance: function (instance) {
		this.server.unregisterInstance(instance);
	}

});

/*
 * <ul>
 *  <li>uri: target uri</li>
 *  <li>method: get, post, ...</li>
 *  <li>data: data as JSON to be passed with the request</li>
 *  <li>success_callback(data): will be called when request was successful</li>
 *  <li>failure_callback(status_code, status_text, data): will be called when request was not successful</li>
 *  <li>complete_callback(): will be called when the request has been made</li>
 * </ul>
 * 
 */
BetaJS.Class.extend("BetaJS.Net.AbstractAjax", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Net.AbstractAjax, "constructor");
		this.__options = BetaJS.Objs.extend({
			"method": "GET",
			"data": {}
		}, options);
	},
	
	syncCall: function (options) {
		try {
			return this._syncCall(BetaJS.Objs.extend(BetaJS.Objs.clone(this.__options, 1), options));
		} catch (e) {
			e = BetaJS.Exceptions.ensure(e);
			e.assert(BetaJS.Net.AjaxException);
			throw e;
		}
	},
	
	asyncCall: function (options, callbacks) {
		this._asyncCall(BetaJS.Objs.extend(BetaJS.Objs.clone(this.__options, 1), options), callbacks);
	},
	
	call: function (options, callbacks) {
		return callbacks ? this.asyncCall(options, callbacks) : this.syncCall(options);
	},
	
	_syncCall: function (options) {},
	
	_asyncCall: function (options, callbacks) {}
	
});


BetaJS.Exceptions.Exception.extend("BetaJS.Net.AjaxException", {
	
	constructor: function (status_code, status_text, data) {
		this._inherited(BetaJS.Net.AjaxException, "constructor", status_code + ": " + status_text);
		this.__status_code = status_code;
		this.__status_text = status_text;
		this.__data = data;
	},
	
	status_code: function () {
		return this.__status_code;
	},
	
	status_text: function () {
		return this.__status_text;
	},
	
	data: function () {
		return this.__data;
	},
	
	json: function () {
		var obj = this._inherited(BetaJS.Net.AjaxException, "json");
		obj.data = this.data();
		return obj;
	}
	
});

BetaJS.Channels.Sender.extend("BetaJS.Net.SocketSenderChannel", {
	
	constructor: function (socket, message, ready) {
		this._inherited(BetaJS.Net.SocketSenderChannel, "constructor");
		this.__socket = socket;
		this.__message = message;
		this.__ready = BetaJS.Types.is_defined(ready) ? ready : true;
		this.__cache = [];
	},
	
	_send: function (message, data) {
		if (this.__ready) {
			this.__socket.emit(this.__message, {
				message: message,
				data: data
			});
		} else {
			this.__cache.push({
				message: message,
				data: data
			});
		}
	},
	
	ready: function () {
		this.__ready = true;
		for (var i = 0; i < this.__cache.length; ++i)
			this._send(this.__cache[i].message, this.__cache[i].data);
		this.__cache = [];
	},
	
	unready: function () {
	    this.__ready = false;
	},
	
	socket: function () {
	    if (arguments.length > 0)
	        this.__socket = arguments[0];
	    return this.__socket;
	}
	
});


BetaJS.Channels.Receiver.extend("BetaJS.Net.SocketReceiverChannel", {
	
	constructor: function (socket, message) {
		this._inherited(BetaJS.Net.SocketReceiverChannel, "constructor");
		this.__message = message;
		this.socket(socket);
	},
	
    socket: function () {
        if (arguments.length > 0) {
            this.__socket = arguments[0];
            if (this.__socket) {
                var self = this;
                this.__socket.on(this.__message, function (data) {
                    self._receive(data.message, data.data);
                });
            }
        }
        return this.__socket;
    }
	
});

BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.HttpHeader = {
	
	HTTP_STATUS_OK : 200,
	HTTP_STATUS_CREATED : 201,
	HTTP_STATUS_PAYMENT_REQUIRED : 402,
	HTTP_STATUS_FORBIDDEN : 403,
	HTTP_STATUS_NOT_FOUND : 404,
	HTTP_STATUS_PRECONDITION_FAILED : 412,
	HTTP_STATUS_INTERNAL_SERVER_ERROR : 500,
	
	format: function (code, prepend_code) {
		var ret = "";
		if (code == this.HTTP_STATUS_OK)
			ret = "OK";
		else if (code == this.HTTP_STATUS_CREATED)
			ret = "Created";
		else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
			ret = "Payment Required";
		else if (code == this.HTTP_STATUS_FORBIDDEN)
			ret = "Forbidden";
		else if (code == this.HTTP_STATUS_NOT_FOUND)
			ret = "Not found";
		else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
			ret = "Precondition Failed";
		else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
			ret = "Internal Server Error";
		else
			ret = "Other Error";
		return prepend_code ? (code + " " + ret) : ret;
	}
	
};
BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.Uri = {
	
	build: function (obj) {
		var s = "";
		if (obj.username)
			s += obj.username + ":";
		if (obj.password)
			s += obj.password + "@";
		s += obj.server;
		if (obj.port)
			s += ":" + obj.port;
		if (obj.path)
			s += "/" + obj.path;
		return s;
	},
	
	encodeUriParams: function (arr, prefix) {
		prefix = prefix || "";
		var res = [];
		BetaJS.Objs.iter(arr, function (value, key) {
			if (BetaJS.Types.is_object(value))
				res = res.concat(this.encodeUriParams(value, prefix + key + "_"));
			else
				res.push(prefix + key + "=" + encodeURI(value));
		}, this);
		return res.join("&");
	},
	
	appendUriParams: function (uri, arr, prefix) {
		return BetaJS.Types.is_empty(arr) ? uri : (uri + (uri.indexOf("?") != -1 ? "&" : "?") + this.encodeUriParams(arr, prefix));
	},
	
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License

	parse: function (str, strict) {
		var parser = strict ? this.__parse_strict_regex : this.__parse_loose_regex;
		var m = parser.exec(str);
		var uri = {};
		for (var i = 0; i < this.__parse_key.length; ++i)
			uri[this.__parse_key[i]] = m[i] || "";
		uri.queryKey = {};
		uri[this.__parse_key[12]].replace(this.__parse_key_parser, function ($0, $1, $2) {
			if ($1) uri.queryKey[$1] = $2;
		});

		return uri;
	},
	
	__parse_strict_regex: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
	__parse_loose_regex: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
	__parse_key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	__parse_key_parser: /(?:^|&)([^&=]*)=?([^&]*)/g

};
/*!
  betajs - v0.0.2 - 2014-07-24
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Queries = {

	/*
	 * Syntax:
	 *
	 * queries :== [query, ...]
	 * simples :== [simple, ...]
	 * query :== {pair, ...}
	 * pair :== string: value | $or : queries | $and: queries
	 * value :== simple | {condition, ...}  
	 * condition :== $in: simples | $gt: simple | $lt: simple | $sw: simple | $gtic: simple | $ltic: simple | $swic: simple
	 *
	 */
	
	subsumizes: function (query, query2) {
		// This is very simple at this point
		if (!BetaJS.Types.is_object(query) || !BetaJS.Types.is_object)
			return query == query2;
		for (var key in query) {
			if (!(key in query2) || !this.subsumizes(query[key], query2[key]))
				return false;
		}
		return true;
	},
	
	normalize: function (query) {
		return BetaJS.Sort.deep_sort(query);
	},
	
	serialize: function (query) {
		return JSON.stringify(this.normalize(query));
	},
	
	unserialize: function (query) {
		return JSON.parse(query);
	},
	
	__increase_dependency: function (key, dep) {
		if (key in dep)
			dep[key]++;
		else
			dep[key] = 1;
		return dep;		
	},
	
	__dependencies_queries: function (queries, dep) {
		BetaJS.Objs.iter(queries, function (query) {
			dep = this.__dependencies_query(query, dep);
		}, this);
		return dep;
	},
	
	__dependencies_query: function (query, dep) {
		for (key in query)
			dep = this.__dependencies_pair(key, query[key], dep);
		return dep;
	},
	
	__dependencies_pair: function (key, value, dep) {
		if (key == "$or" || key == "$and")
			return this.__dependencies_queries(value, dep);
		else
			return this.__increase_dependency(key, dep);
	},

	dependencies : function(query) {
		return this.__dependencies_query(query, {});
	},
		
	__evaluate_query: function (query, object) {
		for (var key in query) {
			if (!this.__evaluate_pair(key, query[key], object))
				return false;
		}
		return true;
	},
	
	__evaluate_pair: function (key, value, object) {
		if (key == "$or")
			return this.__evaluate_or(value, object);
		if (key == "$and")
			return this.__evaluate_and(value, object);
		return this.__evaluate_value(value, object[key]);
	},
	
	__evaluate_value: function (value, object_value) {
		if (BetaJS.Types.is_object(value)) {
			var result = true;
			BetaJS.Objs.iter(value, function (tar, op) {
				if (op == "$in")
					result = result && BetaJS.Objs.contains_value(tar, object_value);
				if (op == "$gt")
					result = result && object_value >= tar;
				if (op == "$gtic")
					result = result && object_value.toLowerCase() >= tar.toLowerCase();
				if (op == "$lt")
					result = result && object_value <= tar;
				if (op == "$ltic")
					result = result && object_value.toLowerCase() <= tar.toLowerCase();
				if (op == "$sw")
					result = result && object_value.indexOf(tar) === 0;
				if (op == "$swic")
					result = result && object_value.toLowerCase().indexOf(tar.toLowerCase()) === 0;
			}, this);
			return result;
		}
		return value == object_value;
	},
	
	__evaluate_or: function (arr, object) {
		BetaJS.Objs.iter(arr, function (query) {
			if (this.__evaluate_query(query, object))
				return true;
		}, this);
		return false;
	},
	
	__evaluate_and: function (arr, object) {
		BetaJS.Objs.iter(arr, function (query) {
			if (!this.__evaluate_query(query, object))
				return false;
		}, this);
		return true;
	},
	
	format: function (query) {
		if (BetaJS.Class.is_class_instance(query))
			return query.format();
		return JSON.stringify(query);
	},
	
	overloaded_evaluate: function (query, object) {
		if (BetaJS.Class.is_class_instance(query))
			return query.evaluate(object);
		if (BetaJS.Types.is_function(query))
			return query(object);
		return this.evaluate(query, object);
	},
	
	evaluate : function(query, object) {
		return this.__evaluate_query(query, object);
	},
/*
	__compile : function(query) {
		if (BetaJS.Types.is_array(query)) {
			if (query.length == 0)
				throw "Malformed Query";
			var op = query[0];
			if (op == "Or") {
				var s = "false";
				for (var i = 1; i < query.length; ++i)
					s += " || (" + this.__compile(query[i]) + ")";
				return s;
			} else if (op == "And") {
				var s = "true";
				for (var i = 1; i < query.length; ++i)
					s += " && (" + this.__compile(query[i]) + ")";
				return s;
			} else {
				if (query.length != 3)
					throw "Malformed Query";
				var key = query[1];
				var value = query[2];
				var left = "object['" + key + "']";
				var right = BetaJS.Types.is_string(value) ? "'" + value + "'" : value;
				return left + " " + op + " " + right;
			}
		} else if (BetaJS.Types.is_object(query)) {
			var s = "true";
			for (key in query)
				s += " && (object['" + key + "'] == " + (BetaJS.Types.is_string(query[key]) ? "'" + query[key] + "'" : query[key]) + ")";
			return s;
		} else
			throw "Malformed Query";
	},

	compile : function(query) {
		var result = this.__compile(query);
		var func = new Function('object', result);
		var func_call = function(data) {
			return func.call(this, data);
		};
		func_call.source = 'function(object){\n return ' + result + '; }';
		return func_call;		
	},
*/	
	emulate: function (query, query_function, query_context) {
		var raw = query_function.apply(query_context || this, {});
		var iter = raw;
		if (!raw)
			iter = BetaJS.Iterators.ArrayIterator([]);
		else if (BetaJS.Types.is_array(raw))
			iter = BetaJS.Iterators.ArrayIterator(raw);		
		return new BetaJS.Iterators.FilteredIterator(iter, function(row) {
			return BetaJS.Queries.evaluate(query, row);
		});
	}	
	
}; 
BetaJS.Queries.Constrained = {
	
	make: function (query, options) {
		return {
			query: query,
			options: options || {}
		};
	},
	
	is_constrained: function (query) {
		return query && (query.query || query.options);
	},
	
	format: function (instance) {
		var query = instance.query;
		instance.query = BetaJS.Queries.format(query);
		var result = JSON.stringify(instance);
		instance.query = query;
		return result;
	},
	
	normalize: function (constrained_query) {
		return {
			query: "query" in constrained_query ? BetaJS.Queries.normalize(constrained_query.query) : {},
			options: {
				skip: "options" in constrained_query && "skip" in constrained_query.options ? constrained_query.options.skip : null,
				limit: "limit" in constrained_query && "limit" in constrained_query.options ? constrained_query.options.limit : null,
				sort: "sort" in constrained_query && "sort" in constrained_query.options ? constrained_query.options.sort : {}
			}
		};
	},
	
	emulate: function (constrained_query, query_capabilities, query_function, query_context, callbacks) {
		var query = constrained_query.query || {};
		var options = constrained_query.options || {};
		var execute_query = {};
		var execute_options = {};
		if ("sort" in options && "sort" in query_capabilities)
			execute_options.sort = options.sort;
		// Test
		execute_query = query;
		if ("query" in query_capabilities || BetaJS.Types.is_empty(query)) {
			execute_query = query;
			if (!options.sort || ("sort" in query_capabilities)) {
				if ("skip" in options && "skip" in query_capabilities)
					execute_options.skip = options.skip;
				if ("limit" in options && "limit" in query_capabilities) {
					execute_options.limit = options.limit;
					if ("skip" in options && !("skip" in query_capabilities))
						execute_options.limit += options.skip;
				}
			}
		}  
		var params = [execute_query, execute_options];
		if (callbacks)
			params.push(callbacks);
		var success_call = function (raw) {
			var iter = raw;
			if (raw === null)
				iter = new BetaJS.Iterators.ArrayIterator([]);
			else if (BetaJS.Types.is_array(raw))
				iter = new BetaJS.Iterators.ArrayIterator(raw);		
			if (!("query" in query_capabilities || BetaJS.Types.is_empty(query)))
				iter = new BetaJS.Iterators.FilteredIterator(iter, function(row) {
					return BetaJS.Queries.evaluate(query, row);
				});
			if ("sort" in options && !("sort" in execute_options))
				iter = new BetaJS.Iterators.SortedIterator(iter, BetaJS.Comparators.byObject(options.sort));
			if ("skip" in options && !("skip" in execute_options))
				iter = new BetaJS.Iterators.SkipIterator(iter, options["skip"]);
			if ("limit" in options && !("limit" in execute_options))
				iter = new BetaJS.Iterators.LimitIterator(iter, options["limit"]);
			if (callbacks && callbacks.success)
				BetaJS.SyncAsync.callback(callbacks, "success", iter);
			return iter;
		};
		var exception_call = function (e) {
			if (callbacks && callbacks.exception)
				BetaJS.SyncAsync.callback(callbacks, "exception", e);
			else
				throw e;
		};
		if (callbacks) 
			query_function.apply(query_context || this, [execute_query, execute_options, {
				success: success_call,
				exception: exception_call,
				sync: callbacks.sync,
				context: callbacks.context || this
			}]);
		else
			try {
				var raw = query_function.apply(query_context || this, [execute_query, execute_options]);
				return success_call(raw);
			} catch (e) {
				exception_call(e);
			}
		return true;	
	},
	
	subsumizes: function (query, query2) {
		qopt = query.options || {};
		qopt2 = query2.options || {};
		qskip = qopt.skip || 0;
		qskip2 = qopt2.skip || 0;
		qlimit = qopt.limit || null;
		qlimit2 = qopt2.limit || null;
		qsort = qopt.sort;
		qsort2 = qopt2.sort;
		if (qskip > qskip2)
			return false;
		if (qlimit) {
			if (!qlimit2)
				return false;
			if (qlimit2 + qskip2 > qlimit + qskip)
				return false;
		}
		if ((qskip || qlimit) && (qsort || qsort2) && JSON.stringify(qsort) != JSON.stringify(qsort2))
			return false;
		return BetaJS.Queries.subsumizes(query.query, query2.query);
	},
	
	serialize: function (query) {
		return JSON.stringify(this.normalize(query));
	},
	
	unserialize: function (query) {
		return JSON.parse(query);
	},
	
	mergeable: function (query, query2) {
		if (BetaJS.Queries.serialize(query.query) != BetaJS.Queries.serialize(query2.query))
			return false;
		var qots = query.options || {};
		var qopts2 = query2.options || {};
		if (JSON.stringify(qopts.sort || {}) != JSON.stringify(qopts2.sort || {}))
			return false;
		if ("skip" in qopts) {
			if ("skip" in qopts2) {
				if (qopts.skip <= qopts2.skip)
					return !qopts.limit || (qopts.skip + qopts.limit >= qopts2.skip);
				else
					return !qopts2.limit || (qopts2.skip + qopts2.limit >= qopts.skip);
			} else 
				return (!qopts2.limit || (qopts2.limit >= qopts.skip));
		} else 
			return !("skip" in qopts2) || (!qopts.limit || (qopts.limit >= qopts2.skip));
	},
	
	merge: function (query, query2) {
		var qots = query.options || {};
		var qopts2 = query2.options || {};
		return {
			query: query.query,
			options: {
				skip: "skip" in qopts ? ("skip" in qopts2 ? Math.min(qopts.skip, qopts2.skip): null) : null,
				limit: "limit" in qopts ? ("limit" in qopts2 ? Math.max(qopts.limit, qopts2.limit): null) : null,
				sort: query.sort
			}
		};
	}

}; 

BetaJS.Class.extend("BetaJS.Queries.AbstractQueryModel", {
	
	register: function (query) {
	},
	
	executable: function (query) {
	}
	
});


BetaJS.Queries.AbstractQueryModel.extend("BetaJS.Queries.DefaultQueryModel", {

	constructor: function () {
		this._inherited(BetaJS.Queries.DefaultQueryModel, "constructor");
        this.__queries = {};    
	},
	
	_insert: function (query) {
		this.__queries[BetaJS.Queries.Constrained.serialize(query)] = query;
	},
	
	_remove: function (query) {
		delete this.__queries[BetaJS.Queries.Constrained.serialize(query)];
	},
	
	exists: function (query) {
		return BetaJS.Queries.Constrained.serialize(query) in this.__queries;
	},
	
	subsumizer_of: function (query) {
        if (this.exists(query))
            return query;
        var result = null;
        BetaJS.Objs.iter(this.__queries, function (query2) {
            if (BetaJS.Queries.Constrained.subsumizes(query2, query))
                result = query2;
            return !result;
        }, this);
        return result;
	},
	
	executable: function (query) {
	    return !!this.subsumizer_of(query);
	},
	
	register: function (query) {
		var changed = true;
		while (changed) {
			changed = false;
			BetaJS.Objs.iter(this.__queries, function (query2) {
				if (BetaJS.Queries.Constrained.subsumizes(query, query2)) {
					this._remove(query2);
					changed = true;
				}/* else if (BetaJS.Queries.Constrained.mergable(query, query2)) {
					this._remove(query2);
					changed = true;
					query = BetaJS.Queries.Constrained.merge(query, query2);
				} */
			}, this);
		}
		this._insert(query);
	},
	
	invalidate: function (query) {
	    var subsumizer = this.subsumizer_of(query);
	    if (subsumizer)
	       this._remove(subsumizer);
	}
	
});


BetaJS.Queries.DefaultQueryModel.extend("BetaJS.Queries.StoreQueryModel", {
	
	constructor: function (store) {
        this.__store = store;
		this._inherited(BetaJS.Queries.StoreQueryModel, "constructor");
	},
	
	initialize: function (callbacks) {
		this.__store.query({}, {}, {
		    context: this,
			success: function (result) {
				while (result.hasNext()) {
					var query = result.next();
					delete query["id"];
                    this._insert(query);
				}
				BetaJS.SyncAsync.callback(callbacks, "success");
			}, exception: function (err) {
			    BetaJS.SyncAsync.callback(callbacks, "exception", err);
			}
		});
	},
	
	_insert: function (query) {
		this._inherited(BetaJS.Queries.StoreQueryModel, "_insert", query);
		this.__store.insert(query, {});
	},
	
	_remove: function (query) {
		delete this.__queries[BetaJS.Queries.Constrained.serialize(query)];
		this.__store.query({query: query}, {}, {
		    context: this,
			success: function (result) {
				while (result.hasNext())
					this.__store.remove(result.next().id, {});
			}
		});
	}

});

BetaJS.Collections.Collection.extend("BetaJS.Collections.QueryCollection", {
	
	constructor: function (source, query, options, callbacks) {
		this._source = source;
		this._inherited(BetaJS.Collections.QueryCollection, "constructor", options);
		this._options = BetaJS.Objs.extend({
			forward_steps: null,
			backward_steps: null,
			range: null
		}, options);
		if (query !== null)
			this.set_query(query, callbacks);
	},
	
	query: function () {
		return this._query;
	},
	
	set_query: function (query, callbacks) {
		if (callbacks)
			callbacks.context = callbacks.context || this;
		this._query = BetaJS.Objs.extend({
			query: {},
			options: {}
		}, query);
		this._query.options.skip = this._query.options.skip || 0;
		this._query.options.limit = this._query.options.limit || null;
		this._query.options.sort = this._query.options.sort || {};  
		this._count = 0;
		this.__execute_query(this._query.options.skip, this._query.options.limit, true, callbacks);
	},
	
	__sub_query: function (options, callbacks) {
		this._source.query(this._query.query, options, callbacks);
	},
	
	__execute_query: function (skip, limit, clear_before, callbacks) {
		skip = Math.max(skip, 0);
		var q = {};
		if (this._query.options.sort && !BetaJS.Types.is_empty(this._query.options.sort))
			q.sort = this._query.options.sort;
		if (clear_before) {
			if (skip > 0)
				q.skip = skip;
			if (limit !== null)
				q.limit = limit;
			this.__sub_query(q, {
				context: this,
				success: function (iter) {
					var objs = iter.asArray();
					this._query.options.skip = skip;
					this._query.options.limit = limit;
					this._count = !limit || objs.length < limit ? skip + objs.length : null;
					this.clear();
					this.add_objects(objs);
					BetaJS.SyncAsync.callback(callbacks, "success");
				}
			});
		} else if (skip < this._query.options.skip) {
			limit = this._query.options.skip - skip;
			if (skip > 0)
				q.skip = skip;
			q.limit = limit;
			this.__sub_query(q, {
				context: this,
				success: function (iter) {
					var objs = iter.asArray();
					this._query.options.skip = skip;
					var added = this.add_objects(objs);
					this._query.options.limit = this._query.options.limit === null ? null : this._query.options.limit + added;
					BetaJS.SyncAsync.callback(callbacks, "success");
				}
			});
		} else if (skip >= this._query.options.skip) {
			if (this._query.options.limit !== null && (!limit || skip + limit > this._query.options.skip + this._query.options.limit)) {
				limit = (skip + limit) - (this._query.options.skip + this._query.options.limit);
				skip = this._query.options.skip + this._query.options.limit;
				if (skip > 0)
					q.skip = skip;
				if (limit)
					q.limit = limit;
				this.__sub_query(q, {
					context: this,
					success: function (iter) {
						var objs = iter.asArray();
						var added = this.add_objects(objs);
						this._query.options.limit = this._query.options.limit + added;
						if (limit > objs.length)
							this._count = skip + added;
						BetaJS.SyncAsync.callback(callbacks, "success");
					}
				});
			}
		}
	},
	
	increase_forwards: function (steps, callbacks) {
		steps = !steps ? this._options.forward_steps : steps;
		if (!steps || this._query.options.limit === null)
			return;
		this.__execute_query(this._query.options.skip + this._query.options.limit, steps, false, callbacks);
	},
	
	increase_backwards: function (steps) {
		steps = !steps ? this._options.backward_steps : steps;
		if (steps && this._query.options.skip > 0) {
			steps = Math.min(steps, this._query.options.skip);
			this.__execute_query(this._query.options.skip - steps, steps, false);
		}
	},
	
	paginate: function (index) {
		this.__execute_query(this._options.range * index, this._options.range, true);
	},
	
	paginate_index: function () {
		return !this._options.range ? null : Math.floor(this._query.options.skip / this._options.range);
	},
	
	paginate_count: function () {
		return !this._count || !this._options.range ? null : Math.ceil(this._count / this._options.range);
	},
	
	next: function () {
		var paginate_index = this.paginate_index();
		if (!paginate_index)
			return;
		var paginate_count = this.paginate_count();
		if (!paginate_count || paginate_index < this.paginate_count() - 1)
			this.paginate(paginate_index + 1);
	},
	
	prev: function () {
		var paginate_index = this.paginate_index();
		if (!paginate_index)
			return;
		if (paginate_index > 0)
			this.paginate(paginate_index - 1);
	},
	
	isComplete: function () {
		return this._count !== null;
	}
	
});



BetaJS.Collections.QueryCollection.extend("BetaJS.Collections.ActiveQueryCollection", {
	
	constructor: function (source, query, options, callbacks) {
		this._inherited(BetaJS.Collections.ActiveQueryCollection, "constructor", source, query, options, callbacks);
		source.on("create", this.__active_create, this);
		source.on("remove", this.__active_remove, this);
		source.on("update", this.__active_update, this);
	},
	
	destroy: function () {
		this._source.off(null, null, this);
		this._inherited(BetaJS.Collections.ActiveQueryCollection, "destroy");
	},
	
	is_valid: function (object) {
		return BetaJS.Queries.evaluate(this.query().query, object.getAll());
	},
	
	__active_create: function (object) {
		if (!this.is_valid(object) || this.exists(object))
			return;
		this.add(object);
		this._count = this._count + 1;
		if (this._query.options.limit !== null)
			this._query.options.limit = this._query.options.limit + 1;
	},
	
	__active_remove: function (object) {
		if (!this.exists(object))
			return;
		this.remove(object);
		this._count = this._count - 1;
		if (this._query.options.limit !== null)
			this._query.options.limit = this._query.options.limit - 1;
	},
	
	__active_update: function (object) {
		if (!this.is_valid(object))
			this.__active_remove(object);
		else
			this.__active_create(object);
	}
	
});

BetaJS.Exceptions.Exception.extend("BetaJS.Stores.StoreException");

BetaJS.Class.extend("BetaJS.Stores.ListenerStore", [
	BetaJS.Events.EventsMixin,
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.ListenerStore, "constructor");
		options = options || {};
		this._id_key = options.id_key || "id";
	},

	id_key: function () {
		return this._id_key;
	},
	
	_inserted: function (row, event_data) {
		this.trigger("insert", row, event_data);		
	},
	
	_removed: function (id, event_data) {
		this.trigger("remove", id, event_data);		
	},
	
	_updated: function (row, data, event_data) {
		this.trigger("update", row, data, event_data);		
	} 
		
}]);



/** @class */
BetaJS.Stores.BaseStore = BetaJS.Stores.ListenerStore.extend("BetaJS.Stores.BaseStore", [
	BetaJS.SyncAsync.SyncAsyncMixin,
	/** @lends BetaJS.Stores.BaseStore.prototype */
	{
		
	constructor: function (options) {
		this._inherited(BetaJS.Stores.BaseStore, "constructor", options);
		options = options || {};
		this._id_key = options.id_key || "id";
		this._create_ids = options.create_ids || false;
		this._last_id = 1;
		this._supportsSync = true;
		this._supportsAsync = true;
		this._query_model = "query_model" in options ? options.query_model : null;
	},
	
    query_model: function () {
        if (arguments.length > 0)
            this._query_model = arguments[0];
        return this._query_model;
    },
    
	/** Insert data to store. Return inserted data with id.
	 * 
 	 * @param data data to be inserted
 	 * @return data that has been inserted with id.
 	 * @exception if it fails
	 */
	_insert: function (data, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: insert");
	},
	
	/** Remove data from store. Return removed data.
	 * 
 	 * @param id data id
 	 * @exception if it fails
	 */
	_remove: function (id, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: remove");
	},
	
	/** Get data from store by id.
	 * 
	 * @param id data id
	 * @return data
	 * @exception if it fails
	 */
	_get: function (id, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: get");
	},
	
	/** Update data by id.
	 * 
	 * @param id data id
	 * @param data updated data
	 * @return data from store
	 * @exception if it fails
	 */
	_update: function (id, data, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: update");
	},
	
	_query_capabilities: function () {
		return {};
	},
	
	/*
	 * @exception if it fails
	 */
	_query: function (query, options, callbacks) {
		throw new BetaJS.Stores.StoreException("unsupported: query");
	},
	
	insert: function (data, callbacks) {
		var event_data = null;
		if (BetaJS.Types.is_array(data)) {
			event_data = data[1];
			data = data[0];
		}			
		if (this._create_ids && !(this._id_key in data && data[this._id_key])) {
			while (this.get(this._last_id))
				this._last_id++;
			data[this._id_key] = this._last_id;
		}
		return this.then(this._insert, [data], callbacks, function (row, callbacks) {
			this._inserted(row, event_data);
			BetaJS.SyncAsync.callback(callbacks, "success", row);
		});
	},
	
	insert_all: function (data, callbacks, query) {
		var event_data = null;
		if (arguments.length > 3)
			event_data = arguments[3];
		if (query && this._query_model) {
			this.trigger("query_register", query);
			this._query_model.register(query);
		}
		if (callbacks) {
			var self = this;
			var f = function (i) {
				if (i >= data.length) {
					BetaJS.SyncAsync.callback(callbacks, "success");
					return;
				}
				this.insert(event_data ? [data[i], event_data] : data[i], BetaJS.SyncAsync.mapSuccess(callbacks, function () {
					f.call(self, i + 1);
				}));
			};
			f.call(this, 0);
		} else {
			for (var i = 0; i < data.length; ++i)
				this.insert(event_data ? [data[i], event_data] : data[i]);
		}
	},

	remove: function (id, callbacks) {
		var event_data = null;
		if (BetaJS.Types.is_array(id)) {
			event_data = id[1];
			id = id[0];
		}			
		return this.then(this._remove, [id], callbacks, function (result, callbacks) {
			this._removed(id, event_data);
			BetaJS.SyncAsync.callback(callbacks, "success", id);
		});
	},
	
	get: function (id, callbacks) {
		return this.delegate(this._get, [id], callbacks);
	},
	
	update: function (id, data, callbacks) {
		var event_data = null;
		if (BetaJS.Types.is_array(data)) {
			event_data = data[1];
			data = data[0];
		}			
		return this.then(this._update, [id, data], callbacks, function (row, callbacks) {
			this._updated(row, data, event_data);
			BetaJS.SyncAsync.callback(callbacks, "success", row, data);
		});
	},
	
	query: function (query, options, callbacks) {
		if (options) {
			if (options.limit)
				options.limit = parseInt(options.limit, 10);
			if (options.skip)
				options.skip = parseInt(options.skip, 10);
		}
		if (this._query_model) {
		    var subsumizer = this._query_model.subsumizer_of({query: query, options: options});
    		if (!subsumizer) {
    			this.trigger("query_miss", {query: query, options: options});
    			var e = new BetaJS.Stores.StoreException("Cannot execute query");
    			if (callbacks)
    			    BetaJS.SyncAsync.callback(callbacks, "exception", e);
    			else
    				throw e;
    			return null;
    		} else
    		    this.trigger("query_hit", {query: query, options: options}, subsumizer);
		}
		var q = function (callbacks) {
			return BetaJS.Queries.Constrained.emulate(
				BetaJS.Queries.Constrained.make(query, options || {}),
				this._query_capabilities(),
				this._query,
				this,
				callbacks);			
		};
		return this.either(callbacks, q, q);
	},
	
	_query_applies_to_id: function (query, id) {
		var row = this.get(id);
		return row && BetaJS.Queries.overloaded_evaluate(query, row);
	},
	
	clear: function (callbacks) {
		return this.then(this.query, [{}, {}], callbacks, function (iter, callbacks) {
			var promises = [];
			while (iter.hasNext())
				promises.push(this.remove, [iter.next().id]);
			return this.join(promises, callbacks);
		});
	},
	
	_ensure_index: function (key) {
	},
	
	ensure_index: function (key) {
		this._ensure_index(key);
	},
	
	perform: function (commit, callbacks) {
		var action = BetaJS.Objs.keyByIndex(commit);
		var data = BetaJS.Objs.valueByIndex(commit);
		if (action == "insert")
			this.insert(data, callbacks);
		else if (action == "remove")
			this.remove(data, callbacks);
		else if (action == "update")
			this.update(BetaJS.Objs.keyByIndex(data), BetaJS.Objs.valueByIndex(data), callbacks);
		else
			throw new BetaJS.Stores.StoreException("unsupported: perform " + action);
	},
	
	bulk: function (commits, optimistic, callbacks) {
		var result = [];
		if (callbacks) {
			var helper = function () {
				if (result.length < commits.length) {
					this.perform(commits[result.length], {
						context: this,
						success: function () {
							result.push(true);
							helper.apply(this);
						},
						exception: function (e) {
							result.push(false);
							if (optimistic)
								helper.apply(this);
							else
								callbacks.exception.apply(callbacks.context || this, e);
						}
					});
				} else
					callbacks.success.call(callbacks.context || this, result);
			};
			helper.apply(this);
		} else {
			for (var i = 0; i < commits.length; ++i) {
				try {
					this.perform(commits[i]);
					result.push(true);
				} catch (e) {
					result.push(false);
					if (!optimistic)
						throw e;
				}
			}
		}
		return result;
	}	

}]);

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.AssocStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	_iterate: function () {},
	
	constructor: function (options) {
		options = options || {};
		options.create_ids = true;
		this._inherited(BetaJS.Stores.AssocStore, "constructor", options);
		this._supportsAsync = false;
	},
	
	_insert: function (data) {
		this._write_key(data[this._id_key], data);
		return data;
	},
	
	_remove: function (id) {
		var row = this._read_key(id);
		if (row && !this._remove_key(id))
			return null;
		return row;
	},
	
	_get: function (id) {
		return this._read_key(id);
	},
	
	_update: function (id, data) {
		var row = this._get(id);
		if (row) {
		    if (this._id_key in data) {
		        this._remove_key(id);
                id = data[this._id_key];
                delete data[this._id_key];
		    }
			BetaJS.Objs.extend(row, data);
			this._write_key(id, row);
		}
		return row;
	},
	
	_query: function (query, options) {
		return this._iterate();
	}

});

// Stores everything temporarily in the browser's memory

BetaJS.Stores.AssocStore.extend("BetaJS.Stores.MemoryStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.MemoryStore, "constructor", options);
		this.__data = {};
	},

	_read_key: function (key) {
		return this.__data[key];
	},
	
	_write_key: function (key, value) {
		this.__data[key] = value;
	},
	
	_remove_key: function (key) {
		delete this.__data[key];
	},
	
	_iterate: function () {
		return new BetaJS.Iterators.ObjectValuesIterator(this.__data);
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DumbStore", {
	
	_read_last_id: function () {},
	_write_last_id: function (id) {},
	_remove_last_id: function () {},
	_read_first_id: function () {},
	_write_first_id: function (id) {},
	_remove_first_id: function () {},
	_read_item: function (id) {},
	_write_item: function (id, data) {},
	_remove_item: function (id) {},
	_read_next_id: function (id) {},
	_write_next_id: function (id, next_id) {},
	_remove_next_id: function (id) {},
	_read_prev_id: function (id) {},
	_write_prev_id: function (id, prev_id) {},
	_remove_prev_id: function (id) {},
	
	constructor: function (options) {
		options = options || {};
		options.create_ids = true;
		this._inherited(BetaJS.Stores.DumbStore, "constructor", options);
		this._supportsAsync = false;
	},

	_insert: function (data) {
		var last_id = this._read_last_id();
		var id = data[this._id_key];
		if (last_id !== null) {
			this._write_next_id(last_id, id);
			this._write_prev_id(id, last_id);
		} else
			this._write_first_id(id);
		this._write_last_id(id);
		this._write_item(id, data);
		return data;
	},
	
	_remove: function (id) {
		var row = this._read_item(id);
		if (row) {
			this._remove_item(id);
			var next_id = this._read_next_id(id);
			var prev_id = this._read_prev_id(id);
			if (next_id !== null) {
				this._remove_next_id(id);
				if (prev_id !== null) {
					this._remove_prev_id(id);
					this._write_next_id(prev_id, next_id);
					this._write_prev_id(next_id, prev_id);
				} else {
					this._remove_prev_id(next_id);
					this._write_first_id(next_id);
				}
			} else if (prev_id !== null) {
				this._remove_next_id(prev_id);
				this._write_last_id(prev_id);
			} else {
				this._remove_first_id();
				this._remove_last_id();
			}
		}
		return row;
	},
	
	_get: function (id) {
		return this._read_item(id);
	},
	
	_update: function (id, data) {
		var row = this._get(id);
		if (row) {
			delete data[this._id_key];
			BetaJS.Objs.extend(row, data);
			this._write_item(id, row);
		}
		return row;
	},
	
	_query_capabilities: function () {
		return {
			query: true
		};
	},

	_query: function (query, options) {
		var iter = new BetaJS.Iterators.Iterator();
		var store = this;
		var fid = this._read_first_id();
		BetaJS.Objs.extend(iter, {
			__id: fid === null ? 1 : fid,
			__store: store,
			__query: query,
			
			hasNext: function () {
				var last_id = this.__store._read_last_id();
				if (last_id === null)
					return false;
				while (this.__id < last_id && !this.__store._read_item(this.__id))
					this.__id++;
				while (this.__id <= last_id) {
					if (this.__store._query_applies_to_id(query, this.__id))
						return true;
					if (this.__id < last_id)
						this.__id = this.__store._read_next_id(this.__id);
					else
						this.__id++;
				}
				return false;
			},
			
			next: function () {
				if (this.hasNext()) {
					var item = this.__store.get(this.__id);
					if (this.__id == this.__store._read_last_id())
						this.__id++;
					else
						this.__id = this.__store._read_next_id(this.__id);
					return item;
				}
				return null;
			}
		});
		return iter;
	}	
	
});

BetaJS.Stores.DumbStore.extend("BetaJS.Stores.AssocDumbStore", {
	
	_read_key: function (key) {},
	_write_key: function (key, value) {},
	_remove_key: function (key) {},
	
	__read_id: function (key) {
		var raw = this._read_key(key);
		return raw ? parseInt(raw, 10) : null;
	},
	
	_read_last_id: function () {
		return this.__read_id("last_id");
	},
	
	_write_last_id: function (id) {
		this._write_key("last_id", id);
	},

	_remove_last_id: function () {
		this._remove_key("last_id");
	},

	_read_first_id: function () {
		return this.__read_id("first_id");
	},
	
	_write_first_id: function (id) {
		this._write_key("first_id", id);
	},
	
	_remove_first_id: function () {
		this._remove_key("first_id");
	},

	_read_item: function (id) {
		return this._read_key("item_" + id);
	},

	_write_item: function (id, data) {
		this._write_key("item_" + id, data);
	},
	
	_remove_item: function (id) {
		this._remove_key("item_" + id);
	},
	
	_read_next_id: function (id) {
		return this.__read_id("next_" + id);
	},

	_write_next_id: function (id, next_id) {
		this._write_key("next_" + id, next_id);
	},
	
	_remove_next_id: function (id) {
		this._remove_key("next_" + id);
	},
	
	_read_prev_id: function (id) {
		return this.__read_id("prev_" + id);
	},

	_write_prev_id: function (id, prev_id) {
		this._write_key("prev_" + id, prev_id);
	},

	_remove_prev_id: function (id) {
		this._remove_key("prev_" + id);
	}
	
});

// Stores everything permanently in the browser's local storage

BetaJS.Stores.AssocDumbStore.extend("BetaJS.Stores.LocalStore", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Stores.LocalStore, "constructor", options);
		this.__prefix = options.prefix;
	},
	
	__key: function (key) {
		return this.__prefix + key;
	},
	
	_read_key: function (key) {
		var prfkey = this.__key(key);
		return prfkey in localStorage ? JSON.parse(localStorage[prfkey]) : null;
	},
	
	_write_key: function (key, value) {
		localStorage[this.__key(key)] = JSON.stringify(value);
	},
	
	_remove_key: function (key) {
		delete localStorage[this.__key(key)];
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.DualStore", {
	
	constructor: function (first, second, options) {
		options = BetaJS.Objs.extend({
			create_options: {},
			update_options: {},
			delete_options: {},
			get_options: {},
			query_options: {}
		}, options || {});
		options.id_key = first._id_key;
		this.__first = first;
		this.__second = second;
		this._inherited(BetaJS.Stores.DualStore, "constructor", options);
		this._supportsSync = first.supportsSync() && second.supportsSync();
		this._supportsAsync = first.supportsAsync() || second.supportsAsync();
		this.__create_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then", // "or", "single"
			auto_replicate: "first" // "first", "second", "both", "none"
		}, options.create_options);
		this.__update_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then", // "or", "single"
			auto_replicate: "first" // "first", "second", "both", "none"
		}, options.update_options);
		this.__remove_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "then", // "or", "single",
			auto_replicate: "first" // "first", "second", "both", "none"
		}, options.delete_options);
		this.__get_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "or", // "single"
			clone: true, // false
			clone_second: false,
			or_on_null: true // false
		}, options.get_options);
		this.__query_options = BetaJS.Objs.extend({
			start: "first", // "second"
			strategy: "or", // "single"
			clone: true, // false
			clone_second: false,
			or_on_null: true // false
		}, options.query_options);
		this.__first.on("insert", this.__inserted_first, this);
		this.__second.on("insert", this.__inserted_second, this);
		this.__first.on("update", this.__updated_first, this);
		this.__second.on("update", this.__updated_second, this);
		this.__first.on("remove", this.__removed_first, this);
		this.__second.on("remove", this.__removed_second, this);
	},
	
	__inserted_first: function (row, event_data) {
		if (event_data && event_data.dual_insert)
			return;
		if (this.__create_options.auto_replicate == "first" || this.__create_options.auto_replicate == "both")
			this.__second.insert([row, {dual_insert: true}], {});
		this._inserted(row);
	},
	
	__inserted_second: function (row, event_data) {
		if (event_data && event_data.dual_insert)
			return;
		if (this.__create_options.auto_replicate == "second" || this.__create_options.auto_replicate == "both")
			this.__first.insert([row, {dual_insert: true}], {});
		this._inserted(row);
	},

	__updated_first: function (row, update, event_data) {
		if (event_data && event_data.dual_update)
			return;
		if (this.__update_options.auto_replicate == "first" || this.__update_options.auto_replicate == "both")
			this.__second.update(row[this.id_key()], [update, {dual_update: true}], {});
		this._updated(row, update);
	},
	
	__updated_second: function (row, update, event_data) {
		if (event_data && event_data.dual_update)
			return;
		if (this.__update_options.auto_replicate == "second" || this.__update_options.auto_replicate == "both")
			this.__first.update(row[this.id_key()], [update, {dual_update: true}], {});
		this._updated(row, update);
	},

	__removed_first: function (id, event_data) {
		if (event_data && event_data.dual_remove)
			return;
		if (this.__remove_options.auto_replicate == "first" || this.__remove_options.auto_replicate == "both")
			this.__second.remove([id, {dual_remove: true}], {});
		this._removed(id);
	},
	
	__removed_second: function (id, event_data) {
		if (event_data && event_data.dual_remove)
			return;
		if (this.__remove_options.auto_replicate == "second" || this.__remove_options.auto_replicate == "both")
			this.__first.remove([id, {dual_remove: true}], {});
		this._removed(id);
	},

	first: function () {
		return this.__first;
	},
	
	second: function () {
		return this.__second;
	},

	_insert: function (data, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__create_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__create_options.strategy;
		if (callbacks) {
			if (strategy == "then")
				first.insert([data, {dual_insert: true}], {
					success: function (row) {
						second.insert([row, {dual_insert: true}], callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.insert([data, {dual_insert: true}], {
					success: callbacks.success,
					exception: function () {
						second.insert([data, {dual_insert: true}], callbacks);
					}
				});
			else
				first.insert([data, {dual_insert: true}], callbacks);
		} else {
			if (strategy == "then")
				return second.insert([first.insert([data, {dual_insert: true}]), {dual_insert: true}]);
			else if (strategy == "or")
				try {
					return first.insert([data, {dual_insert: true}]);
				} catch (e) {
					return second.insert([data, {dual_insert: true}]);
				}
			else
				return first.insert([data, {dual_insert: true}]);
		}
		return true;
	},

	_update: function (id, data, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__update_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__update_options.strategy;
		if (callbacks) {
			if (strategy == "then")
				first.update(id, [data, {dual_update: true}], {
					success: function (row) {
						second.update(id, [row, {dual_update: true}], callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				return first.update(id, [data, {dual_update: true}], {
					success: callbacks.success,
					exception: function () {
						second.update(id, [data, {dual_update: true}], callbacks);
					}
				});
			else
				first.update(id, [data, {dual_update: true}], callbacks);
		} else {
			if (strategy == "then")
				return second.update(id, [first.update(id, [data, {dual_update: true}]), {dual_update: true}]);
			else if (strategy == "or")
				try {
					return first.update(id, [data, {dual_update: true}]);
				} catch (e) {
					return second.update(id, [data, {dual_update: true}]);
				}
			else
				return first.update(id, [data, {dual_update: true}]);
		}
		return true;
	},

	_remove: function (id, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__remove_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__remove_options.strategy;
		if (callbacks) {
			if (strategy == "then")
				first.remove([id, {dual_remove: true}], {
					success: function () {
						second.remove([id, {dual_remove: true}], callbacks);
					},
					exception: callbacks.exception
				});
			else if (strategy == "or")
				first.remove([id, {dual_remove: true}], {
					success: callbacks.success,
					exception: function () {
						second.remove([id, {dual_remove: true}], callbacks);
					}
				});
			else
				first.remove(id, callbacks);
		} else {
			if (strategy == "then") {
				first.remove([id, {dual_remove: true}]);
				second.remove([id, {dual_remove: true}]);
			}
			else if (strategy == "or")
				try {
					first.remove([id, {dual_remove: true}]);
				} catch (e) {
					second.remove([id, {dual_remove: true}]);
				}
			else
				first.remove([id, {dual_remove: true}]);
		}
	},

	_query_capabilities: function () {
		return {
			"query": true,
			"sort": true,
			"limit": true,
			"skip": true
		};
	},

	_get: function (id, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__get_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__get_options.strategy;
		var clone = this.__get_options.clone;
		var clone_second = this.__get_options.clone_second;
		var or_on_null = this.__get_options.or_on_null;
		var result = null;
		if (strategy == "or") {
			var fallback = function (callbacks) {
				second.get(id, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
					if (result && clone)
						first.delegate(first.insert, [result], callbacks);
					else
						this.callback(callbacks, "success", result);
				}));
			};
			return first.then(first.get, [id], callbacks, function (result, callbacks) {
				if (!result && or_on_null) {
					fallback(callbacks);
					return;
				}
				if (clone_second) {
					second.get(id, {
						success: function (row) {
							if (row)
								this.callback(callbacks, "success", result);
							else
								second.insert(result, callbacks);
						},
						exception: function () {
							second.insert(result, callbacks);
						}
					});
				} else
					this.callback(callbacks, "success", result);
			}, function (error, callbacks) {
				fallback(callbacks);
			});
		} else
			return first.get(id, callbacks);
	},

	_query: function (query, options, callbacks) {
		var first = this.__first;
		var second = this.__second;
		if (this.__query_options.start != "first") {
			first = this.__second;
			second = this.__first;
		}
		var strategy = this.__query_options.strategy;
		var clone = this.__query_options.clone;
		var clone_second = this.__get_options.clone_second;
		var or_on_null = this.__query_options.or_on_null;
		var result = null;
		if (strategy == "or") {
			var fallback = function (callbacks) {
				this.trigger("query_second", query, options);
				second.query(query, options, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
					if (result && clone) {
						arr = result.asArray();
						result = new BetaJS.Iterators.ArrayIterator(arr);
						var cb = BetaJS.SyncAsync.mapSuccess(callbacks, function () {
							BetaJS.SyncAsync.callback(callbacks, "success", result);
						});
						first.insert_all(arr, cb, {query: query, options: options}, {dual_insert: true});				
					} else
						BetaJS.SyncAsync.callback(callbacks, "success", result);
				}));
				return result;
			};
			var insert_second = function (result, callbacks) {
				arr = result.asArray();
				result = new BetaJS.Iterators.ArrayIterator(arr);
				var cb = BetaJS.SyncAsync.mapSuccess(callbacks, function () {
					BetaJS.SyncAsync.callback(callbacks, "success", result);
				});
				second.insert_all(arr, cb, {query: query, options: options}, {dual_insert: true});				
			};
			this.trigger("query_first", query, options);
			return this.then(first, first.query, [query, options], callbacks, function (result, callbacks) {
				if (!result && or_on_null) {
					fallback.call(this, callbacks);
					return;
				}
				if (clone_second) {
					this.trigger("query_second", query, options);
					second.query(query, options, {
						success: function (result2) {
							if (result2) 
								this.callback(callbacks, "success", result);
							else
								insert_second(result, callbacks);
						}, exception: function () {
							insert_second(result, callbacks);
						}
					});
				} else {
					this.callback(callbacks, "success", result);
				}
			}, function (error, callbacks) {
				fallback.call(this, callbacks);
			});
		} else {
			this.trigger("query_first", query, options);
			return first.query(query, options, callbacks);
		}
	}

});

BetaJS.Stores.DualStore.extend("BetaJS.Stores.CachedStore", {
	constructor: function (parent, options) {
		options = options || {};
		var cache_store = options.cache_store;
		if (!("cache_store" in options)) {
		    cache_store = this._auto_destroy(new BetaJS.Stores.MemoryStore({
                id_key: parent.id_key()
            }));
        }
        if (!cache_store.query_model())
            cache_store.query_model(options.cache_query_model ? options.cache_query_model : this._auto_destroy(new BetaJS.Queries.DefaultQueryModel()));
        this.__invalidation_options = options.invalidation || {};
		this._inherited(BetaJS.Stores.CachedStore, "constructor",
			parent,
			cache_store,
			BetaJS.Objs.extend({
				get_options: {
					start: "second",
					strategy: "or"
				},
				query_options: {
					start: "second",
					strategy: "or",
					clone: true,
					or_on_null: false
				}
			}, options));
	   if (this.__invalidation_options.reload_after_first_hit) {
	       this.__queries = {};
	       this.cache().on("query_hit", function (query, subsumizer) {
	           var s = BetaJS.Queries.Constrained.serialize(subsumizer);
	           if (!this.__queries[s]) {
	               this.__queries[s] = true;
	               BetaJS.SyncAsync.eventually(function () {
	                   this.invalidate_query(subsumizer, true);	                   
	               }, [], this);
	           }
	       }, this);
           this.cache().on("query_miss", function (query) {
               var s = BetaJS.Queries.Constrained.serialize(query);
               this.__queries[s] = true;
           }, this);
	   }
	},
	
	destroy: function () {
	    this.cache().off(null, null, this);
	    this._inherited(BetaJS.Stores.CachedStore, "destroy");    
	},
	
	invalidate_query: function (query, reload) {
	    this.cache().query_model().invalidate(query);
	    if (reload) {
	        if (this.supportsAsync())
	           this.query(query.query, query.options, {});
	        else
	           this.query(query.query, query.options);
	    }
        this.trigger("invalidate_query", query, reload);
	},
	
	cache: function () {
		return this.second();
	},
	
	store: function () {
		return this.first();
	}
});
BetaJS.Stores.BaseStore.extend("BetaJS.Stores.ConversionStore", {
	
	constructor: function (store, options) {
		options = options || {};
		options.id_key = store._id_key;
		this._inherited(BetaJS.Stores.ConversionStore, "constructor", options);
		this.__store = store;
		this.__key_encoding = options["key_encoding"] || {};
		this.__key_decoding = options["key_decoding"] || {};
		this.__value_encoding = options["value_encoding"] || {};
		this.__value_decoding = options["value_decoding"] || {};
	},
	
	encode_object: function (obj) {
		var result = {};
		for (var key in obj) {
		    var encoded_key = this.encode_key(key);
		    if (encoded_key)
			    result[encoded_key] = this.encode_value(key, obj[key]);
		}
		return result;
	},
	
	decode_object: function (obj) {
		var result = {};
		for (var key in obj) {
		    var decoded_key = this.decode_key(key);
		    if (decoded_key)
			    result[decoded_key] = this.decode_value(key, obj[key]);
	    }
		return result;
	},
	
	encode_key: function (key) {
		return key in this.__key_encoding ? this.__key_encoding[key] : key;
	},
	
	decode_key: function (key) {
		return key in this.__key_decoding ? this.__key_decoding[key] : key;
	},
	
	encode_value: function (key, value) {
		return key in this.__value_encoding ? this.__value_encoding[key](value) : value;
	},
	
	decode_value: function (key, value) {
		return key in this.__value_decoding ? this.__value_decoding[key](value) : value;
	},	

	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},
	
	_ensure_index: function (key) {
		return this.__store.ensure_index(key);
	},
	
	_insert: function (data, callbacks) {
		return this.then(this.__store, this.__store.insert, [this.encode_object(data)], callbacks, function (result, callbacks) {
			callbacks.success(this.decode_object(result));
		});
	},
	
	_remove: function (id, callbacks) {
		return this.delegate(this.__store, this.__store.remove, [this.encode_value(this._id_key, id)], callbacks);
	},

	_get: function (id, callbacks) {
		return this.then(this.__store, this.__store.get, [this.encode_value(this._id_key, id)], callbacks, function (result, callbacks) {
			callbacks.success(this.decode_object(result));
		});
	},
	
	_update: function (id, data, callbacks) {
		return this.then(this.__store, this.__store.update, [this.encode_value(this._id_key, id), this.encode_object(data)], callbacks, function (result, callbacks) {
			callbacks.success(this.decode_object(result));
		});
	},
	
	_query: function (query, options, callbacks) {
		return this.then(this.__store, this.__store.query, [this.encode_object(query), options], callbacks, function (result, callbacks) {
			var mapped = new BetaJS.Iterators.MappedIterator(result, function (row) {
				return this.decode_object(row);
			}, this);
			callbacks.success(mapped);
		});
	}		

});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.PassthroughStore", {
	
	constructor: function (store, options) {
		this.__store = store;
		options = options || {};
		options.id_key = store.id_key();
		this._projection = options.projection || {};
		this._inherited(BetaJS.Stores.PassthroughStore, "constructor", options);
		this._supportsAsync = store.supportsAsync();
		this._supportsSync = store.supportsSync();
        if (options.destroy_store)
            this._auto_destroy(store);
	},
	
	_query_capabilities: function () {
		return this.__store._query_capabilities();
	},

	_insert: function (data, callbacks) {
		return this.__store.insert(BetaJS.Objs.extend(data, this._projection), callbacks);
	},
	
	_remove: function (id, callbacks) {
		return this.__store.remove(id, callbacks);
	},
	
	_get: function (id, callbacks) {
		return this.__store.get(id, callbacks);
	},
	
	_update: function (id, data, callbacks) {
		return this.__store.update(id, data, callbacks);
	},
	
	_query: function (query, options, callbacks) {
		return this.__store.query(BetaJS.Objs.extend(query, this._projection), options, callbacks);
	},
	
	_ensure_index: function (key) {
		return this.__store.ensure_index(key);
	},
	
	_store: function () {
		return this.__store;
	}

});



BetaJS.Stores.PassthroughStore.extend("BetaJS.Stores.ActiveStore", {
	
	constructor: function (store, listener, options) {
		this._inherited(BetaJS.Stores.ActiveStore, "constructor", store, options);
		this.__listener = listener;
		this.delegateEvents(null, listener);
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.SocketStore", {
	
	constructor: function (options, socket, prefix) {
		this._inherited(BetaJS.Stores.SocketStore, "constructor", options);
		this.__socket = socket;
		this.__prefix = prefix;
		this._supportsAsync = false;
	},
	
	__send: function (action, data) {
		this.__socket.emit(this.__prefix + ":" + action, data);
	},
	
	_insert: function (data) {
		this.__send("insert", data);
	},
	
	_remove: function (id) {
		this.__send("remove", id);
	},
	
	_update: function (id, data) {
		this.__send("update", BetaJS.Objs.objectBy(id, data));
	},
	
	bulk: function (commits, optimistic, callbacks) {
		this.__send("bulk", commits);
	}	
	
});


BetaJS.Stores.ListenerStore.extend("BetaJS.Stores.SocketListenerStore", {

	constructor: function (options, socket, prefix) {
		this._inherited(BetaJS.Stores.SocketListenerStore, "constructor", options);
		var self = this;
		this.__prefix = prefix;
		socket.on(this.__prefix + ":insert", function (data) {
			self._perform("insert", data);
		});
		socket.on(this.__prefix + ":remove", function (id) {
			self._perform("remove", id);
		});
		socket.on(this.__prefix + ":update", function (data) {
			self._perform("update", data);
		});
		socket.on(this.__prefix + ":bulk", function (commits) {
			for (var i = 0; i < commits.length; ++i)
				self._perform(BetaJS.Objs.keyByIndex(commits[i]), BetaJS.Objs.valueByIndex(commits[i]));
		});
	},
	
	_perform: function (action, data) {
		if (action == "insert")
			this._inserted(data);
		else if (action == "remove")
			this._removed(data);
		else if (action == "update")
			this._updated(BetaJS.Objs.objectBy(this.id_key(), BetaJS.Objs.keyByIndex(data)), BetaJS.Objs.valueByIndex(data));
		else
			throw new BetaJS.Stores.StoreException("unsupported: perform " + action);
	}

});
BetaJS.Class.extend("BetaJS.Stores.StoresMonitor", [
	BetaJS.Events.EventsMixin,
{
	attach: function (ident, store) {
		store.on("insert", function (row) {
			this.trigger("insert", ident, store, row);
			this.trigger("write", "insert", ident, store, row);
		}, this);
		store.on("remove", function (id) {
			this.trigger("remove", ident, store, id);
			this.trigger("write", "remove", ident, store, id);
		}, this);
		store.on("update", function (row, data) {
			this.trigger("update", ident, store, row, data);
			this.trigger("write", "update", ident, store, row, data);
		}, this);
	}
		
}]);

BetaJS.Class.extend("BetaJS.Stores.StoreHistory", [BetaJS.Events.EventsMixin, {

    constructor : function(store, options) {
        this._inherited(BetaJS.Stores.StoreHistory, "constructor");
        options = options || {};
        this._combine_update_update = options.combine_update_update || false;
        this._combine_insert_update = options.combine_insert_update || false;
        this._combine_insert_remove = options.combine_insert_remove || false;
        this._combine_update_remove = options.combine_update_remove || false;
        this._commits = options.commits_store;
        if (!this._commits)
            this._commits = this._auto_destroy(new BetaJS.Stores.MemoryStore());
        this._revision_id = 0;
        this._store = store;
        this._item_commits = options.item_commits_store;
        if (!this._item_commits)
            this._item_commits = this._auto_destroy(new BetaJS.Stores.MemoryStore());
        this._store.on("insert", function(data) {
            this.__add_commit({
                action : "insert",
                object_id : data[this._store.id_key()],
                data : data
            });
        }, this);
        this._store.on("remove", function(id) {
            this.__add_commit({
                action : "remove",
                object_id : id
            });
        }, this);
        this._store.on("update", function(id, data) {
            this.__add_commit({
                action : "update",
                object_id : id,
                data : data
            });
        }, this);
    },

    __remove_commit : function(revision_id) {
        this._commits.get(revision_id, {
            context : this,
            success : function(commit) {
                this.trigger("remove", commit);
                this._commits.remove(revision_id, {
                    context : this,
                    success : function() {
                        var id = commit.object_id;
                        this._item_commits.get(id, {
                            context : this,
                            success : function(item_commit) {
                                delete item_commit.commits[revision_id];
                                if (BetaJS.Objs.is_empty(item_commit.commits))
                                    this._item_commits.remove(id, {});
                                else
                                    this._item_commits.update(id, {
                                        commits : item_commit.commits
                                    }, {});
                            }
                        });
                    }
                });
            }
        });
    },

    __add_commit : function(object, callbacks) {
        object.id = this._new_revision_id();
        this._revision_id = object.id;
        var has_insert = false;
        var has_update = false;
        var last_rev_id = null;
        var last_rev_data = {};
        var cont = function () {
            this._commits.insert(object, {}, {
                context: this,
                success: function (item_commits) {
                    item_commits.commits[object.id] = true;
                    if (item_commits.id)
                        this._item_commits.update(item_commits.id, item_commits, {});
                    else
                        this._item_commits.insert(item_commits, {});
                    this.trigger("commit", object);
                    if (object.action == "update") {
                        if ((this._combine_insert_update && !has_update && has_insert) || (this._combine_update_update && has_update)) {
                            this.__remove_commit(object.id);
                            this._commits.update(last_rev_id, BetaJS.Objs.extend(last_rev_data, object.data), {});
                        }
                    } else if (object.action == "remove") {
                        for (rev_id in item_commits.commits) {
                            this._commits.get(rev_id, {
                                context: this,
                                success: function (obj) {
                                    if ((has_insert && this._combine_insert_remove) || (obj.action == "update" && this._combine_update_remove))
                                        this.__remove_commit(rev_id);
                                }
                            });
                        }
                    }
                }
            });
        };
        this._item_commits.get(object.object_id, {
            context: this,
            success: function (item_commits) {
                var promises = [];
                for (var rev_id in item_commits.commits)
                    promises.push(BetaJS.SyncAsync.promise(this._commits, this._commits.get, [rev_id]));
                BetaJS.SyncAsync.join(promises, {
                    context: this,
                    success: function (commits) {
                        while (commits.hasNext()) {
                            var obj = commits.next();
                            has_insert = has_insert || obj.action == "insert";
                            has_update = has_update || obj.action == "update";
                            if (obj.id > last_rev_id) {
                                last_rev_id = obj.id;
                                last_rev_data = obj.data;
                            }
                        }
                        cont.apply(this, item_commits);
                    },
                    failure: function () {
                        cont.call(this, {commits: {}});
                    }
                });
            }
        });
    },

    flush : function(revision_id) {
        this._commits.query({
            "id" : {
                "$le" : revision_id || this._revision_id
            }
        }, {}, {
            context : this,
            success : function(commits) {
                var result = [];
                while (commits.hasNext())
                    this.__remove_commit(commits.next().id, {});
            }
        });
    },

    serialize_by_id : function(revision_id, callbacks) {
        this._commits.get(revision_id, {
            context : this,
            success : function(commit) {
                BetaJS.SyncAsync.callback(callbacks, "success", this.serialize(commit));
            }
        });
    },

    serialize : function(commit) {
        var result = null;
        if (commit.action == "insert")
            result = {
                "insert" : commit.data
            };
        else if (commit.action == "remove")
            result = {
                "remove" : commit.object_id
            };
        else if (commit.action == "update")
            result = {
                "update" : BetaJS.Objs.objectBy(commit.object_id, commit.data)
            };
        return result;
    },

    serialize_bulk : function(revision_id, callbacks) {
        this._commits.query({
            "id" : {
                "$le" : revision_id || this._revision_id
            }
        }, {}, {
            context : this,
            success : function(commits) {
                var result = [];
                while (commits.hasNext())
                    result.push(this.serialize(commits.next()));
                BetaJS.SyncAsync.callback(callbacks, "success", result);
            }
        });
    },

    revision_id : function() {
        return this._revision_id;
    },

    _new_revision_id : function() {
        this.cls.__revision_id++;
        return this.cls.__revision_id;
    }
}], {

    __revision_id : BetaJS.Time.now()

}); 
/*!
  betajs - v0.0.2 - 2014-07-14
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Net = BetaJS.Net || {};

BetaJS.Net.HttpHeader = {
	
	HTTP_STATUS_OK : 200,
	HTTP_STATUS_CREATED : 201,
	HTTP_STATUS_PAYMENT_REQUIRED : 402,
	HTTP_STATUS_FORBIDDEN : 403,
	HTTP_STATUS_NOT_FOUND : 404,
	HTTP_STATUS_PRECONDITION_FAILED : 412,
	HTTP_STATUS_INTERNAL_SERVER_ERROR : 500,
	
	format: function (code, prepend_code) {
		var ret = "";
		if (code == this.HTTP_STATUS_OK)
			ret = "OK";
		else if (code == this.HTTP_STATUS_CREATED)
			ret = "Created";
		else if (code == this.HTTP_STATUS_PAYMENT_REQUIRED)
			ret = "Payment Required";
		else if (code == this.HTTP_STATUS_FORBIDDEN)
			ret = "Forbidden";
		else if (code == this.HTTP_STATUS_NOT_FOUND)
			ret = "Not found";
		else if (code == this.HTTP_STATUS_PRECONDITION_FAILED)
			ret = "Precondition Failed";
		else if (code == this.HTTP_STATUS_INTERNAL_SERVER_ERROR)
			ret = "Internal Server Error";
		else
			ret = "Other Error";
		return prepend_code ? (code + " " + ret) : ret;
	}
	
};
BetaJS.Exceptions.Exception.extend("BetaJS.Modelling.ModelException", {
	
	constructor: function (model, message) {
		this._inherited(BetaJS.Modelling.ModelException, "constructor", message);
		this.__model = model;
	},
	
	model: function () {
		return this.__model;
	}
	
});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelMissingIdException", {
	
	constructor: function (model) {
		this._inherited(BetaJS.Modelling.ModelMissingIdException, "constructor", model, "No id given.");
	}

});


BetaJS.Modelling.ModelException.extend("BetaJS.Modelling.ModelInvalidException", {
	
	constructor: function (model) {
		var message = BetaJS.Objs.values(model.errors()).join("\n");
		this._inherited(BetaJS.Modelling.ModelInvalidException, "constructor", model, message);
	}

});

BetaJS.Properties.Properties.extend("BetaJS.Modelling.SchemedProperties", {
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.SchemedProperties, "constructor");
		var scheme = this.cls.scheme();
		this._properties_changed = {};
		this.__errors = {};
		this.__unvalidated = {};
		for (var key in scheme) {
			if ("def" in scheme[key]) 
				this.set(key, scheme[key].def);
			else if (scheme[key].auto_create)
				this.set(key, scheme[key].auto_create(this));
			else
				this.set(key, null);
		}
		options = options || {};
		this._properties_changed = {};
		this.__errors = {};
		//this.__unvalidated = {};
		for (key in attributes)
			this.set(key, attributes[key]);
	},
	
	_unsetChanged: function (key) {
		delete this._properties_changed[key];
	},
	
	_beforeSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return value;
		var sch = scheme[key];
		if (sch.type == "boolean")
			return BetaJS.Types.parseBool(value);
		if (sch.transform)
			value = sch.transform.apply(this, [value]);
		return value;
	},
	
	_afterSet: function (key, value) {
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		this._properties_changed[key] = value;
		this.__unvalidated[key] = true;
		delete this.__errors[key];
		if (scheme[key].after_set) {
			var f = BetaJS.Types.is_string(scheme[key].after_set) ? this[scheme[key].after_set] : scheme[key].after_set;
			f.apply(this, [value]);
		}
	},

	properties_changed: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this._properties_changed;
		return BetaJS.Objs.filter(this._properties_changed, function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	get_all_properties: function () {
		var result = {};
		var scheme = this.cls.scheme();
		for (var key in scheme)
			result[key] = this.get(key);
		return result;
	},
	
	properties_by: function (filter_valid) {
		if (!BetaJS.Types.is_boolean(filter_valid))
			return this.get_all_properties();
		return BetaJS.Objs.filter(this.get_all_properties(), function (value, key) {
			return this.validateAttr(key) == filter_valid;
		}, this);
	},
	
	validate: function () {
		this.trigger("validate");
		for (var key in this.__unvalidated)
			this.validateAttr(key);
		this._customValidate();
		return BetaJS.Types.is_empty(this.__errors);
	},
	
	_customValidate: function () {},
	
	validateAttr: function (attr) {
		if (attr in this.__unvalidated) {
			delete this.__unvalidated[attr];
			delete this.__errors[attr];
			var scheme = this.cls.scheme();
			var entry = scheme[attr];
			if ("validate" in entry) {
				var validate = entry["validate"];
				if (!BetaJS.Types.is_array(validate))
					validate = [validate];
				var value = this.get(attr);
				BetaJS.Objs.iter(validate, function (validator) {
					var result = validator.validate(value, this);
					if (result)
						this.__errors[attr] = result;
					return result === null;
				}, this);
			}
			this.trigger("validate:" + attr, !(attr in this.__errors), this.__errors[attr]);
		}
		return !(attr in this.__errors);
	},
	
	setError: function (attr, error) {
		delete this.__unvalidated[attr];
		this.__errors[attr] = error;
		this.trigger("validate:" + attr, !(attr in this.__errors), this.__errors[attr]);
	},
	
	revalidate: function () {
		this.__errors = {};
		this.__unvalidated = this.keys(true);
		return this.validate();
	},
	
	errors: function () {
		return this.__errors;
	},
	
	getError: function (attr) {
		return this.__errors[attr];
	},
	
	asRecord: function (tags) {
		var rec = {};
		var scheme = this.cls.scheme();
		var props = this.get_all_properties();
		tags = tags || {};
		for (var key in props) {
			if (key in scheme) {
				var target = scheme[key]["tags"] || [];
				var tarobj = {};
				BetaJS.Objs.iter(target, function (value) {
					tarobj[value] = true;
				});
				var success = true;
				BetaJS.Objs.iter(tags, function (x) {
					success = success && x in tarobj;
				}, this);
				if (success)
					rec[key] = props[key];
			}
		}
		return rec;		
	},
	
	setByTags: function (data, tags) {
		var scheme = this.cls.scheme();
		tags = tags || {};
		for (var key in data)  {
			if (key in scheme) {
				var target = scheme[key]["tags"] || [];
				var tarobj = {};
				BetaJS.Objs.iter(target, function (value) {
					tarobj[value] = true;
				});
				var success = true;
				BetaJS.Objs.iter(tags, function (x) {
					success = success && x in tarobj;
				}, this);
				if (success)
					this.set(key, data[key]);
			}
		}
	},
	
	validation_exception_conversion: function (e) {
		var source = e;
		if (e.instance_of(BetaJS.Stores.RemoteStoreException))
			source = e.source();
		else if (!("status_code" in source && "data" in source))
			return e;
		if (source.status_code() == BetaJS.Net.HttpHeader.HTTP_STATUS_PRECONDITION_FAILED && source.data()) {
			BetaJS.Objs.iter(source.data(), function (value, key) {
				this.setError(key, value);
			}, this);
			e = new BetaJS.Modelling.ModelInvalidException(model);
		}
		return e;		
	}
	
}, {

	_initializeScheme: function () {
		return {};
	},
	
	asRecords: function (arr, tags) {
		return arr.map(function (item) {
			return item.asRecord(tags);
		});
	},
	
	filterPersistent: function (obj) {
		var result = {};
		var scheme = this.scheme();
		for (var key in obj) {
			if (!BetaJS.Types.is_defined(scheme[key].persistent) || scheme[key].persistent)
				result[key] = obj[key];
		}
		return result;
	}
	
}, {
	
	scheme: function () {
		this.__scheme = this.__scheme || this._initializeScheme();
		return this.__scheme;
	}
	
});



BetaJS.Modelling.SchemedProperties.extend("BetaJS.Modelling.AssociatedProperties", {
	
	constructor: function (attributes, options) {
		this._inherited(BetaJS.Modelling.AssociatedProperties, "constructor", attributes, options);
		this.assocs = this._initializeAssociations();
		for (var key in this.assocs)
			this.__addAssoc(key, this.assocs[key]);
		this.on("change:" + this.cls.primary_key(), function (new_id, old_id) {
			this._change_id(new_id, old_id);
			this.trigger("change_id", new_id, old_id);
		}, this);
	},
	
	_change_id: function (new_id, old_id) {
	},

	__addAssoc: function (key, obj) {
		this[key] = function () {
			return obj.yield();
		};
	},
	
	_initializeAssociations: function () {
		return {};
	},
	
	destroy: function () {
		for (var key in this.assocs)
			this.assocs[key].destroy();
		this._inherited(BetaJS.Modelling.AssociatedProperties, "destroy");
	},

	id: function () {
		return this.get(this.cls.primary_key());
	},
	
	hasId: function () {
		return this.has(this.cls.primary_key());
	}
	
}, {

	primary_key: function () {
		return "id";
	},
	
	_initializeScheme: function () {
		var s = this._inherited(BetaJS.Modelling.AssociatedProperties, "_initializeScheme");
		s[this.primary_key()] = {
			type: "id"
		};
		return s;
	}

});
BetaJS.Modelling.AssociatedProperties.extend("BetaJS.Modelling.Model", [
	BetaJS.SyncAsync.SyncAsyncMixin,
	{
	
	constructor: function (attributes, options) {
		options = options || {};
		this._inherited(BetaJS.Modelling.Model, "constructor", attributes, options);
		this.__saved = "saved" in options ? options["saved"] : false;
		this.__new = "new" in options ? options["new"] : true;
		this.__removed = false;
		if (this.__saved)
			this._properties_changed = {};
		this.__table = options["table"] || this.cls.defaultTable();
		this.__table._model_register(this);
		this.__destroying = false;
		this._supportsAsync = this.__table.supportsAsync();
		this._supportsSync = this.__table.supportsSync();
	},
	
	destroy: function () {
		if (this.__destroying || !this.__table)
			return;
		this.__destroying = true;
		this.__table._model_unregister(this);
		this.trigger("destroy");
		this._inherited(BetaJS.Modelling.Model, "destroy");
	},

	isSaved: function () {
		return this.__saved;
	},
	
	isNew: function () {
		return this.__new;
	},
	
	isRemoved: function () {
		return this.__removed;
	},

	update: function (data, options, callbacks) {
		this.setAll(data, {silent: true});
		this.save(callbacks);
	},

	_afterSet: function (key, value, old_value, options) {
		this._inherited(BetaJS.Modelling.Model, "_afterSet", key, value, old_value, options);
		var scheme = this.cls.scheme();
		if (!(key in scheme))
			return;
		if (options && options.no_change)
			this._unsetChanged(key);
		else
			this.__saved = false;
		if (options && options.silent)
			return;
		if (this.__table)
			this.__table._model_set_value(this, key, value, options);
	},
	
	_after_create: function () {
	},
	
	_before_create: function () {
	},
	
	save: function (callbacks) {
		if (this.__new)
			this._before_create();
		return this.then(this.__table, this.__table._model_save, [this], callbacks, function (result, callbacks) {
			this.trigger("save");
			this.__saved = true;
			var was_new = this.__new;
			this.__new = false;
			if (was_new)
				this._after_create();
			this.callback(callbacks, "success", result);
		});
	},
	
	remove: function (callbacks) {
		return this.then(this.__table, this.__table._model_remove, [this], callbacks, function (result, callbacks) {
			this.trigger("remove");		
			this.__removed = true;
			this.callback(callbacks, "success", result);
		});
	},
	
	table: function () {
		return this.__table;
	}
	
}], {
	
	defaultTable: function () {
		if (!this.table)
			this.table = new BetaJS.Modelling.Table(new BetaJS.Stores.MemoryStore(), this);
		return this.table;
	}
	
});
BetaJS.Class.extend("BetaJS.Modelling.Table", [
	BetaJS.Events.EventsMixin,
	BetaJS.SyncAsync.SyncAsyncMixin,
	{

	constructor: function (store, model_type, options) {
		this._inherited(BetaJS.Modelling.Table, "constructor");
		this.__store = store;
		this.__model_type = model_type;
		this.__models_by_id = {};
		this.__models_changed = {};
		this.__options = BetaJS.Objs.extend({
			// Cache Size
			model_cache_size: null,
			// Attribute that describes the type
			type_column: null,
			// Creation options
			auto_create: false,
			// Validation options
			store_validation_conversion: true,
			// Update options
			auto_update: true,
			// Include new inserts automagically
			auto_materialize: false
		}, options || {});
		this.__models_by_cid = new BetaJS.Classes.ObjectCache({ size: this.__options.model_cache_size });
		this._auto_destroy(this.__models_by_cid);
		this.__models_by_cid.on("release", function (model) {
			if (model.hasId())
				delete this.__models_by_id[model.id()];
		}, this);
		if (this.__options.auto_materialize) {
			this.__store.on("insert", function (obj, event_data) {
				if (this.__models_by_id[obj[this.primary_key()]] || (event_data && event_data.model_create))
					return;
				var model = this.__materialize(obj);
				this.trigger("create", model);				
			}, this);
		}
		this.__store.on("update", function (row, data, event_data) {
			if (!this.__models_by_id[row[this.primary_key()]] || (event_data && event_data.model_update))
				return;
			var model = this.__models_by_id[row[this.primary_key()]];
			model.setAll(data, {silent: true});
			this.trigger("update", model);
		}, this);
		this.__store.on("remove", function (id, event_data) {
			if (!this.__models_by_id[id] || (event_data && event_data.model_remove))
				return;
			var model = this.__models_by_id[id];
			this.trigger("remove", model);
			model.destroy();
		}, this);
		this._supportsAsync = true;
		this._supportsSync = store.supportsSync();
	},
	
	_model_register: function (model) {
		if (this.hasModel(model))
			return;
		this.trigger("register", model);
		this.__models_by_cid.add(model);
		if (model.hasId())
			this.__models_by_id[model.id()] = model;
		if (model.isNew() && this.__options.auto_create)
			this._model_create(model);
	},
	
	_model_unregister: function (model) {
		if (!this.hasModel(model))
			return;
		model.save();
		this.__models_by_cid.remove(model);
		if (model.hasId())
			delete this.__models_by_id[model.id()];
		this.trigger("unregister", model);
	},
	
	hasModel: function (model) {
		return this.__models_by_cid.get(model) !== null;
	},

	_model_remove: function (model, callbacks) {
		if (!this.hasModel(model))
			return false;
		return this.then(this.__store, this.__store.remove, [[model.id(), {model_remove: true}]], callbacks, function (result, callbacks) {
			this.trigger("remove", model);
			model.destroy();
			this.callback(callbacks, "success", true);
		}, function (error, callbacks) {
			this.callback(callbacks, "exception", error);
		});
	},

	_model_save: function (model, callbacks) {
		return model.isNew() ? this._model_create(model, callbacks) : this._model_update(model, callbacks);
	},
	
	__exception_conversion: function (model, e) {
		return this.__options.store_validation_conversion ? model.validation_exception_conversion(e) : e;
	},
	
	_model_create: function (model, callbacks) {
		if (!this.hasModel(model) || !model.isNew())
			return false;
		if (!model.validate()) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
		 	if (callbacks)
		 		this.callback(callbacks, "exception", e);
		 	else
		 		throw e;
		}
		var attrs = BetaJS.Scopes.resolve(this.__model_type).filterPersistent(model.get_all_properties());
		if (this.__options.type_column)
			attrs[this.__options.type_column] = model.cls.classname;
		return this.then(this.__store, this.__store.insert, [[attrs, {model_create: true}]], callbacks, function (confirmed, callbacks) {
			if (!(model.cls.primary_key() in confirmed))
				return this.callback(callbacks, "exception", new BetaJS.Modelling.ModelMissingIdException(model));
			this.__models_by_id[confirmed[model.cls.primary_key()]] = model;
			model.setAll(confirmed, {no_change: true, silent: true});
			delete this.__models_changed[model.cid()];
			this.trigger("create", model);
			this.trigger("save", model);
			this.callback(callbacks, "success", model);
			return true;		
		}, function (e, callbacks) {
			e = BetaJS.Exceptions.ensure(e);
			e = this.__exception_conversion(model, e);
			this.callback(callbacks, "exception", e);
		});
	},

	_model_update: function (model, callbacks) {
		if (!this.hasModel(model) || model.isNew())
			return false;
		if (!model.validate()) {
		 	var e = new BetaJS.Modelling.ModelInvalidException(model);
		 	if (callbacks)
		 		this.callback(callbacks, "exception", e);
		 	else
		 		throw e;
		}
		var attrs = BetaJS.Scopes.resolve(this.__model_type).filterPersistent(model.properties_changed());
		if (BetaJS.Types.is_empty(attrs)) {
			if (callbacks)
				this.callback(callbacks, "success", attrs);
			return attrs;
		}
		return this.then(this.__store, this.__store.update, [model.id(), [attrs, {model_update: true}]], callbacks, function (confirmed, callbacks) {
			model.setAll(confirmed, {no_change: true, silent: true});
			delete this.__models_changed[model.cid()];
			this.trigger("update", model);
			this.trigger("save", model);
			this.callback(callbacks, "success", confirmed);
			return confirmed;		
		}, function (e, callbacks) {
			e = BetaJS.Exceptions.ensure(e);
			e = this.__exception_conversion(model, e);
			this.callback(callbacks, "exception", e);
			return false;
		});
	},

	_model_set_value: function (model, key, value, callbacks) {
		this.__models_changed[model.cid()] = model;
		this.trigger("change", model, key, value);
		this.trigger("change:" + key, model, value);
		if (this.__options.auto_update)
			return model.save(callbacks);
	},
	
	save: function (callbacks) {
		if (callbacks) {
			var promises = [];
			BetaJS.Objs.iter(this.__models_changed, function (obj) {
				promises.push(obj.promise(obj.save));
			}, this);
			return this.join(promises, callbacks);
		} else {
			var result = true;
			BetaJS.Objs.iter(this.__models_changed, function (obj, id) {
				result = obj.save() && result;
			});
			return result;
		}
	},
	
	primary_key: function () {
		return BetaJS.Scopes.resolve(this.__model_type).primary_key();
	},
	
	__materialize: function (obj) {
		if (!obj)
			return null;
		var type = this.__model_type;
		if (this.__options.type_column && obj[this.__options.type_column])
			type = obj[this.__options.type_column];
		var cls = BetaJS.Scopes.resolve(type);
		if (this.__models_by_id[obj[this.primary_key()]])
			return this.__models_by_id[obj[this.primary_key()]];
		var model = new cls(obj, {
			table: this,
			saved: true,
			"new": false
		});
		return model;
	},
	
	findById: function (id, callbacks) {
		if (this.__models_by_id[id]) {
			if (callbacks)
				this.callback(callbacks, "success", this.__models_by_id[id]);
			return this.__models_by_id[id];
		} else
			return this.then(this.__store, this.__store.get, [id], callbacks, function (attrs, callbacks) {
				this.callback(callbacks, "success", this.__materialize(this.__store.get(id)));
			});
	},

	findBy: function (query, callbacks) {
		return this.then(this, this.allBy, [query, {limit: 1}], callbacks, function (iterator, callbacks) {
			this.callback(callbacks, "success", iterator.next());
		});
	},

	all: function (options, callbacks) {
		return this.allBy({}, options, callbacks);
	},
	
	allBy: function (query, options, callbacks) {
		var self = this;
		return this.__store.then(this.__store.query, [query, options], callbacks, function (iterator, callbacks) {
			var mapped_iterator = new BetaJS.Iterators.MappedIterator(iterator, function (obj) {
				return this.__materialize(obj);
			}, self);
			self.callback(callbacks, "success", mapped_iterator);
		});
	},
	
	query: function () {
		// Alias
		return this.allBy.apply(this, arguments);
	},
	/*
	active_query_engine: function () {
		if (!this._active_query_engine) {
			var self = this;
			this._active_query_engine = new BetaJS.Queries.ActiveQueryEngine();
			this._active_query_engine._query = function (query, callbacks) {
				return self.allBy(query.query || {}, query.options || {}, callbacks);
			};
			this.on("create", function (object) {
				this._active_query_engine.insert(object);
			});
			this.on("remove", function (object) {
				this._active_query_engine.remove(object);
			});
			this.on("change", function (object) {
				this._active_query_engine.update(object);
			});
		}
		return this._active_query_engine;
	},
	*/
	scheme: function () {
		return this.__model_type.scheme();
	},
	
	ensure_indices: function () {
		if (!("ensure_index" in this.__store))
			return false;
		var scheme = this.scheme();
		for (var key in scheme) {
			if (scheme[key].index)
				this.__store.ensure_index(key);
		}
		return true;
	}
	
}]);
BetaJS.Class.extend("BetaJS.Modelling.Associations.Association", [
	BetaJS.SyncAsync.SyncAsyncMixin,
	{

	constructor: function (model, options) {
		this._inherited(BetaJS.Modelling.Associations.Association, "constructor");
		this._model = model;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
		if (!options["ignore_change_id"])
			model.on("change_id", function (new_id, old_id) {
				this._change_id(new_id, old_id);
			}, this);
	},
	
	_change_id: function () {},
	
	__delete_cascade: function () {
		this.yield({
			success: function (iter) {
				iter = BetaJS.Iterators.ensure(iter).toArray();
				var promises = [];
				while (iter.hasNext()) {
					var obj = iter.next();
					promises.push(obj.promise(obj.remove));
				}
				this.join(promises, {success: function () {}});
			}
		});
	},
	
	yield: function (callbacks) {
		if (this._options["cached"])
			return this.eitherFactory("__cache", callbacks, this._yield, this._yield);
		else
			return this._yield(callbacks);
	},
	
	invalidate: function () {
		delete this["__cache"];
	}

}]);
BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.TableAssociation", {

	constructor: function (model, foreign_table, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "constructor", model, options);
		this._foreign_table = foreign_table;
		this._foreign_key = foreign_key;
		// TODO: Active Query would be better
		if (options["primary_key"])
			this._primary_key = options.primary_key;
		if (this._options["cached"]) 
			this._foreign_table.on("create update remove", function () {
				this.invalidate();
			}, this);
	},
	
	destroy: function () {
		this._foreign_table.off(null, null, this);
		this._inherited(BetaJS.Modelling.Associations.TableAssociation, "destroy");
	}
	
});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasManyAssociation", {

	_id: function () {
		return this._primary_key ? this._model.get(this._primary_key) : this._model.id();
	},

	_yield: function (callbacks) {
		return this.allBy({}, callbacks);
	},

	yield: function (callbacks) {
		if (!this._options["cached"])
			return this._yield(callbacks);
		if (this.__cache) {
			var iter = new BetaJS.Iterators.ArrayIterator(this.__cache);
			if (callbacks)
				this.callback(callbacks, "success", iter);
			return iter;
		} else {
			return this.then(this._yield, callbacks, function (result, callbacks) {
				this.__cache = result.asArray();
				BetaJS.Objs.iter(this.__cache, function (model) {
					model.on("destroy", function () {
						this.invalidate();
					}, this);
				}, this);
				this.callback(callbacks, "success", new BetaJS.Iterators.ArrayIterator(this.__cache));
			});
		}
	},
	
	invalidate: function () {
		BetaJS.Objs.iter(this.__cache, function (model) {
			model.off(null, null, this);
		}, this);
		this._inherited(BetaJS.Modelling.Associations.HasManyAssociation, "invalidate");
	},

	findBy: function (query, callbacks) {
		query[this._foreign_key] = this._id();
		return this._foreign_table.findBy(query, callbacks);
	},

	allBy: function (query, callbacks, id) {
		query[this._foreign_key] = id ? id : this._id();
		return this._foreign_table.allBy(query, {}, callbacks);
	},

	_change_id: function (new_id, old_id) {
		this.allBy({}, {
			content: this,
			success: function (objects) {
				while (objects.hasNext()) {
					var object = objects.next();
					object.set(this._foreign_key, new_id);
					object.save();
				}
			}
		}, old_id);
	}

});
BetaJS.Modelling.Associations.HasManyAssociation.extend("BetaJS.Modelling.Associations.HasManyThroughArrayAssociation", {

	_yield: function (callbacks) {
		if (callbacks) {
			var promises = [];		
			BetaJS.Objs.iter(this._model.get(this._foreign_key), function (id) {
				promises.push(this._foreign_table.promise(this._foreign_table.findById, [id]));
			}, this);
			return this.join(promises, BetaJS.SyncAsync.mapSuccess(callbacks, function (result) {
				this.callback(callbacks, "success", BetaJS.Objs.filter(result, function (item) {
					return !!item;
				}));
			}));
		} else {
			var result = [];		
			BetaJS.Objs.iter(this._model.get(this._foreign_key), function (id) {
				var item = this._foreign_table.findById(id);
				if (item)
					result.push(item);
			}, this);
			return result;
		}
	},

	yield: function (callbacks) {
		if (!this._options["cached"])
			return new BetaJS.Iterators.ArrayIterator(this._yield(callbacks));
		if (this.__cache) {
			var iter = new BetaJS.Iterators.ArrayIterator(this.__cache);
			if (callbacks)
				this.callback(callbacks, "success", iter);
			return iter;
		} else {
			return this.then(this._yield, callbacks, function (result, callbacks) {
				this.__cache = result;
				BetaJS.Objs.iter(this.__cache, function (model) {
					model.on("destroy", function () {
						this.invalidate();
					}, this);
				}, this);
				this.callback(callbacks, "success", new BetaJS.Iterators.ArrayIterator(this.__cache));
			});
		}
	}

});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.HasOneAssociation", {

	_yield: function (callbacks, id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id;
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key);
		else
			query[this._foreign_key] = this._model.id();
		return this.then(this._foreign_table, this._foreign_table.findBy, [query], callbacks, function (model, callbacks) {
			if (model)
				model.on("destroy", function () {
					this.invalidate();
				}, this);
			this.callback(callbacks, "success", model);
		});
	},
	
	_change_id: function (new_id, old_id) {
		this._yield({
			context: this,
			success: function (object) {
				if (object) {
					object.set(this._foreign_key, new_id);
					object.save();
				}
			}
		}, old_id);
	}

});
BetaJS.Modelling.Associations.TableAssociation.extend("BetaJS.Modelling.Associations.BelongsToAssociation", {
	
	_yield: function (callbacks) {
		var success = function (model, callbacks) {
			if (model)
				model.on("destroy", function () {
					this.invalidate();
				}, this);
			this.callback(callbacks, "success", model);
		};
		if (!this._primary_key)
			return this.then(this._foreign_table, this._foreign_table.findById, [this._model.get(this._foreign_key)], callbacks, success);
		var obj = {};
		obj[this._primary_key] = this._model.get(this._foreign_key);
		return this.then(this._foreign_table, this._foreign_table.findBy, [obj], callbacks, success);
	}
	
});
BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.ConditionalAssociation", {

	constructor: function (model, options) {
		this._inherited(BetaJS.Modelling.Associations.ConditionalAssociation, "constructor");
		this._model = model;
		this._options = options || {};
		this.__cache = null;
		if (options["delete_cascade"])
			model.on("remove", function () {
				this.__delete_cascade();
			}, this);
		if (!options["ignore_change_id"])
			model.on("change_id", function (new_id, old_id) {
				this._change_id(new_id, old_id);
			}, this);
	},
	
	_yield: function (callbacks) {
		return this._model.assocs[this._options.conditional(this._model)].yield(callbacks);
	}

});
BetaJS.Modelling.Associations.Association.extend("BetaJS.Modelling.Associations.PolymorphicHasOneAssociation", {

	constructor: function (model, foreign_table_key, foreign_key, options) {
		this._inherited(BetaJS.Modelling.Associations.PolymorphicHasOneAssociation, "constructor", model, options);
		this._foreign_table_key = foreign_table_key;
		this._foreign_key = foreign_key;
		if (options["primary_key"])
			this._primary_key = options.primary_key;
	},

	_yield: function (callbacks, id) {
		var query = {};
		if (id)
			query[this._foreign_key] = id;
		else if (this._primary_key) 
			query[this._foreign_key] = this._model.get(this._primary_key);
		else
			query[this._foreign_key] = this._model.id();
		var foreign_table = BetaJS.Scopes.resolve(this._model.get(this._foreign_table_key));
		return this.then(foreign_table, foreign_table.findBy, [query], callbacks, function (model, callbacks) {
			if (model)
				model.on("destroy", function () {
					this.invalidate();
				}, this);
			this.callback(callbacks, "success", model);
		});
	},
	
	_change_id: function (new_id, old_id) {
		this._yield({
			success: function (object) {
				if (object) {
					object.set(this._foreign_key, new_id);
					object.save();
				}
			}
		}, old_id);
	}

});
BetaJS.Class.extend("BetaJS.Modelling.Validators.Validator", {
	
	validate: function (value, context) {
		return null;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.PresentValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.PresentValidator, "constructor");
		this.__error_string = error_string ? error_string : "Field is required";
	},

	validate: function (value, context) {
		return BetaJS.Types.is_null(value) || value === "" ? this.__error_string : null;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.EmailValidator", {
	
	constructor: function (error_string) {
		this._inherited(BetaJS.Modelling.Validators.EmailValidator, "constructor");
		this.__error_string = error_string ? error_string : "Not a valid email address";
	},

	validate: function (value, context) {
		return BetaJS.Strings.is_email_address(value) ? null : this.__error_string;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.LengthValidator", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Modelling.Validators.LengthValidator, "constructor");
		this.__min_length = BetaJS.Types.is_defined(options.min_length) ? options.min_length : null;
		this.__max_length = BetaJS.Types.is_defined(options.max_length) ? options.max_length : null;
		this.__error_string = BetaJS.Types.is_defined(options.error_string) ? options.error_string : null;
		if (!this.__error_string) {
			if (this.__min_length !== null) {
				if (this.__max_length !== null)
					this.__error_string = "Between " + this.__min_length + " and " + this.__max_length + " characters";
				else
					this.__error_string = "At least " + this.__min_length + " characters";
			} else if (this.__max_length !== null)
				this.__error_string = "At most " + this.__max_length + " characters";
		}
	},

	validate: function (value, context) {
		if (this.__min_length !== null && (!value || value.length < this.__min_length))
			return this.__error_string;
		if (this.__max_length !== null && value.length > this.__max_length)
			return this.__error_string;
		return null;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.UniqueValidator", {
	
	constructor: function (key, error_string) {
		this._inherited(BetaJS.Modelling.Validators.UniqueValidator, "constructor");
		this.__key = key;
		this.__error_string = error_string ? error_string : "Key already present";
	},

	validate: function (value, context) {
		var query = {};
		query[this.__key] = value;
		var item = context.table().findBy(query);
		return (!item || (!context.isNew() && context.id() == item.id())) ? null : this.__error_string;
	}

});
BetaJS.Modelling.Validators.Validator.extend("BetaJS.Modelling.Validators.ConditionalValidator", {
	
	constructor: function (condition, validator) {
		this._inherited(BetaJS.Modelling.Validators.ConditionalValidator, "constructor");
		this.__condition = condition;
		this.__validator = BetaJS.Types.is_array(validator) ? validator : [validator];
	},

	validate: function (value, context) {
		if (!this.__condition(value, context))
			return null;
		for (var i = 0; i < this.__validator.length; ++i) {
			var result = this.__validator[i].validate(value, context);
			if (result !== null)
				return result;
		}
		return null;
	}

});
/*!
  betajs - v0.0.2 - 2014-07-14
  Copyright (c) Oliver Friedmann & Victor Lingenthal
  MIT Software License.
*/
BetaJS.Net.AbstractAjax.extend("BetaJS.Browser.JQueryAjax", {
	
	_syncCall: function (options) {
		var result;
		BetaJS.$.ajax({
			type: options.method,
			async: false,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				result = response;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var err = "";
				try {
					err = JSON.parse(jqXHR.responseText);
				} catch (e) {
					err = JSON.parse('"' + jqXHR.responseText + '"');
				}
				throw new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, ee);
			}
		});
		return result;
	},
	
	_asyncCall: function (options, callbacks) {
		if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() <= 9)
			BetaJS.$.support.cors = true;
		BetaJS.$.ajax({
			type: options.method,
			async: true,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				BetaJS.SyncAsync.callback(callbacks, "success", response);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var err = "";
				try {
					err = JSON.parse(jqXHR.responseText);
				} catch (e) {
					err = JSON.parse('"' + jqXHR.responseText + '"');
				}
				var exc = new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, err);
				BetaJS.SyncAsync.callback(callbacks, "exception", exc);
			}
		});
	}

});

BetaJS.Browser.Cookies = {

	get : function(key) {
		return BetaJS.Strings.read_cookie_string(document.cookie, key);
	},

	set : function(key, value) {
		document.cookie = BetaJS.Strings.write_cookie_string(document.cookie, key, value);
	}
};
BetaJS.Browser.Dom = {
	
	traverseNext: function (node, skip_children) {
		if ("get" in node)
			node = node.get(0);
		if (node.firstChild && !skip_children)
			return BetaJS.$(node.firstChild);
		if (!node.parentNode)
			return null;
		if (node.nextSibling)
			return BetaJS.$(node.nextSibling);
		return this.traverseNext(node.parentNode, true);
	},
	
	selectNode : function(node, offset) {
		node = BetaJS.$(node).get(0);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		if (offset) {
			range.setStart(node, offset);
			range.setEnd(node, offset);
			selection.addRange(range);
		} else {
			range.selectNode(node);
			selection.addRange(range);
		}
	},

	selectionStartNode : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},
	
	selectedHtml : function() {
		if (window.getSelection)
			return window.getSelection().toString();
		else if (document.selection)
			return document.selection.createRange().htmlText;
		return "";
	},
	
	selectionAncestor : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).commonAncestorContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().parentElement());
		return null;
	},
	
	selectionStartOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).startOffset;
		else if (document.selection)
			return document.selection.createRange().startOffset;
		return null;
	},
	
	selectionEndOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).endOffset;
		else if (document.selection)
			return document.selection.createRange().endOffset;
		return null;
	},

	selectionStart : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},

	selectionEnd : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).endContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().endContainer);
		return null;
	},
	
	selectionNonEmpty: function () {
		var start = this.selectionStart();
		var end = this.selectionEnd();
		return start && end && start.get(0) && end.get(0) && (start.get(0) != end.get(0) || this.selectionStartOffset() != this.selectionEndOffset());
	},
	
	selectionContained: function (node) {
		return node.has(this.selectionStart()).length > 0 && node.has(this.selectionEnd()).length > 0;
	},

	selectionNodes: function () {
		var result = [];
		var start = this.selectionStart();
		var end = this.selectionEnd();
		result.push(start);
		var current = start;
		while (current.get(0) != end.get(0)) {
			current = this.traverseNext(current);
			result.push(current);
		}
		return result;
	},
	
	selectionLeaves: function () {
		return BetaJS.Objs.filter(this.selectionNodes(), function (node) { return node.children().length === 0; });
	},
	
	contentSiblings: function (node) {
		return node.parent().contents().filter(function () {
			return this != node.get(0);
		});
	},
	
	remove_tag_from_parent_path: function (node, tag, context) {	
		tag = tag.toLowerCase();
		node = BetaJS.$(node);
		var parents = node.parents(context ? context + " " + tag : tag);
		for (var i = 0; i < parents.length; ++i) {
			var parent = parents.get(i);
			parent = BetaJS.$(parent);
			while (node.get(0) != parent.get(0)) {
				this.contentSiblings(node).wrap("<" + tag + "></" + tag + ">");
				node = node.parent();
			}
			parent.contents().unwrap();
		}
	},
	
	selectionSplitOffsets: function () {
		var startOffset = this.selectionStartOffset();
		var endOffset = this.selectionEndOffset();
		var start = this.selectionStart();
		var end = this.selectionEnd();
		var single = start.get(0) == end.get(0);
		if (endOffset < end.get(0).wholeText.length) {
			var endElem = end.get(0);
			endElem.splitText(endOffset);
			end = BetaJS.$(endElem);
			if (single)
				start = end;
		}
		if (startOffset > 0) {
			start = BetaJS.$(start.get(0).splitText(startOffset));
			if (single)
				end = start;
		}
		this.selectRange(start, end);
	},
	
	selectRange: function (start_node, end_node, start_offset, end_offset) {
		start_node = BetaJS.$(start_node);
		end_node = BetaJS.$(end_node);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		range.setStart(start_node.get(0), start_offset || 0);
		range.setEnd(end_node.get(0), end_offset || end_node.get(0).data.length);
		selection.addRange(range);
	},
	
	splitNode: function (node, start_offset, end_offset) {
		node = BetaJS.$(node);
		start_offset = start_offset || 0;
		end_offset = end_offset || node.get(0).data.length;
		if (end_offset < node.get(0).data.length) {
			var elem = node.get(0);
			elem.splitText(end_offset);
			node = BetaJS.$(elem);
		}
		if (start_offset > 0) 
			node = BetaJS.$(node.get(0).splitText(start_offset));
		return node;
	}
			
};

BetaJS.Browser = BetaJS.Browser || {};

/**
 * Uses modified portions of:
 * 
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

BetaJS.Browser.Hotkeys = {
	
	SHIFT_NUMS: {
		"`":"~",
		"1":"!",
		"2":"@",
		"3":"#",
		"4":"$",
		"5":"%",
		"6":"^",
		"7":"&",
		"8":"*",
		"9":"(",
		"0":")",
		"-":"_",
		"=":"+",
		";":":",
		"'":"\"",
		",":"<",
		".":">",
		"/":"?",
		"\\":"|"
	},
	
	SPECIAL_KEYS: {
		'esc':27,
		'escape':27,
		'tab':9,
		'space':32,
		'return':13,
		'enter':13,
		'backspace':8,

		'scrolllock':145,
		'scroll_lock':145,
		'scroll':145,
		'capslock':20,
		'caps_lock':20,
		'caps':20,
		'numlock':144,
		'num_lock':144,
		'num':144,
		
		'pause':19,
		'break':19,
		
		'insert':45,
		'home':36,
		'delete':46,
		'end':35,
		
		'pageup':33,
		'page_up':33,
		'pu':33,

		'pagedown':34,
		'page_down':34,
		'pd':34,

		'left':37,
		'up':38,
		'right':39,
		'down':40,

		'f1':112,
		'f2':113,
		'f3':114,
		'f4':115,
		'f5':116,
		'f6':117,
		'f7':118,
		'f8':119,
		'f9':120,
		'f10':121,
		'f11':122,
		'f12':123
	},
	
	MODIFIERS: ["ctrl", "alt", "shift", "meta"],
	
	keyCodeToCharacter: function (code) {
		if (code == 188)
			return ",";
		else if (code == 190)
			return ".";
		return String.fromCharCode(code).toLowerCase();
	},
	
	register: function (hotkey, callback, context, options) {
		options = BetaJS.Objs.extend({
			"type": "keyup",
			"propagate": false,
			"disable_in_input": false,
			"target": document,
			"keycode": false
		}, options);
		options.target = BetaJS.$(options.target);
		var keys = hotkey.toLowerCase().split("+");
		var func = function (e) {
			if (options.disable_in_input) {
				var element = e.target || e.srcElement || null;
				if (element && element.nodeType == 3)
					element = element.parentNode;
				if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
					return;
			}
			var code = e.keyCode || e.which || 0;
			var character = BetaJS.Browser.Hotkeys.keyCodeToCharacter(code);
			var kp = 0;
			var modifier_map = {};
			BetaJS.Objs.iter(BetaJS.Browser.Hotkeys.MODIFIERS, function (mod) {
				modifier_map[mod] = {
					pressed: e[mod + "Key"],
					wanted: false
				};
			}, this);
			BetaJS.Objs.iter(keys, function (key) {
				if (key in modifier_map) {
					modifier_map[key].wanted = true;
					kp++;
				} else if (key.length > 1) {
					if (BetaJS.Browser.Hotkeys.SPECIAL_KEYS[key] == code)
						kp++;
				} else if (options.keycode) {
					if (options.keycode == code)
						kp++;
				} else if (character == key || (e.shiftKey && BetaJS.Browser.Hotkeys.SHIFT_NUMS[character] == key)) {
					kp++;
				}
			}, this);
			if (kp == keys.length && BetaJS.Objs.all(modifier_map, function (data) { return data.wanted == data.pressed; })) {
				callback.apply(context || this);
				if (!options.propagate)
					e.preventDefault();
			}
		};
		options.target.on(options.type, func);
		return {
			target: options.target,
			type: options.type,
			func: func
		};
	},
	
	unregister: function (handle) {
		handle.target.off(handle.type, handle.func);
	} 
	
};

BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Info = {
	
	getNavigator: function () {
		return {
			appCodeName: navigator.appCodeName,
			appName: navigator.appName,
			appVersion: navigator.appVersion,
			cookieEnabled: navigator.cookieEnabled,
			onLine: navigator.onLine,
			platform: navigator.platform,
			userAgent: navigator.userAgent
		};
	},
	
	__cache: {},
	
	__cached: function (key, value_func) {
		if (!(key in this.__cache))
			this.__cache[key] = value_func.apply(this);
		return this.__cache[key];
	},

	flash: function () {
		return this.__cached("flash", function () {
			return new BetaJS.Browser.FlashDetect();
		});
	},
	
	isiOS: function () {
		return this.__cached("isiOS", function () {
			var ua = navigator.userAgent;
			return ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1;
		});
	},
	
	isChrome: function () {
		return this.__cached("isChrome", function () {
			return "chrome" in window;
		});
	},
	
	isAndroid: function () {
		return this.__cached("isAndroid", function () {
			return navigator.userAgent.toLowerCase().indexOf("android") != -1;
		});
	},
	
	isWebOS: function () {
		return this.__cached("isWebOS", function () {
			return navigator.userAgent.toLowerCase().indexOf("webos") != -1;
		});
	},

	isWindowsPhone: function () {
		return this.__cached("isWindowsPhone", function () {
			return navigator.userAgent.toLowerCase().indexOf("windows phone") != -1;
		});
	},

	isBlackberry: function () {
		return this.__cached("isBlackberry", function () {
			return navigator.userAgent.toLowerCase().indexOf("blackberry") != -1;
		});
	},

	iOSversion: function () {
		return this.__cached("iOSversion", function () {
			if (!this.isiOS())
				return false;
		    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		    return {
		    	major: parseInt(v[1], 10),
		    	minor: parseInt(v[2], 10),
		    	revision: parseInt(v[3] || 0, 10)
		    };
		});
	},
	
	isMobile: function () {
		return this.__cached("isMobile", function () {
			return this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
		});
	},
	
	isInternetExplorer: function () {
		return this.__cached("isInternetExplorer", function () {
			//return navigator.appName == 'Microsoft Internet Explorer';
			return this.internetExplorerVersion() !== null;
		});
	},
	
	isFirefox: function () {
		return this.__cached("isFirefox", function () {
			return navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
		});
	},
	
	isSafari: function () {
		return this.__cached("isSafari", function () {
			return !this.isChrome() && navigator.userAgent.toLowerCase().indexOf("safari") != -1;
		});
	},
	
	isWindows: function () {
		return this.__cached("isWindows", function () {
			return navigator.appVersion.toLowerCase().indexOf("win") != -1;
		});
	},
	
	isMacOS: function () {
		return this.__cached("isMacOS", function () {
			return navigator.appVersion.toLowerCase().indexOf("mac") != -1;
		});
	},
	
	isUnix: function () {
		return this.__cached("isUnix", function () {
			return navigator.appVersion.toLowerCase().indexOf("x11") != -1;
		});
	},
	
	isLinux: function () {
		return this.__cached("isLinux", function () {
			return navigator.appVersion.toLowerCase().indexOf("linux") != -1;
		});
	},
	
	internetExplorerVersion: function () {
		if (navigator.appName == 'Microsoft Internet Explorer') {
		    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		    if (re.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		} else if (navigator.appName == 'Netscape') {
		    var re2 = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
		    if (re2.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		}
		return null;
	}
	
};




/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

BetaJS.Class.extend("BetaJS.Browser.FlashDetect", {
	
	constructor: function () {
		this._inherited(BetaJS.Browser.FlashDetect, "constructor");
		this.__version = null;
        if (navigator.plugins && navigator.plugins.length > 0) {
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
                this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
        } else if (navigator.appVersion.indexOf("Mac") == -1 && window.execScript) {
            for (var i = 0; i < this.__activeXDetectRules.length; i++) {
		        try {
		            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
		            var version = this.__activeXDetectRules[i].version(obj);
                    if (version) {
                    	this.__version = this.parseActiveXVersion(version);
                    	break;
                    }
		        } catch (err) { }
		    }
		}
	},
	
    parseVersion: function(str) {
        var descParts = str.split(/ +/);
        var majorMinor = descParts[2].split(/\./);
        var revisionStr = descParts[3];
        return {
            "raw": str,
            "major": parseInt(majorMinor[0], 10),
            "minor": parseInt(majorMinor[1], 10), 
            "revisionStr": revisionStr,
            "revision": parseInt(revisionStr.replace(/[a-zA-Z]/g, ""), 10)
        };
    },
	
    parseActiveXVersion : function(str) {
        var versionArray = str.split(",");
        return {
            "raw": str,
            "major": parseInt(versionArray[0].split(" ")[1], 10),
            "minor": parseInt(versionArray[1], 10),
            "revision": parseInt(versionArray[2], 10),
            "revisionStr": versionArray[2]
        };
    },
	
	version: function () {
		return this.__version;
	},
	
	installed: function () {
		return this.__version !== null;
	},
	
	supported: function () {
		return this.installed() || !BetaJS.Browser.Info.isiOS();
	},
	
    majorAtLeast : function (version) {
        return this.installed() && this.version().major >= version;
    },

    minorAtLeast : function (version) {
        return this.installed() && this.version().minor >= version;
    },

    revisionAtLeast : function (version) {
        return this.installed() && this.version().revision >= version;
    },

    versionAtLeast : function (major) {
    	if (!this.installed())
    		return false;
        var properties = [this.version().major, this.version().minor, this.version().revision];
        var len = Math.min(properties.length, arguments.length);
        for (i = 0; i < len; i++) {
            if (properties[i] != arguments[i]) 
            	return properties[i] > arguments[i];
        }
        return true;
    },
	
    __activeXDetectRules: [{
        name: "ShockwaveFlash.ShockwaveFlash.7",
        version: function(obj) {
	        try {
	            return obj.GetVariable("$version");
	        } catch(err) {
	        	return null;
	        }
	    }
	}, {
		name: "ShockwaveFlash.ShockwaveFlash.6",
        version: function(obj) {
            try {
                obj.AllowScriptAccess = "always";
		        try {
		            return obj.GetVariable("$version");
		        } catch(err) {
		        	return null;
		        }
            } catch(err) {
            	return "6,0,21";
            }
        }
	}, {
		name: "ShockwaveFlash.ShockwaveFlash",
		version: function(obj) {
	        try {
	            return obj.GetVariable("$version");
	        } catch(err) {
	        	return null;
	        }
        }
    }]

});
BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Loader = {
	
	loadScript: function (url, callback, context) {
		var executed = false;
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src = url;
		script.onload = script.onreadystatechange = function() {
			if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				executed = true;
				script.onload = script.onreadystatechange = null;
				if (callback)
					callback.apply(context || this, [url]);
				// Does not work properly if we remove the script for some reason if it is used the second time !?
				//head.removeChild(script);
			}
		};
		head.appendChild(script);
	},
	
	loadStyles: function (url, callback, context) {
		var executed = false;
		var head = document.getElementsByTagName("head")[0];
		var style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = url;
		style.onload = style.onreadystatechange = function() {
			if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				executed = true;
				style.onload = style.onreadystatechange = null;
				if (callback)
					callback.apply(context || this, [url]);
			}
		};
		head.appendChild(style);
	},

	inlineStyles: function (styles) {
		BetaJS.$('<style>' + styles + "</style>").appendTo("head");
	}

};
BetaJS.Browser = BetaJS.Browser || {}; 

/** @class */
BetaJS.Browser.Router = BetaJS.Class.extend("BetaJS.Browser.Router", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Browser.Router.prototype */
	{
		
	/** Specifies all routes. Can either be an associative array, an array of associative arrays or a function returning one of those.
	 * 
	 * <p>A route is a mapping from a regular expression to a route descriptor. A route descriptor is either a name of a callback function or a route descriptor associative array.</p>
	 * <p>The callback function should accept the parameters given by the capturing groups of the regular expression</p>
	 * The route descriptor object may contain the following options:
	 * <ul>
	 *   <li>
	 *     action: the callback function; either a string or a function (mandatory)
	 *   </li>
	 *   <li>
	 *     path: name of the route; can be used to look up route (optional)
	 *   </li>
	 *   <li>
	 *     applicable: array of strings or functions or string or function to determine whether the route is applicable; if it is not, it will be skipped (optional)
	 *   </li>
	 *   <li>
	 *     valid: array of strings or functions or string or function to determine whether an applicable route is valid; if it is not, the routing fails (optional)
	 *   </li>
	 * </ul>
	 * @return routes
	 * @example
	 * return {
	 * 	"users/(\d+)/post/(\d+)" : "users_post",
	 *  "users/(\d+)/account": {
	 * 	  action: "users_account",
	 *    path: "users_account_path",
	 *    applicable: "is_user",
	 *    valid: "is_admin"
	 *  }
	 * }
	 */	
	routes: [],
	
	/** Creates a new router with options
	 * <ul>
	 *  <li>routes: adds user defined routes</li> 
	 *  <li>actions: extends the object by user-defined actions</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		this._inherited(BetaJS.Browser.Router, "constructor");
		var routes = BetaJS.Types.is_function(this.routes) ? this.routes() : this.routes;
		if (!BetaJS.Types.is_array(routes))
			routes = [routes];
		if ("routes" in options) {
			if (BetaJS.Types.is_array(options["routes"]))
				routes = routes.concat(options["routes"]);
			else
				routes.push(options["routes"]);
		}
		this.__routes = [];
		this.__paths = {};
		this.__current = null;
		BetaJS.Objs.iter(routes, function (assoc) {
			BetaJS.Objs.iter(assoc, function (obj, key) {
				if (BetaJS.Types.is_string(obj))
					obj = {action: obj};
				obj.key = key;
				obj.route = new RegExp("^" + key + "$");
				if (!("applicable" in obj))
					obj.applicable = [];
				else if (!BetaJS.Types.is_array(obj.applicable))
					obj.applicable = [obj.applicable];
				if (!("valid" in obj))
					obj.valid = [];
				else if (!BetaJS.Types.is_array(obj.valid))
					obj.valid = [obj.valid];
				if (!("path" in obj))
					obj.path = obj.key;
				this.__routes.push(obj);
				this.__paths[obj.path] = obj;
			}, this);
		}, this);
		if ("actions" in options)
			BetaJS.Objs.iter(options.actions, function (action, key) {
				this[key] = action;
			}, this);
	},
	
	destroy: function() {
		this.__leave();
		this._inherited(BetaJS.Browser.Router, "destroy");
	},
	
	/** Parse a given route and map it to the first applicable object that is valid
	 * @param route the route given as a strings
	 * @return either null if nothing applicable and valid could be matched or an associative array with params and routing object as attributes.
	 */
	parse: function (route) {
		for (var i = 0; i < this.__routes.length; ++i) {
			var obj = this.__routes[i];
			var result = obj.route.exec(route);
			if (result !== null) {
				result.shift(1);
				var applicable = true;
				BetaJS.Objs.iter(obj.applicable, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					applicable = applicable && f.apply(this, result);
				}, this);
				if (!applicable)
					continue;
				var valid = true;
				BetaJS.Objs.iter(obj.valid, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					valid = valid && f.apply(this, result);
				}, this);
				if (!valid)
					return null;
				return {
					object: obj,
					params: result
				};
			}
		}
		return null;
	},
	
	/** Looks up the routing object given a path descriptor
 	 * @param path the path descriptor
 	 * @return the routing object
	 */
	object: function (path) {
		return this.__paths[path];
	},
	
	/** Returns the route of a path description
	 * @param path the path descriptor
	 * @param parameters parameters that should be attached to the route (capturing groups)
	 */
	path: function (path) {
		var key = this.object(path).key;
		var args = Array.prototype.slice.apply(arguments, [1]);
		var regex = /\(.*?\)/;
		while (true) {
			var arg = args.shift();
			if (!arg)
				break;
			key = key.replace(regex, arg);
		}
		return key;
	},
	
	/** Navigate to a given route, invoking the matching action.
 	 * @param route the route
	 */
	navigate: function (route) {
		this.trigger("navigate", route);
		var result = this.parse(route);
		if (result === null) {
			this.trigger("navigate-fail", route);
			return false;
		}
		this.trigger("navigate-success", result.object, result.params);
		return this.invoke(result.object, result.params, route);
	},
	
	/** Invoke a routing object with parameters
	 * <p>
	 *   Invokes the protected method _invoke
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 * @param route (optional) an associated route that should be saved
	 */
	invoke: function (object, params, route) {
		route = route || this.path(object.key, params);
		this.trigger("before_invoke", object, params, route);
		this.__enter(object, params, route);
		this.trigger("after_invoke", object, params, route);
		var result = this._invoke(object, params);
		return result;
	},
	
	/** Invokes a routing object with parameters.
	 * <p>
	 *   Can be overwritten and does the invoking.
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 */
	_invoke: function (object, params) {
		var f = object.action;
		if (BetaJS.Types.is_string(f))
			f = this[f];
		return f.apply(this, params);
	},
	
	__leave: function () {
		if (this.__current !== null) {
			this.trigger("leave", this.__current);
			this.__current.destroy();
			this.__current = null;
		}
	},
	
	__enter: function (object, params, route) {
		this.__leave();
		this.__current = new BetaJS.Events.Events();
		this.__current.route = route;
		this.__current.object = object;
		this.__current.params = params;
		this.trigger("enter", this.__current);
	},
	
	/** Returns the current route object.
	 * <ul>
	 *  <li>route: the route as string</li>
	 *  <li>object: the routing object</li>
	 *  <li>params: the params</li>
	 * </ul>
	 */
	current: function () {
		return this.__current;
	}
		
}]);


BetaJS.Class.extend("BetaJS.Browser.RouterHistory", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouterHistory, "constructor");
		this.__router = router;
		this.__history = [];
		router.on("after_invoke", this.__after_invoke, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouterHistory, "destroy");
	},
	
	__after_invoke: function (object, params) {
		this.__history.push({
			object: object,
			params: params
		});
		this.trigger("change");
	},
	
	last: function (index) {
		index = index || 0;
		return this.get(this.count() - 1 - index);
	},
	
	count: function () {
		return this.__history.length;
	},
	
	get: function (index) {
		index = index || 0;
		return this.__history[index];
	},
	
	getRoute: function (index) {
		var item = this.get(index);
		return this.__router.path(item.object.path, item.params);
	},
	
	back: function (index) {
		if (this.count() < 2)
			return null;
		index = index || 0;
		while (index >= 0 && this.count() > 1) {
			this.__history.pop();
			--index;
		}
		var item = this.__history.pop();
		this.trigger("change");
		return this.__router.invoke(item.object, item.params);
	}
	
}]);


BetaJS.Class.extend("BetaJS.Browser.RouteBinder", {

	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouteBinder, "constructor");
		this.__router = router;
		this.__router.on("after_invoke", function (object, params, route) {
			if (this._getExternalRoute() != route)
				this._setExternalRoute(route);
		}, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouteBinder, "destroy");
	},
	
	current: function () {
		return this._getExternalRoute();
	},
	
	_setRoute: function (route) {
		var current = this.__router.current();
		if (current && current.route == route)
			return;
		this.__router.navigate(route);
	},
	
	_getExternalRoute: function () { return ""; },
	_setExternalRoute: function (route) { }
	
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HashRouteBinder", {
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HashRouteBinder, "constructor", router);
		var self = this;
		BetaJS.$(window).on("hashchange.events" + this.cid(), function () {
			self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("hashchange.events" + this.cid());
		this._inherited(BetaJS.Browser.HashRouteBinder, "destroy");
	},
	
	_getExternalRoute: function () {
		var hash = window.location.hash;
		return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
	},
	
	_setExternalRoute: function (route) {
		window.location.hash = "#" + route;
	}

});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HistoryRouteBinder", {
		
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "constructor", router);
		var self = this;
		this.__used = false;
		BetaJS.$(window).on("popstate.events" + this.cid(), function () {
			if (self.__used)
				self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("popstate.events" + this.cid());
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "destroy");
	},

	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.history.pushState({}, document.title, route);
		this.__used = true;
	}
}, {
	supported: function () {
		return window.history && window.history.pushState;
	}
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.LocationRouteBinder", {
	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.location.pathname = route;
	}
});
BetaJS.Stores.StoreException.extend("BetaJS.Stores.RemoteStoreException", {
	
	constructor: function (source) {
		source = BetaJS.Net.AjaxException.ensure(source);
		this._inherited(BetaJS.Stores.RemoteStoreException, "constructor", source.toString());
		this.__source = source;
	},
	
	source: function () {
		return this.__source;
	}
	
});

BetaJS.Stores.BaseStore.extend("BetaJS.Stores.RemoteStore", {

	constructor : function(uri, ajax, options) {
		this._inherited(BetaJS.Stores.RemoteStore, "constructor", options);
		this._uri = uri;
		this.__ajax = ajax;
		this.__options = BetaJS.Objs.extend({
			"update_method": "PUT",
			"uri_mappings": {},
			"bulk_method": "POST",
			"supports_bulk": false
		}, options || {});
	},
	
	getUri: function () {
		return this._uri;
	},
	
	prepare_uri: function (action, data) {
		if (this.__options["uri_mappings"][action])
			return this.__options["uri_mappings"][action](data);
		if (action == "remove" || action == "get" || action == "update")
			return this.getUri() + "/" + data[this._id_key];
		return this.getUri();
	},
	
	_encode_query: function (query, options) {
		return {
			uri: this.prepare_uri("query")
		};		
	},
	
	__invoke: function (options, callbacks, parse_json) {
		if (callbacks) {
			return this.__ajax.asyncCall(options, {
				success: function (result) {
					if (parse_json && BetaJS.Types.is_string(result)) {
						try {
							result = JSON.parse(result);
						} catch (e) {}
					}
					BetaJS.SyncAsync.callback(callbacks, "success", result);
				}, exception: function (e) {
					BetaJS.SyncAsync.callback(callbacks, "exception", new BetaJS.Stores.RemoteStoreException(e));					
				}
			});
		} else {
			try {
				var result = this.__ajax.syncCall(options);
				if (parse_json && BetaJS.Types.is_string(result)) {
					try {
						return JSON.parse(result);
					} catch (e) {}
				}
				return result;
			} catch (e) {
				throw new BetaJS.Stores.RemoteStoreException(e); 			
			}
			return false;
		}
	},
	
	_insert : function(data, callbacks) {
		return this.__invoke({
			method: "POST",
			uri: this.prepare_uri("insert", data),
			data: data
		}, callbacks, true);
	},

	_get : function(id, callbacks) {
		var data = {};
		data[this._id_key] = id;
		return this.__invoke({
			uri: this.prepare_uri("get", data)
		}, callbacks);
	},

	_update : function(id, data, callbacks) {
		var copy = BetaJS.Objs.clone(data, 1);
		copy[this._id_key] = id;
		return this.__invoke({
			method: this.__options.update_method,
			uri: this.prepare_uri("update", copy),
			data: data
		}, callbacks);
	},
	
	_remove : function(id, callbacks) {
		var data = {};
		data[this._id_key] = id;
		return this.__invoke({
			method: "DELETE",
			uri: this.prepare_uri("remove", data)
		}, callbacks);
	},

	_query : function(query, options, callbacks) {
		return this.__invoke(this._encode_query(query, options), callbacks, true);
	},
	
	bulk: function (commits, optimistic, callbacks) {
		if (!this.__options["supports_bulk"]) 
			return this._inherited(BetaJS.Stores.RemoteStore, "bulk", commits, optimistic);
		return this.__invoke({
			method: this.__options["bulk_method"],
			uri: this.prepare_uri("bulk"),
			data: commits
		});
	}	
	
});


BetaJS.Stores.RemoteStore.extend("BetaJS.Stores.QueryGetParamsRemoteStore", {

	constructor : function(uri, ajax, capability_params, options) {
		this._inherited(BetaJS.Stores.QueryGetParamsRemoteStore, "constructor", uri, ajax, options);
		this.__capability_params = capability_params;
	},
	
	_query_capabilities: function () {
		var caps = {};
		if ("skip" in this.__capability_params)
			caps.skip = true;
		if ("limit" in this.__capability_params)
			caps.limit = true;
		if ("query" in this.__capability_params)
			caps.query = true;
		if ("sort" in this.__capability_params)
			caps.sort = true;
		return caps;
	},

	_encode_query: function (query, options) {
		options = options || {};
		var uri = this.getUri() + "?"; 
		if (options["skip"] && "skip" in this.__capability_params)
			uri += this.__capability_params["skip"] + "=" + options["skip"] + "&";
		if (options["limit"] && "limit" in this.__capability_params)
			uri += this.__capability_params["limit"] + "=" + options["limit"] + "&";
		if (options["sort"] && "sort" in this.__capability_params)
			uri += this.__capability_params["sort"] + "=" + JSON.stringify(options["sort"]) + "&";
		if ("query" in this.__capability_params)
			uri += this.__capability_params["query"] + "=" + JSON.stringify(query) + "&";
		return {
			uri: uri
		};		
	}

});
BetaJS.$ = "jQuery" in window ? window.jQuery : null;

BetaJS.Exceptions.Exception.extend("BetaJS.Views.ViewException");

/** @class */
BetaJS.Views.View = BetaJS.Class.extend("BetaJS.Views.View", [
    BetaJS.Events.EventsMixin,                                            
	BetaJS.Events.ListenMixin,
	BetaJS.Properties.PropertiesMixin,
	BetaJS.Classes.ModuleMixin,
	/** @lends BetaJS.Views.View.prototype */
	{
		
    /** Container html element of the view as jquery object
     */
	$el: null,
	
    
    /** Returns all templates to be pre-loaded.
     * <p>It should return an associative array of templates. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of templates
     * @example
     * return {
     * 	"default": BetaJS.Templates.Cached["my-view-template"],
     *  "inner": $("#inner-template"),
     *  "item": '< p >{%= item.get("text") %}< /p >'
     * }
     */
	_templates: function () {
		return {};
	},
	
    /** Returns all dynamics to be pre-loaded.
     * <p>It should return an associative array of dynamics. The keys are user-defined identifiers, the values are either the template strings or a jquery object containing the template.</p>
     * @return associative array of dynamics
     */
	_dynamics: function () {
		// {"name": "string" or jquery selector}
		return {};
	},
	
	/** Returns all events that the view is listening to.
	 * <p>It should return an associative array of event bindings. The keys are strings composed of the event name and the jquery selector that specifies to which elements the event should be bound to. The value is the name of the method that should be called when the event is fired.</p>
	 * <p>Note: It is also possible to return an array of associative arrays. You should do that if you want to bind more than one method to a single key.</p> 
	 * @return associative array of events
	 * @example
	 * return {
	 * 	"click #button": "_clickButton",
	 *  "change #input": "_inputChanged",
	 *  "blur": "_containerElementBlur"
	 * }  
	 */
	_events: function () {
		// [{"event selector": "function"}]
		return [];
	},
	
	_global_events: function () {
		// [{"event selector": "function"}]
		return [];
	},

	/** Returns all default css classes that should be used for this view. 
	 * <p>They can be overwritten by the parent view or by options.
	 * The keys are internal identifiers that the view uses to lookup the css classed that are to be used.
	 * The values are the actual names of the css classes.</p>
	 * @return associative array of css classes
	 * @example
	 * return {
	 * 	"main-class": "default-main-class",
	 *  "item-class": "default-item-class"
	 * }
	 */
	_css: function () {
		// {"identifier": "css-class"}
		return {};
	},
	
	/** Returns css class by identifier.
	 * <p>The return strategy has the following priorities: options, parent, defaults.</p>
	 * @param ident identifier of class
	 * @example
	 * this.css("main_class")
	 */
	css: function (ident) {
		if (this.__css[ident])
			return this.__css[ident];
		var css = null;
		if (this.__parent) {
			css = this.__parent.css(ident);
			if (css && css != ident)
				return css;
		}
		css = this._css();
		if (css[ident])
			return css[ident];
		return ident;
	},
	
	/** Is called by the view when the view needs to be rendered.
	 * <p>By default, the function renders the template or dynamic named "default" and passes the default arguments to it.</p>
	 * 
	 */
	_render: function () {
		if (this.__html)
			this.$el.html(this.__html);
		else if (this.__templates["default"])
			this.$el.html(this.evaluateTemplate("default", {}));
		else if (this.__dynamics["default"])
			this.evaluateDynamics("default", this.$el, {}, {name: "default"});
	},
	
	/** Returns a template associated with the view
	 * @param key identifier of template
	 * @return template object
	 */
	templates: function (key) {
		return key in this.__templates ? this.__templates[key] : null;
	},
	
	/** Returns a dynamic associated with the view
	 * @param key identifier of dynamic
	 * @return template object
	 */
	dynamics: function (key) {
		return key in this.__dynamics ? this.__dynamics[key] : null;
	},

	/** Support Routines for Templates and Dynamics
	 * <ul>
	 *  <li>supp.css(key): Returns css class associated with key</li>
	 *  <li>supp.attrs(obj): Returns html code for all html attributes specified by obj</li>
	 *  <li>supp.styles(obj): Returns html code for all styles specified by obj</li>
	 *  <li>supp.selector(name): Returns html code for data-selector='name'</li>
	 * </ul>
	 * @example
	 * < label class="{%= supp.css("main-class") %}" {%= supp.attrs({id: "test", title: "foo"}) %} {%= supp.selector("bar") %} > < /label >
	 * results in
	 * < label class="default-main-class" id="test" title="foo" data-selector="bar" > < /label >
	 */
	_supp: function () {
		return {
			__context: this,
			css: function (key) {
				return this.__context.css(key);
			},
			attrs: function (obj) {
				var s = "";
				for (var key in obj)
					s += (!obj[key] ? key : (key + "='" + obj[key] + "'")) + " ";
				return s;
			},
			styles: function (obj) {
				var s = "";
				for (var key in obj)
					s += (key + ":" + obj[key] + "") + ";";
				return s;
			},
			selector: function (name) {
				return "data-selector='" + name + "' ";
			},
			view_id: this.cid()
		};
	},
	
	/** Returns all arguments that are passed to every template by default.
	 * <p>By default, this function returns the support routines supp and all properties that have been set via this.set or that have been set via this._setOptionProperty</p>
	 * @return associative array of template arguments  
	 */
	templateArguments: function () {
		var args = this.getAll();
		args.supp = this._supp();
		return args;
	},
	
	/** Evaluates a template with used-defined arguments.
	 * 
	 * @param key identifier of template 
	 * @param args arguments to be given to the template (optional)
	 * @return html string of evaluated template
	 */
	evaluateTemplate: function (key, args) {
		args = args || {};
		return this.__templates[key].evaluate(BetaJS.Objs.extend(args, this.templateArguments()));
	},
	
	/** Evaluates a dynamic and binds it to a given element with used-defined arguments and options.
	 * 
	 * @param key identifier of dynamic
	 * @param element jquery element to which the dynamic should be bound to 
	 * @param args arguments to be given to the dynamic (optional)
	 * @param options options to be passed to the dynamic (name is the most important one, see documentation)
	 * @return dynamic instance
	 */
	evaluateDynamics: function (key, element, args, options) {
		return this.__dynamics[key].renderInstance(element, BetaJS.Objs.extend(options || {}, {args: args || {}}));
	},

	/** Sets a private variable from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param prefix (optional) per default is "__"
	 */
	_setOption: function (options, key, value, prefix) {
		prefix = prefix ? prefix : "__";
		this[prefix + key] = (options && key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value;
	},
	
	/** Sets a private typed variable from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param type param type
	 * @param prefix (optional) per default is "__"
	 */
	_setOptionTyped: function (options, key, value, type, prefix) {
		this._setOption(options, key, this.cls._parseType(value, type), prefix);
	},

	/** Sets property variable (that will be passed to templates and dynamics by default) from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 */
	_setOptionProperty: function (options, key, value) {
		this.set(key, (options && key in options) && (BetaJS.Types.is_defined(options[key])) ? options[key] : value);
	},
	
	/** Sets typed property variable (that will be passed to templates and dynamics by default) from an option array
	 * @param options option associative array
	 * @param key name of option
	 * @param value default value of option if not given
	 * @param type param type
	 */
	_setOptionPropertyTyped: function (options, key, value, typed) {
		this._setOptionProperty(options, key, this.cls._parseType(value, type));
	},
	
	/** Creates a new view with options
	 * <ul>
	 *  <li>el: the element to which the view should bind to; either a jquery selector or a jquery element</li> 
	 *  <li>visible: (default true) should the view be visible initially</li>
	 *  <li>html: (default null) string that should be used as default rendering</li>
	 *  <li>events: (default []) events that should be used additionally</li>
	 *  <li>attributes: (default {}) attributes that should be attached to container</li>
	 *  <li>el_classes: (default []) css classes that should be attached to container</li>
	 *  <li>el_styles: (default {}) styles that should be attached to container</li>
	 *  <li>children_classes: (default []) css classes that should be attached to all direct children</li>
	 *  <li>children_styles: (default {}) styles that should be attached to all direct children</li>
	 *  <li>css: (default {}) css classes that should be overwritten</li>
	 *  <li>templates: (default {}) templates that should be overwritten</li>
	 *  <li>dynamics: (default: {}) dynamics that should be overwritten</li>
	 *  <li>properties: (default: {}) properties that should be added (and passed to templates and dynamics)</li>
	 *  <li>invalidate_on_change: (default: false) rerender view on property change</li>
	 *  <li>invalidate_on_show: (default: false) invalidate view on show</li>
	 *  <li>append_to_el: (default: false) append to el instead of replacing content</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.View, "constructor");
		this._setOption(options, "el", null);
		this._setOption(options, "visible", true);
		this._setOption(options, "html", null);
		this._setOption(options, "events", []);
		this._setOption(options, "attributes", {});
		this._setOption(options, "invalidate_on_show", false);
		this._setOption(options, "append_to_el", false);
		this.__old_attributes = {};
		this._setOption(options, "el_classes", []);
		if (BetaJS.Types.is_string(this.__el_classes))
			this.__el_classes = this.__el_classes.split(" ");
		this.__added_el_classes = [];
		this._setOption(options, "el_styles", {});
		this._setOption(options, "children_styles", {});
		this._setOption(options, "children_classes", []);
		if (BetaJS.Types.is_string(this.__children_classes))
			this.__children_classes = this.__children_classes.split(" ");
		this._setOption(options, "invalidate_on_change", false);
		this.__old_el_styles = {};
		this._setOption(options, "css", {});
		this.__parent = null;
		this.__children = {};
		this.__active = false;
		this.$el = null;
		var events = BetaJS.Types.is_function(this._events) ? this._events() : this._events;
		if (!BetaJS.Types.is_array(events))
			events = [events]; 
		this.__events = events.concat(this.__events);

		var global_events = BetaJS.Types.is_function(this._global_events) ? this._global_events() : this._global_events;
		if (!BetaJS.Types.is_array(global_events))
			global_events = [global_events]; 
		this.__global_events = global_events;

		var templates = BetaJS.Objs.extend(BetaJS.Types.is_function(this._templates) ? this._templates() : this._templates, options["templates"] || {});
		if ("template" in options)
			templates["default"] = options["template"];
		this.__templates = {};
		var key = null;
		for (key in templates) {
			if (!templates[key])
				throw new BetaJS.Views.ViewException("Could not find template '" + key + "' in View '" + this.cls.classname + "'");
			this.__templates[key] = new BetaJS.Templates.Template(BetaJS.Types.is_string(templates[key]) ? templates[key] : templates[key].html());
		}

		var dynamics = BetaJS.Objs.extend(BetaJS.Types.is_function(this._dynamics) ? this._dynamics() : this._dynamics, options["dynamics"] || {});
		if ("dynamic" in options)
			dynamics["default"] = options["dynamic"];
		this.__dynamics = {};
		for (key in dynamics)
			this.__dynamics[key] = new BetaJS.Views.DynamicTemplate(this, BetaJS.Types.is_string(dynamics[key]) ? dynamics[key] : dynamics[key].html());

		this.setAll(options["properties"] || {});
		if (this.__invalidate_on_change)
			this.on("change", function () {
				this.invalidate();
			}, this);

		this.__modules = {};
		BetaJS.Objs.iter(options.modules || [], this.add_module, this);

		this._notify("created", options);
		this.ns = {};
		var domain = this._domain();
		var domain_defaults = this._domain_defaults();
		var view_name = null;
		if (!BetaJS.Types.is_empty(domain)) {
			var viewlist = [];
			for (view_name in domain)
				viewlist.push({
					name: view_name,
					data: domain[view_name]
				});
			viewlist = BetaJS.Sort.dependency_sort(viewlist, function (data) {
				return data.name;
			}, function (data) {
				return data.data.before || [];
			}, function (data) {
				var after = data.data.after || [];
				if (data.data.parent)
					after.push(data.data.parent);
				return after;
			});
			for (var i = 0; i < viewlist.length; ++i) {
				view_name = viewlist[i].name;
				var record = viewlist[i].data;
				var record_options = record.options || {};
				if (BetaJS.Types.is_function(record_options))
					record_options = record_options.apply(this, [this]);
				var default_options = domain_defaults[record.type] || {};
				if (BetaJS.Types.is_function(default_options))
					default_options = default_options.apply(this, [this]);
				record_options = BetaJS.Objs.tree_merge(default_options, record_options);
				if (record.type in BetaJS.Views)
					record.type = BetaJS.Views[record.type];
				if (BetaJS.Types.is_string(record.type))
					record.type = BetaJS.Scopes.resolve(record.type);
				var view = new record.type(record_options);
				this.ns[view_name] = view;
				var parent_options = record.parent_options || {};
				var parent = this;
				if (record.parent)
					parent = BetaJS.Scopes.resolve(record.parent, this.ns);
				if (record.method)
					record.method(parent, view);
				else
					parent.addChild(view, parent_options);
				view.domain = this;
				var event = null;
				for (event in record.events || {})
					view.on(event, record.events[event], view);
				for (event in record.listeners || {})
					this.on(event, record.listeners[event], view);
			}		
		}
	},
	
	_domain: function () {
		return {};
	},
	
	_domain_defaults: function () {
		return {};
	},

	/** Returns whether this view is active (i.e. bound and rendered) 
	 * @return active  
	 */
	isActive: function () {
		return this.__active;
	},
	
	/** Activates view and all added sub views
	 *  
	 */
	activate: function () {
		if (this.isActive())
			return this;
		if (this.__parent && !this.__parent.isActive())
			return null;
		if (this.__parent)
			this.$el = !this.__el ? this.__parent.$el : this.__parent.$(this.__el);
		else
			this.$el = BetaJS.$(this.__el);
		if (this.$el.size() === 0)
			this.$el = null;
		if (!this.$el)
			return null;
		if (this.__append_to_el) {
			this.$el.append("<div data-view-id='" + this.cid() + "'></div>");
			this.$el = this.$el.find("[data-view-id='" + this.cid() + "']");
		}
		this.__old_attributes = {};
		var key = null;
		var old_value = null;
		for (key in this.__attributes) {
			old_value = this.$el.attr(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_attributes[key] = old_value;
			else
				this.__old_attributes[key] = null;
			this.$el.attr(key, this.__attributes[key]);
		}
		this.__added_el_classes = [];
		var new_el_classes = this._el_classes().concat(this.__el_classes);
		for (var i = 0; i < new_el_classes.length; ++i) {
			if (!this.$el.hasClass(new_el_classes[i])) {
				this.$el.addClass(new_el_classes[i]);
				this.__added_el_classes.push(new_el_classes[i]);
			}
		}
		this.__old_el_styles = {};
		var new_el_styles = BetaJS.Objs.extend(this._el_styles(), this.__el_styles);
		for (key in new_el_styles)  {
			old_value = this.$el.css(key);
			if (BetaJS.Types.is_defined(old_value))
				this.__old_el_styles[key] = old_value;
			else
				this.__old_el_styles[key] = null;
			this.$el.css(key, new_el_styles[key]);
		}
		this.__bind();
		if (!this.__visible)
			this.$el.css("display", this.__visible ? "" : "none");
		this.__active = true;
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
		this._notify("activate");
		this.trigger("activate");
		if (this.__visible)
			this.trigger("show");
		this.trigger("visibility", this.__visible);
		this.trigger("resize");
		return this;
	},
	
	/** Deactivates view and all added sub views
	 * 
	 */
	deactivate: function () {
		if (!this.isActive())
			return false;
		if (this.__visible)
			this.trigger("hide");
		this.trigger("visibility", false);
		this._notify("deactivate");
		this.trigger("deactivate");
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		this.__active = false;
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__unbind();
		this.$el.html("");
		var key = null;
		for (key in this.__old_attributes) 
			this.$el.attr(key, this.__old_attributes[key]);
		for (var i = 0; i < this.__added_el_classes.length; ++i)
			this.$el.removeClass(this.__added_el_classes[i]);
		for (key in this.__old_el_styles) 
			this.$el.css(key, this.__old_el_styles[key]);
		if (this.__append_to_el)
			this.$el.remove();
		this.$el = null;
		return true;
	},
	
	/** Returns an associate array of styles that should be attached to the element
	 * @return styles
	 * @example
	 * return {"color": "red"};
	 * or
	 * var styles = {};
	 * styles.color = "red";
	 * return styles; 
	 */
	_el_styles: function () {
		return {};
	},
	
	/** Returns an array of classes that should be attached to the element
	 * @return classes
	 * @example
	 * return ["test-css-class"]
	 */
	_el_classes: function () {
		return [];
	},
	
	/** Finds an element within the container of the view
	 * @param selector a jquery selector
	 * @return the jquery element(s) it matched 
	 */
	$: function(selector) {
		return this.$el.find(selector);
	},
	
	/** Finds an element within a subelement that matches a set of data attributes
	 * 
	 * @param selectors associative array, e.g. {"selector": "container", "view-id": this.cid()}
	 * @param elem (optional, default is $el) the element we search in
	 * @return the jquery element(s) it matched
	 */
	$data: function(selectors, elem) {
		if (!elem)
			elem = this.$el;
		var s = "";
		for (var key in selectors)
			s += "[data-" + key + "='" + selectors[key] + "']";
		return elem.find(s);
	},
	
	/** Destroys the view
	 * 
	 */
	destroy: function () {
		this.deactivate();
		this.setParent(null);
		var c = this.__children;
		this.__children = {};		
		BetaJS.Objs.iter(c, function (child) {
			child.view.destroy();
		});
		this.__children = {};
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.destroy();
		}, this);
		BetaJS.Objs.iter(this.__templates, function (template) {
			template.destroy();
		}, this);
		this.trigger("destroy");
		this._inherited(BetaJS.Views.View, "destroy");
	},
	
	/** Makes the view visible
	 * 
	 */
	show: function () {
		this.setVisibility(true);
	},
	
	/** Makes the view invisible
	 * 
	 */
	hide: function () {
		this.setVisibility(false);
	},
	
	isVisible: function () {
		return this.__visible;
	},
	
	/** Sets the visibility of the view
	 * @param visible visibility
	 */
	setVisibility: function (visible) {
		if (visible == this.__visible)
			return;
		this.__visible = visible;
		if (this.isActive()) {
			this.$el.css("display", this.__visible ? "" : "none");
			if (this.__visible) {
				this.trigger("resize");
				if (this.__invalidate_on_show)
					this.invalidate();	
			}
			this.trigger(visible ? "show" : "hide");
			this.trigger("visibility", visible);		
		}
		if (this.__parent)
			this.__parent.updateChildVisibility(this);	
	},
	
	updateChildVisibility: function (child) {		
	},
	
	toggle: function () {
		this.setVisibility(!this.isVisible());
	},
	
	__bind: function () {
		var self = this;
		this.__unbind();
		BetaJS.Objs.iter(this.__events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = BetaJS.Types.is_function(value) ? value : self[value];
		        var match = key.match(BetaJS.Views.BIND_EVENT_SPLITTER);
		        var event = match[1];
		        var selector = match[2];
		        event = event + ".events" + self.cid();
		        var method = BetaJS.Functions.as_method(func, self);
		        if (selector === '')
		        	self.$el.on(event, method);
		        else
		        	self.$el.on(event, selector, method);
			});
		});
		BetaJS.Objs.iter(this.__global_events, function (obj) {
			BetaJS.Objs.iter(obj, function (value, key) {
				var func = BetaJS.Types.is_function(value) ? value : self[value];
		        var match = key.match(BetaJS.Views.BIND_EVENT_SPLITTER);
		        var event = match[1];
		        var selector = match[2];
		        event = event + ".events" + self.cid();
		        var method = BetaJS.Functions.as_method(func, self);
		        if (selector === '')
		        	BetaJS.$(document).on(event, method);
		        else
		        	BetaJS.$(document).on(event, selector, method);
			});
		});
	},
	
	__unbind: function () {
		this.$el.off('.events' + this.cid());
		BetaJS.$(document).off('.events' + this.cid());
	},
	
	__render: function () {
		if (!this.isActive())
			return;
		this._render();
		var q = this.$el.children();
		if (!BetaJS.Types.is_empty(this.__children_styles)) {
			for (var key in this.__children_styles)
				q.css(key, this.__children_styles[key]);
		}
		BetaJS.Objs.iter(this.__children_classes, function (cls) {
			q.addClass(cls);	
		});
		this.trigger("render");
	},
	
	/** Manually triggers rerendering of the view
	 * 
	 */
	invalidate: function () {
		if (!this.isActive())
			return;
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.deactivate();
		});
		BetaJS.Objs.iter(this.__dynamics, function (dynamic) {
			dynamic.reset();
		}, this);
		this.__render();
		BetaJS.Objs.iter(this.__children, function (child) {
			child.view.activate();
		});
	},
	
	/** Sets the container element of the view
	 * @param el new container element
 	 */
	setEl: function (el) {
		if (this.isActive()) {
			this.deactivate();
			this.__el = el;
			this.activate();
		}
		else
			this.__el = el;
	},
	
	/** Returns the parent view
	 * @return parent view
	 */
	getParent: function () {
		return this.__parent;
	},
	
	/** Checks whether a view has been added as a child
	 * 
 	 * @param child view in question
 	 * @return true if view has been added
	 */
	hasChild: function (child) {
		return child && child.cid() in this.__children;
	},
	
	/** Changes the parent view
	 * @param parent the new parent
	 */
	setParent: function (parent) {
		if (parent == this.__parent)
			return;
		this.deactivate();
		if (this.__parent) {
			this._unbindParent(this.__parent);
			var old_parent = this.__parent;
			this.__parent.off(null, null, this);
			this.__parent = null;
			old_parent.removeChild(this);
		}
		if (parent) {
			this.__parent = parent;
			parent.addChild(this);
			this._bindParent(parent);
			if (parent.isActive())
				this.activate();
		}
	},
	
	_bindParent: function () {		
	},

	_unbindParent: function () {		
	},
	
	/** Returns all child views
	 * @return array of child views 
	 */
	children: function () {
		var children = {};
		BetaJS.Objs.iter(this.__children, function (child, key) {
			children[key] = child.view;
		}, this);
		return children;
	},
	
	childOptions: function (child) {
		return this.__children[child.cid()].options;
	},
	
	/** Adds an array of child views
	 * 
 	 * @param children array of views
	 */
	addChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.addChild(child);
		}, this);
	},

	/** Adds a child view
	 * 
 	 * @param child view
	 */	
	addChild: function (child, options) {
		if (!this.hasChild(child)) {
			options = options || {};
			this.__children[child.cid()] = {
				view: child,
				options: options
			};
			this._notify("addChild", child, options);
			child.setParent(this);
			if (this.isActive() && this.isVisible())
				this.trigger("resize");
			return child;
		}
		return null;
	},
	
	/** Removes an array of child views
	 * 
 	 * @param children array of views
	 */
	removeChildren: function (children) {
		BetaJS.Objs.iter(children, function (child) {
			this.removeChild(child);
		}, this);
	},
	
	/** Removes a child view
	 * 
 	 * @param child view
	 */	
	removeChild: function (child) {
		if (this.hasChild(child)) {
			delete this.__children[child.cid()];
			child.setParent(null);
			child.off(null, null, this);
			this._notify("removeChild", child);
			if (this.isActive() && this.isVisible())
				this.trigger("resize");
		}
	},
	
	/** Returns the width (excluding margin, border, and padding) of the view
	 * @return width
	 */
	width: function () {
		return this.$el.width();
	},
	
	/** Returns the inner width (excluding margin, border, but including padding) of the view
	 * @return inner width
	 */
	innerWidth: function () {
		return this.$el.innerWidth();
	},

	/** Returns the outer width (including margin, border, and padding) of the view
	 * @return outer width
	 */
	outerWidth: function () {
		return this.$el.outerWidth();
	},

	/** Returns the height (excluding margin, border, and padding) of the view
	 * @return height
	 */
	height: function () {
		return this.$el.height();
	},
	
	/** Returns the inner height (excluding margin, border, but including padding) of the view
	 * @return inner height
	 */
	innerHeight: function () {
		return this.$el.innerHeight();
	},

	/** Returns the outer height (including margin, border, and padding) of the view
	 * @return outer height
	 */
	outerHeight: function () {
		return this.$el.outerHeight();
	}
	
}], {
	
	parseType: function (value, type) {
		if (BetaJS.Types.is_defined(value) && BetaJS.Types.is_string(value)) {
			value = value.replace(/\s+/g, '');
			if (type == "int")
				return parseInt(value, 10);
			else if (type == "array")
				return value.split(",");
			else if (type == "bool")
				return value === "" || BetaJS.Strings.parseBool(value);
			else if (type == "object" || type == "function")
				return BetaJS.Scopes.resolve(value);
		}
		return value;
	}

});

BetaJS.Views.BIND_EVENT_SPLITTER = /^(\S+)\s*(.*)$/;

BetaJS.Class.extend("BetaJS.Views.DynamicTemplate", {
	
	constructor: function (parent, template_string) {
		this._inherited(BetaJS.Views.DynamicTemplate, "constructor");
		this.__parent = parent;
		this.__template = new BetaJS.Templates.Template(template_string);
		this.__instances = {};
		this.__instances_by_name = {};
	},
	
	reset: function () {
		BetaJS.Objs.iter(this.__instances, function (instance) {
			this.removeInstance(instance);
		}, this);
	},
	
	destroy: function () {
		this.reset();
		this._inherited(BetaJS.Views.DynamicTemplate, "destroy");
	},
	
	renderInstance: function (binder, options) {
		options = options || {};
		if (options["name"])
			this.removeInstanceByName(options["name"]);
		var instance = new BetaJS.Views.DynamicTemplateInstance(this, binder, options);
		this.__instances[instance.cid()] = instance;
		if (options["name"])
			this.__instances_by_name[name] = instance;
	},
	
	removeInstanceByName: function (name) {
		if (name in this.__instances_by_name)
			this.removeInstance(this.__instances_by_name[name]);
	},
	
	removeInstance: function (instance) {
		delete this.__instances[instance.cid()];
		delete this.__instances_by_name[instance.name()];
		instance.destroy();
	},
	
	view: function () {
		return this.__parent;
	},
	
	template: function () {
		return this.__template;
	}
	
});

BetaJS.Class.extend("BetaJS.Views.DynamicTemplateInstance", [
	BetaJS.Events.ListenMixin, {
		
	__bind: {
		attr: function (attribute, variable) {
			return this.__context.__bind_attribute(attribute, variable);
		},
		attrs: function (attributes) {
			var s = "";
			for (attribute in attributes)
				s += this.attr(attribute, attributes[attribute]) + " ";
			return s;
		},
		value: function (variable) {
			return this.__context.__bind_value(variable);
		},
		inner: function (variable) {
			return this.__context.__bind_inner(variable);
		},
		css_if: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, true);
		},
		css_if_not: function (css, variable) {
			return this.__context.__bind_css_if(css, variable, false);
		}
	},
	
	__new_element: function (base) {
		var id = BetaJS.Ids.uniqueId();
		this.__elements[id] = BetaJS.Objs.extend({
			id: id,
			$el: null
		}, base);
		return this.__elements[id];
	},
	
	__decompose_variable: function (variable) {
		var parts = variable.split(".");
		return {
			object: parts.length == 1 ? this.__parent.view() : this.__args[parts[0]],
			key: parts.length == 1 ? variable : parts[1]
		};
	},
	
	__get_variable: function (variable) {
		var dec = this.__decompose_variable(variable);
		return dec.object.get(dec.key);
	},
	
	__set_variable: function (variable, value) {
		var dec = this.__decompose_variable(variable);
		return dec.object.set(dec.key, value);
	},

	__update_element: function (element) {
		var value = this.__get_variable(element.variable);
		if (element.type == "inner")
			element.$el.html(value);
		else if (element.type == "value") {
			if (element.$el.val() != value)
				element.$el.val(value);
		} else if (element.type == "attribute")
			element.$el.attr(element.attribute, value);
		else if (element.type == "css") {
			if (!element.positive)
				value = !value;
			if (value)
				element.$el.addClass(this.__parent.view().css(element.css));
			else
				element.$el.removeClass(this.__parent.view().css(element.css));
		}
	},
	
	__prepare_element: function (element) {
		var self = this;
		element.$el = this.$el.find(element.selector);
		if (element.type == "inner" || element.type == "css")
			this.__update_element(element);
		else if (element.type == "value")
			element.$el.on("change input keyup paste", function () {
				self.__set_variable(element.variable, element.$el.val());
			});
	},
	
	__bind_attribute: function (attribute, variable) {
		var element = this.__new_element({
			type: "attribute",
			attribute: attribute,
			variable: variable
		});
		var selector = "data-bind-" + attribute + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " " + attribute + "='" + dec.object.get(dec.key) + "'";
	},
	
	__bind_css_if: function (css, variable, positive) {
		var element = this.__new_element({
			type: "css",
			css: css,
			variable: variable,
			positive: positive
		});
		var selector = "data-bind-css-" + css + "='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
	},
	
	__bind_value: function (variable) {
		var element = this.__new_element({
			type: "value",
			variable: variable
		});
		var selector = "data-bind-value='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector + " value='" + dec.object.get(dec.key) + "'";
	},

	__bind_inner: function (variable) {
		var element = this.__new_element({
			type: "inner",
			variable: variable
		});
		var selector = "data-bind-inner='" + element.id + "'";
		element.selector = "[" + selector + "]";
		var dec = this.__decompose_variable(variable);
		this.listenOn(dec.object, "change:" + dec.key, function () { this.__update_element(element); }, this);
		return selector;
	},

	constructor: function (parent, binder, options) {
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "constructor");
		this.__elements = {};
		this.__inners = {};
		options = options || {};
		if (options["name"])
			this.__name = name;
		this.__parent = parent;
		this.$el = binder;
		this.__args = BetaJS.Objs.extend(options["args"] || {}, this.__parent.view().templateArguments());
		this.__args.bind = BetaJS.Objs.extend({__context: this}, this.__bind);
		this.$el.html(parent.template().evaluate(this.__args));
		BetaJS.Objs.iter(this.__elements, function (element) { this.__prepare_element(element); }, this);
	},
	
	destroy: function () {
		BetaJS.Objs.iter(this.__elements, function (element) {
			element.$el.off();
		}, this);
		this._inherited(BetaJS.Views.DynamicTemplateInstance, "destroy");
	},
	
	name: function () {
		return this.__name;
	}
	
}]);

BetaJS.Views.ActiveDom = {
	
	__prefix_alias: ["bjs", "betajs"],
	
	__view_alias: {},
	
	__views: {},
	
	__active: false,
	
	__on_add_element: function (event) {
		var element = BetaJS.$(event.target);
		if (!element)
			return;
		var done = false;
		if (element.prop("tagName")) {
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				if (element.prop("tagName").toLowerCase() == alias + "view") {
					BetaJS.Views.ActiveDom.__attach(element);
					done = true;
				}
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				if (element.prop("tagName").toLowerCase() == alias) {
					BetaJS.Views.ActiveDom.__attach(element, data);
					done = true;
				}
			});
		}
		if (!done) {
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				element.find(alias + "view").each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this));
				});
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				element.find(alias).each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this), data);
				});
			});
		}
	},
	
	__on_remove_element: function (event) {
		var element = BetaJS.$(event.target); 
		if (element.attr("data-active-dom-id") in BetaJS.Views.ActiveDom.__views)
			BetaJS.Views.ActiveDom.__views[element.attr("data-active-dom-id")].destroy();
		else {
			element.find("[data-active-dom-id]").each(function () {
				var el = BetaJS.$(this);
				if (el.attr("data-active-dom-id") in BetaJS.Views.ActiveDom.__views)
					BetaJS.Views.ActiveDom.__views[el.attr("data-active-dom-id")].destroy();
			});
		}
	},
	
	__attach: function (element, meta_attrs) {
		// Prevent double attachment
		if (element.attr("data-active-dom-element"))
			return;
		var process = function (key, value) {
			var i = 0;
			while (i < BetaJS.Views.ActiveDom.__prefix_alias.length) {
				var alias = BetaJS.Views.ActiveDom.__prefix_alias[i];
				if (BetaJS.Strings.starts_with(key, alias + "-")) {
					key = BetaJS.Strings.strip_start(key, alias + "-");
					if (BetaJS.Strings.starts_with(key, "child-")) {
						key = BetaJS.Strings.strip_start(key, "child-");
						dom_child_attrs[key] = value;
					} else if (key in meta_attrs_scheme)
						meta_attrs[key] = value;
					else
						option_attrs[key] = value;
					return;
				} else
				++i;
			}
			dom_attrs[key] = value;			
		};
		var element_data = function (element) {
			var query = element.find("script[type='text/param']");
			return BetaJS.Strings.nltrim(query.length > 0 ? query.html() : element.html());
		};
		var dom_attrs = {};
		var dom_child_attrs = {};
		var option_attrs = {};
		var meta_attrs_scheme = {type: "View", "default": null, name: null, "keep-tag": true};
		meta_attrs = BetaJS.Objs.extend(BetaJS.Objs.clone(meta_attrs_scheme, 1), meta_attrs || {});
		var attrs = element.get(0).attributes;
		for (var i = 0; i < attrs.length; ++i) 
			process(attrs.item(i).nodeName, attrs.item(i).nodeValue);
		BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
			element.children(alias + "param").each(function () {
				var child = BetaJS.$(this);
				process(alias + "-" + child.attr(alias + "-key"), element_data(child));
			});
		});
		if (meta_attrs["default"])
			option_attrs[meta_attrs["default"]] = element_data(element);
		if (meta_attrs.type in BetaJS.Views)
			meta_attrs.type = BetaJS.Views[meta_attrs.type];
		if (BetaJS.Types.is_string(meta_attrs.type))
			meta_attrs.type = BetaJS.Scopes.resolve(meta_attrs.type);
		var view = new meta_attrs.type(option_attrs);
		view.setEl("[data-active-dom-id='" + view.cid() + "']");
		var replacement = "<div data-active-dom-id='" + view.cid() + "'></div>";
		if (meta_attrs["keep-tag"])
			replacement = "<" + element.prop("tagName") + " data-active-dom-element='" + view.cid() + "'>" + replacement + "</" + element.prop("tagName") + ">";
		element.replaceWith(replacement);
		element = BetaJS.$("[data-active-dom-id='" + view.cid() + "']");
		var key = null;
		for (key in dom_attrs)
			element.attr(key, dom_attrs[key]);
		view.on("destroy", function () {
			delete BetaJS.Views.ActiveDom.__views[view.cid()];
		});
		BetaJS.Views.ActiveDom.__views[view.cid()] = view;
		view.activate();
		for (key in dom_child_attrs)
			element.children().attr(key, dom_child_attrs[key]);
		if (meta_attrs["name"])
			BetaJS.Scopes.set(view, meta_attrs["name"]);
	},
	
	activate: function () {
		BetaJS.$(document).ready(function () {
			if (BetaJS.Views.ActiveDom.__active)
				return;
			if (document.addEventListener) {
				document.addEventListener("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
				document.addEventListener("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			} else {
				document.attachEvent("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
				document.attachEvent("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			}
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__prefix_alias, function (alias) {
				BetaJS.$(alias + "view").each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this));
				});
			});
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__view_alias, function (data, alias) {
				BetaJS.$(alias).each(function () {
					BetaJS.Views.ActiveDom.__attach(BetaJS.$(this), data);
				});
			});
			BetaJS.Views.ActiveDom.__active = true;
		});
	},
	
	deactivate: function () {
		BetaJS.$(document).ready(function () {
			if (!BetaJS.Views.ActiveDom.__active)
				return;
			document.removeEventListener("DOMNodeInserted", BetaJS.Views.ActiveDom.__on_add_element);
			document.removeEventListener("DOMNodeRemoved", BetaJS.Views.ActiveDom.__on_remove_element);
			BetaJS.Objs.iter(BetaJS.Views.ActiveDom.__views, function (view) {
				view.destroy();
			});
			BetaJS.Views.ActiveDom.__active = false;
		});
	},
	
	registerPrefixAlias: function (alias) {
		this.__prefix_alias.push(alias);
	},
	
	registerViewAlias: function (alias, type, def) {
		this.__view_alias[alias] = { type: type };
		this.__view_alias[alias]["default"] = def;
	}
	
};
BetaJS.Classes.Module.extend("BetaJS.Views.Modules.Centering", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.Modules.Centering, "constructor", options);
		this.__vertical = "vertical" in options ? options.vertical : false;
		this.__horizontal = "horizontal" in options ? options.horizontal : false;
	},
	
	_register: function (object, data) {
		object.on("resize", function () {
			if (object.isVisible())
				this.__update(object);
		}, this);
		if (object.isActive() && object.isVisible())
			this.__update(object);
	},
	
	__update: function (object) {
		if (this.__vertical) {
			object.$el.css("top", "50%");
			object.$el.css("margin-top", Math.round(-object.$el.height() / 2) + "px");
		}
		if (this.__horizontal) {
			object.$el.css("left", "50%");
			object.$el.css("margin-left", Math.round(-object.$el.width() / 2) + "px");
		}
	}
	
}, {
	
	__vertical: null,
	
	vertical: function () {
		if (!this.__vertical)
			this.__vertical = new this({auto_destroy: false, vertical: true, horizontal: false});
		return this.__vertical;
	},
	
	__horizontal: null,
	
	horizontal: function () {
		if (!this.__horizontal)
			this.__horizontal = new this({auto_destroy: false, horizontal: true, vertical: false});
		return this.__horizontal;
	},
	
	__both: null,
	
	both: function () {
		if (!this.__both)
			this.__both = new this({auto_destroy: false, vertical: true, horizontal: true});
		return this.__both;
	}
	
});

BetaJS.Classes.Module.extend("BetaJS.Views.Modules.BindOnActivate", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("activate", function () { this.__bind(object); }, this);
		object.on("deactivate", function () { this.__unbind(object); }, this);
		if (object.isActive())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
		this._bind(object, data);
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		this._unbind(object, data);
		data.bound = false;
	},
	
	_bind: function (object, data) {},
	
	_unbind: function (object, data) {}
	
});

BetaJS.Classes.Module.extend("BetaJS.Views.Modules.BindOnVisible", {
	
	_register: function (object, data) {
		data.bound = false;
		object.on("visibility", function (visible) {
			if (visible)
				this.__bind(object);
			else
				this.__unbind(object);
		}, this);
		if (object.isActive() && object.isVisible())
			this.__bind(object);
	},
	
	_unregister: function (object, data) {
		this.__unbind(object);
	},
	
	__bind: function (object) {
		var data = this._data(object);
		if (data.bound)
			return;
		this._bind(object, data);
		data.bound = true;
	},
	
	__unbind: function (object) {
		var data = this._data(object);
		if (!data.bound)
			return;
		this._unbind(object, data);
		data.bound = false;
	},
	
	_bind: function (object, data) {},
	
	_unbind: function (object, data) {}
	
});

BetaJS.Views.Modules.BindOnVisible.extend("BetaJS.Views.Modules.HideOnLeave", {
		
	_bind: function (object, data) {
		var el = object.$el.get(0);
		data.hide_on_leave_func = function (e) {
			if (data.hide_on_leave_skip) {
				data.hide_on_leave_skip = false;
				return;
			}
			if (document.contains(e.target) && e.target !== el && !BetaJS.$.contains(el, e.target))
				object.hide();
		};
		data.hide_on_leave_skip = true;
		BetaJS.$(document.body).on("click", data.hide_on_leave_func);
	},
	
	_unbind: function (object, data) {
		BetaJS.$(document.body).unbind("click", data.hide_on_leave_func);
	}
	
});

BetaJS.Views.Modules.BindOnActivate.extend("BetaJS.Views.Modules.Hotkeys", {
		
	constructor: function (options) {
		this._inherited(BetaJS.Views.Modules.Hotkeys, "constructor", options);
		this.__hotkeys = options.hotkeys;
	},

	_bind: function (object, data) {
		data.hotkeys = {};
		BetaJS.Objs.iter(this.__hotkeys, function (f, hotkey) {
			data.hotkeys[hotkey] = BetaJS.Browser.Hotkeys.register(hotkey, BetaJS.Types.is_function(f) ? f : object[f], object); 
		}, this);
	},
	
	_unbind: function (object, data) {
		BetaJS.Objs.iter(data.hotkeys, function (handle) {
			BetaJS.Browser.Hotkeys.unregister(handle);
		}, this);
		data.hotkeys = {};
	}
	
});
BetaJS.Templates.Cached = BetaJS.Templates.Cached || {};
BetaJS.Templates.Cached['holygrail-view-template'] = '  <div data-selector="right" class=\'holygrail-view-right-container\'></div>  <div data-selector="left" class=\'holygrail-view-left-container\'></div>  <div data-selector="center" class=\'holygrail-view-center-container\'></div> ';

BetaJS.Templates.Cached['list-container-view-item-template'] = '  <{%= container_element %} data-view-id="{%= cid %}"></{%= container_element %}> ';

BetaJS.Templates.Cached['switch-container-view-item-template'] = '  <div data-view-id="{%= cid %}" data-selector="switch-container-item"></div> ';

BetaJS.Templates.Cached['button-view-template'] = '   <{%= button_container_element %} data-selector="button-inner" class="{%= supp.css("default") %}"    {%= bind.css_if("disabled", "disabled") %}    {%= bind.css_if("selected", "selected") %}    {%= bind.inner("label") %}>   </{%= button_container_element %}>  ';

BetaJS.Templates.Cached['check-box-view-template'] = '  <input type="checkbox" {%= checked ? "checked" : "" %} id="check-{%= supp.view_id %}" />  <label for="check-{%= supp.view_id %}">{%= label %}</label> ';

BetaJS.Templates.Cached['input-view-template'] = '  <input class="input-view" type="{%= input_type %}" {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %} {%= bind.css_if("input-horizontal-fill", "horizontal_fill") %} /> ';

BetaJS.Templates.Cached['label-view-template'] = '  <{%= element %} class="{%= supp.css(\'label\') %}" {%= bind.inner("label") %}></{%= element %}> ';

BetaJS.Templates.Cached['link-view-template'] = '  <a href="javascript:{}" {%= bind.inner("label") %}></a> ';

BetaJS.Templates.Cached['text-area-template'] = '   <textarea {%= bind.value("value") %} {%= bind.attr("placeholder", "placeholder") %}             {%= bind.css_if_not("text-area-no-resize", "resizable") %}             {%= readonly ? \'readonly\' : \'\' %}             style="resize: {%= horizontal_resize ? (vertical_resize ? \'both\' : \'horizontal\') : (vertical_resize ? \'vertical\' : \'none\') %}"             {%= bind.css_if("text-area-horizontal-fill", "horizontal_fill") %}></textarea>  ';

BetaJS.Templates.Cached['progress-template'] = '  <div class="{%= supp.css(\'outer\') %}">   <div data-selector="inner" class="{%= supp.css(\'inner\') %}" style="{%= horizontal ? \'width\': \'height\' %}:{%= value*100 %}%">   </div>   <div class="progress-view-overlay" data-selector="label">    {%= label %}   </div>  </div> ';

BetaJS.Templates.Cached['list-view-template'] = '   <{%= list_container_element %}    {%= supp.attrs(list_container_attrs) %}    class="{%= list_container_classes %}"    data-selector="list">   </{%= list_container_element %}>  ';
BetaJS.Templates.Cached['list-view-item-container-template'] = '   <{%= item_container_element %}    {%= supp.attrs(item_container_attrs) %}    class="{%= item_container_classes %}"    {%= supp.list_item_attr(item) %}>   </{%= item_container_element %}>  ';

BetaJS.Templates.Cached['overlay-view-template'] = '  <div data-selector="container"></div> ';

BetaJS.Templates.Cached['fullscreen-overlay-view-template'] = '  <div class="fullscreen-overlay-background" data-selector="outer"></div>  <div class="fullscreen-overlay" data-selector="container">   <div class="fullscreen-overlay-inner" data-selector="inner"></div>  </div> ';

BetaJS.Views.View.extend("BetaJS.Views.HolygrailView", {
	_templates: {
		"default": BetaJS.Templates.Cached["holygrail-view-template"]
	},
	constructor: function (options) {
		this._inherited(BetaJS.Views.HolygrailView, "constructor", options);
		this.__left = null;
		this.__center = null;
		this.__right = null;
	},
	getLeft: function () {
		return this.__left;
	},
	setLeft: function (view) {
		return this.__setView("left", view);
	},
	getCenter: function () {
		return this.__center;
	},
	setCenter: function (view) {
		return this.__setView("center", view);
	},
	getRight: function () {
		return this.__right;
	},
	setRight: function (view) {
		return this.__setView("right", view);
	},
	__setView: function(key, view) {
		// Remove old child in case we had one
		this.removeChild(this["__" + key]);
		// Set old child attribute to null
		this["__" + key] = null;
		// If we have a new view (i.e. set view was not called with null)
		if (view) {
			// bind new view to selector
			view.setEl('[data-selector="' + key + '"]');
			// store new view as child attribute and add the view
			this["__" + key] = this.addChild(view);
		}
		return view;
	}
});
BetaJS.Views.View.extend("BetaJS.Views.ListContainerView", {
	
	_templates: {
		"item": BetaJS.Templates.Cached["list-container-view-item-template"]
	},
	
	_notifications: {
		"addChild": "__addChildContainer",
		"removeChild": "__removeChildContainer"
	},
	
	constructor: function (options) {
		options = options || {};
		this._inherited(BetaJS.Views.ListContainerView, "constructor", options);
		this._setOption(options, "alignment", "horizontal");
		this._setOption(options, "positioning", "float"); // float, computed, none
		this._setOption(options, "clear_float", false);
		this._setOption(options, "container_element", "div");
		this.on("show", function () {
			if (this.__positioning == "computed")
				this.__updatePositioning();
		}, this);
	},
	
	isHorizontal: function () {
		return this.__alignment == "horizontal";
	},
	
	_render: function () {
		if (this.__clear_float)
			this.$el.html("<div data-selector='clearboth' style='clear:both'></div>");
		else
			this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	},
	
	__addChildContainer: function (child) {
		var options = this.childOptions(child);
		if (this.isActive()) {
			var rendered = this.evaluateTemplate("item", {cid: child.cid(), container_element: this.__container_element});
			if (this.__clear_float)
				this.$("[data-selector='clearboth']").before(rendered);
			else
				this.$el.append(rendered);
		}
		child.setEl("[data-view-id='" + child.cid() + "']");
		if (this.isHorizontal() && !("float" in options) && this.__positioning == "float")
			options["float"] = "left";
		if (this.isActive() && "float" in options && this.__positioning == "float") {
			var container = this.$("[data-view-id='" + child.cid() + "']");
			container.css("float", options["float"]);
		}			
	},
	
	__removeChildContainer: function (child) {
		this.$data({"view-id": child.cid()}).remove();
	},
	
	__updatePositioningHelper: function (arr, pos_string, size_string) {
		var pos = 0;
		BetaJS.Objs.iter(arr, function (child) {
			var opts = this.childOptions(child);
			if (!(opts['type'] && opts['type'] == 'ignore')) {
				child.$el.css(pos_string, pos + 'px');
				if (child.isVisible())
					pos += parseInt(child.$el.css(size_string), 10);
				if (opts['type'] && opts['type'] == 'dynamic')
					return false;
			}
		}, this);
	},
	
	__updatePositioning: function () {
		var ltr = BetaJS.Objs.values(this.children());
		var rtl = BetaJS.Objs.clone(ltr, 1).reverse();
		var left_string = this.isHorizontal() ? "left" : "top";
		var right_string = this.isHorizontal() ? "right" : "bottom";
		var width_string = this.isHorizontal() ? "width" : "height";
		this.__updatePositioningHelper(rtl, right_string, width_string);
		this.__updatePositioningHelper(ltr, left_string, width_string);
	},

	updateChildVisibility: function (child) {
		this._inherited(BetaJS.Views.ListContainerView, "updateChildVisibility", child);
		if (this.__positioning == "computed")
			this.__updatePositioning();
	}
	
	
});
BetaJS.Views.View.extend("BetaJS.Views.SingleContainerView", {
	constructor: function (options) {
		this._inherited(BetaJS.Views.SingleContainerView, "constructor", options);
		this.__view = null;
	},
	getView: function () {
		return this.__view;
	},
	setView: function(view) {
		this.removeChild(this.__view);
		if (view) {
			view.setEl("");
			this.__view = this.addChild(view);
		}
		return view;
	}
});
BetaJS.Views.View.extend("BetaJS.Views.SwitchContainerView", {
	
	_templates: {
		"item": BetaJS.Templates.Cached["switch-container-view-item-template"]
	},
	
	_notifications: {
		"addChild": "__addChildContainer",
		"removeChild": "__removeChildContainer"
	},
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.SwitchContainerView, "constructor", options);
		this.__selected = null;
	},

	_render: function () {
		this.$el.html("");
		BetaJS.Objs.iter(this.children(), function (child) {
			this.__addChildContainer(child);
		}, this);
	
	},
	
	__addChildContainer: function (child) {
		if (this.isActive())
			this.$el.append(this.evaluateTemplate("item", {cid: child.cid()}));
		child.setEl("[data-view-id='" + child.cid() + "']");
		this.__selected = this.__selected || child;
		child.setVisibility(this.__selected == child);
	},
	
	__removeChildContainer: function (child) {
		this.$data({"view-id": child.cid()}).remove();
		if (this.__selected == child)
			this.__selected = null;
	},
	
	select: function (child) {
		this.__selected = child;
		BetaJS.Objs.iter(this.children(), function (child) {
			child.setVisibility(this.__selected == child);
		}, this);
	},
	
	selected: function () {
		return this.__selected;
	}
	
});
BetaJS.Views.ListContainerView.extend("BetaJS.Views.TabbedView", {
	
	constructor: function (options) {
		options = BetaJS.Objs.extend(options || {}, {
			"alignment": "vertical",
			"positioning": "none"
		});
		this._inherited(BetaJS.Views.TabbedView, "constructor", options);
		this.toolbar = this.addChild(new BetaJS.Views.ToolBarView());
		this.container = this.addChild(new BetaJS.Views.SwitchContainerView());
		this.toolbar.on("item:click", function (view) {
			this.select(view);
		}, this);
		if (options.tabs) {
			BetaJS.Objs.iter(options.tabs, function (tab) {
				this.addTab(tab);
			}, this);
		}
	},
	
	addTab: function (options) {
		options = BetaJS.Objs.extend(options, {
			selectable: true,
			deselect_all: true						
		});
		var button = this.toolbar.addItem(options);
		button.__tabView = this.container.addChild(options.view);
		options.view.__tabButton = button;
		if (options.selected)
			this.select(button);
		return button.__tabView;
	},
	
	select: function (item_ident_or_view) {
		var tab_view = null;
		if (BetaJS.Types.is_string(item_ident_or_view))
			tab_view = this.toolbar.itemByIdent(item_ident_or_view).__tabView;
		else if (item_ident_or_view.__tabButton)
			tab_view = item_ident_or_view;
		else
			tab_view = item_ident_or_view.__tabView;
		this.container.select(tab_view);
		tab_view.__tabButton.select();
		this.trigger("select", tab_view);
		return tab_view;
	}
	
});
BetaJS.Views.View.extend("BetaJS.Views.ButtonView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["button-view-template"]
	},
	_css: function () {
		return {
			"disabled": "",
			"default": "",
			"selected": ""
		};
	},
	constructor: function(options) {
		options = options || {};
		this._inherited(BetaJS.Views.ButtonView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "button_container_element", "button");
		this._setOptionProperty(options, "disabled", false);
		this._setOptionProperty(options, "selected", false);
		this._setOption(options, "selectable", false);
		this._setOption(options, "deselect_all", false);
		if (options.hotkey) {
			var hotkeys = {};
			hotkeys[options.hotkey] = function () {
				this.click();
			};
			this.add_module(new BetaJS.Views.Modules.Hotkeys({hotkeys: hotkeys}));
		}
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click [data-selector='button-inner']": "click"
		}]);
	},
	click: function () {
		if (!this.get("disabled")) {
			if (this.__selectable)
				this.select();
			this.trigger("click");
		}
	},
	_bindParent: function (parent) {
		parent.on("deselect", function () {
			this.unselect();
		}, this);
	},
	
	_unbindParent: function (parent) {
		parent.off("deselect", this);
	},
	
	select: function () {
		if (!this.__selectable)
			return;
		if (this.__deselect_all)
			this.getParent().trigger("deselect");
		this.getParent().trigger("select", this);
		this.set("selected", true);
	},
	
	unselect: function () {
		if (!this.__selectable)
			return;
		this.set("selected", false);
	},
	
	isSelected: function () {
		return this.get("selected");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.CheckBoxView", {
	_templates: {
		"default": BetaJS.Templates.Cached["check-box-view-template"]
	},
	_events: function () {
		return this._inherited(BetaJS.Views.ButtonView, "_events").concat([{
			"click input": "__click"
		}]);
	},
	constructor: function(options) {
		options = options || {};
		options["invalidate_on_change"] = true;
		this._inherited(BetaJS.Views.CheckBoxView, "constructor", options);
		this._setOptionProperty(options, "checked", false);
		this._setOptionProperty(options, "label", "");
	},
	__click: function () {
		this.set("checked", this.$("input").is(":checked"));
		this.trigger("check", this.get("checked"));
	}
});
BetaJS.Views.SwitchContainerView.extend("BetaJS.Views.InputLabelView", {

	constructor: function(options) {
		this._inherited(BetaJS.Views.InputLabelView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOption(options, "edit_on_click", true);
		this._setOption(options, "label_mode", true);
		this._setOption(options, "read_only", false);
		this.label = this.addChild(new BetaJS.Views.LabelView({
			label: this.binding("value"),
			el_classes: options["label_el_classes"],
			children_classes: options["label_children_classes"]
		}));
		this.input = this.addChild(new BetaJS.Views.InputView({
			value: this.binding("value"),
			placeholder: this.binding("placeholder")
		}));
		if (!this.__label_mode)
			this.select(this.input);
		this.input.on("leave enter_key", function () {
			this.label_mode();
		}, this);
		if (this.__edit_on_click)
			this.label.on("click", function () {
				this.edit_mode();
			}, this);
	},
	
	is_label_mode: function () {
		return this.__label_mode;
	},
	
	is_edit_mode: function () {
		return !this.__label_mode;
	},

	label_mode: function () {
		if (this.is_label_mode())
			return;
		this.__label_mode = true;
		this.select(this.label);		
	},
	
	edit_mode: function () {
		if (this.is_edit_mode() || this.__read_only)
			return;
		this.__label_mode = false;
		this.select(this.input);
		this.input.focus(true);
	}

});
BetaJS.Views.View.extend("BetaJS.Views.InputView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["input-view-template"]
	},
	_events: function () {
		return [{
			"blur input": "__leaveEvent",
			"keyup input": "__changeEvent",
			"change input": "__changeEvent",
			"input input": "__changeEvent",
			"paste input": "__changeEvent"
		}, {
			"keyup input": "__keyupEvent"
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.InputView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");	
		this._setOptionProperty(options, "clear_after_enter", false);	
		this._setOptionProperty(options, "horizontal_fill", false);
		this._setOptionProperty(options, "input_type", "text");
	},
	__keyupEvent: function (e) {
		var key = e.keyCode || e.which;
        if (key == 13) {
			this.trigger("enter_key", this.get("value"));
			if (this.get("clear_after_enter"))
				this.set("value", "");
		}
    },
	__leaveEvent: function () {
		this.trigger("leave");
	},
	__changeEvent: function () {
		this.trigger("change", this.get("value"));
	},
	focus: function (select_all) {
		this.$("input").focus();
		this.$("input").focus();
		if (select_all)
			this.$("input").select();
	}
});
BetaJS.Views.View.extend("BetaJS.Views.LabelView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["label-view-template"]
	},
	_css: function () {
		return {"label": "label-view-class"};
	},
	_events: function () {
		return [{
			"click": "__clickEvent"	
		}];
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LabelView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "element", "span");
	},
	__clickEvent: function () {
		this.trigger("click");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.LinkView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["link-view-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.LinkView, "constructor", options);
		this._setOptionProperty(options, "label", "");
	},
	_events: function () {
		return this._inherited(BetaJS.Views.LinkView, "_events").concat([{
			"click a": "__click"
		}]);
	},
	__click: function () {
		this.trigger("click");
	}
});
BetaJS.Views.View.extend("BetaJS.Views.ProgressView", {
	_templates: {
		"default": BetaJS.Templates.Cached["progress-template"]
	},
	
	_css: function () {
		return {
			outer: "",
			inner: ""
		};
	},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.ProgressView, "constructor", options);
		this._setOptionProperty(options, "label", "");
		this._setOptionProperty(options, "horizontal", true);
		this._setOptionProperty(options, "value", 1);
		this.on("change:value", function (value) {
			if (this.isActive())
				this.$("[data-selector='inner']").css(this.get("horizontal") ? 'width' : 'height', (value * 100) + "%");
		}, this);
		this.on("change:label", function (label) {
			if (this.isActive())
				this.$("[data-selector='label']").html(label);
		}, this);
	}
	
});

BetaJS.Views.View.extend("BetaJS.Views.TextAreaView", {
	_dynamics: {
		"default": BetaJS.Templates.Cached["text-area-template"]
	},
	constructor: function(options) {
		this._inherited(BetaJS.Views.TextAreaView, "constructor", options);
		this._setOptionProperty(options, "value", "");
		this._setOptionProperty(options, "placeholder", "");
		this._setOptionProperty(options, "horizontal_resize", false);
		this._setOptionProperty(options, "vertical_resize", true);
		this._setOptionProperty(options, "horizontal_fill", false);
		this._setOptionProperty(options, "readonly", false);
		this.on("change:readonly", function () {
			if (this.get("readonly"))
				this.$("textarea").attr("readonly", "readonly");
			else
				this.$("textarea").removeAttr("readonly");
		}, this);
	},
	
	addLine: function (s) {
		if (this.get("value"))
			this.set("value", this.get("value") + "\n" + s);
		else
			this.set("value", s);
		this.scrollToEnd();
	},
	
	scrollToEnd: function () {
		var t = this.$("textarea").get(0);
		t.scrollTop = t.scrollHeight;		
	}
});
BetaJS.Views.View.extend("BetaJS.Views.CustomListView", {
	
	_templates: function () {
		return {
			"default": BetaJS.Templates.Cached["list-view-template"],
			"item-container": BetaJS.Templates.Cached["list-view-item-container-template"]
		};
	},
	
	_supp: function () {
		return BetaJS.Objs.extend(this._inherited(BetaJS.Views.CustomListView, "_supp"), {
			list_item_attr: function (item) {
				return this.attrs({
					"data-view-id": this.__context.cid(),
					"data-cid": BetaJS.Ids.objectId(item),
					"data-index": this.__context.__collection.getIndex(item)
				});
			}
		});
	},
	
	_notifications: {
		activate: "__activateItems",
		deactivate: "__deactivateItems"
	},
	
	_events: function () {
		return [{
			"click": "__click"
		}];
	},	
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.CustomListView, "constructor", options);
		this._setOption(options, "list_container_element", "ul");
		this._setOption(options, "list_container_attrs", {});
		this._setOption(options, "list_container_classes", "");
		this._setOption(options, "item_container_element", "li");
		this._setOption(options, "item_container_classes", "");
		this._setOption(options, "selectable", true);
		this._setOption(options, "multi_select", false);
		this._setOption(options, "click_select", false);
		this.__itemData = {};
		if ("table" in options) {
			var table = this.cls.parseType(options.table, "object");
			this.active_query = new BetaJS.Queries.ActiveQuery(table.active_query_engine(), {});
			options.collection = this.active_query.collection();
			options.destroy_collection = true;
		}
		if ("compare" in options)
			options.compare = this.cls.parseType(options.compare, "function");
		if ("collection" in options) {
			this.__collection = options.collection;
			this.__destroy_collection = "destroy_collection" in options ? options.destroy_collection : false;
			if ("compare" in options)
				this.__collection.set_compare(options["compare"]);
		} else {
			var col_options = {};
			if ("objects" in options) 
				col_options["objects"] = options["objects"];
			if ("compare" in options) 
				col_options["compare"] = options["compare"];
			this.__collection = new BetaJS.Collections.Collection(col_options);
			this.__destroy_collection = true;
		}
		this.__collection.on("add", function (item) {
			this._addItem(item);
		}, this);
		this.__collection.on("remove", function (item) {
			this._removeItem(item);
		}, this);
		this.__collection.on("change", function (item) {
			this._changeItem(item);
		}, this);
		this.__collection.on("index", function (item, index) {
			this.__updateItemIndex(item, index);
		}, this);
		this.__collection.on("reindexed", function (item) {
			this.__reIndexItem(item);
		}, this);
		this.__collection.on("sorted", function () {
			this.__sort();
		}, this);
		this.__collection.iterate(function (item) {
			this._registerItem(item);
		}, this);
	},
	
	destroy: function () {
		this.__collection.iterate(function (item) {
			this._unregisterItem(item);
		}, this);
		this.__collection.off(null, null, this);
		if (this.__destroy_collection)
			this.__collection.destroy();
		this._inherited(BetaJS.Views.CustomListView, "destroy");
	},
	
	_itemBySubElement: function (element) {
		var container = element.closest("[data-view-id='" + this.cid() + "']");
		return container.length === 0 ? null : this.__collection.getById(container.attr("data-cid"));
	},
	
	__click: function (e) {
		if (this.__click_select && this.__selectable) {
			var item = this._itemBySubElement(BetaJS.$(e.target));
			if (item)
				this.select(item);
		}
	},
	
	collection: function () {
		return this.__collection;
	},
	
	add: function (item) {
		this.__collection.add(item);						
	},
	
	remove: function (item) {
		this.__collection.remove(item);
	},
	
	_render: function () {
		this.$selector_list = this._renderListContainer();
	},
	
	_renderListContainer: function () {
		this.$el.html(this.evaluateTemplate("default", {
			list_container_element: this.__list_container_element,
			list_container_attrs: this.__list_container_attrs,
			list_container_classes: this.__list_container_classes
		}));
		return this.$data({"selector": "list"});
	},
	
	invalidate: function () {
		if (this.isActive())
			this.__deactivateItems();
		this._inherited(BetaJS.Views.CustomListView, "invalidate");
		if (this.isActive())
			this.__activateItems();
	},
	
	__activateItems: function () {
		this.__collection.iterate(function (item) {
			this._activateItem(item);
		}, this);
	},
	
	__deactivateItems: function () {
		this.__collection.iterate(function (item) {
			this._deactivateItem(item);
		}, this);
	},

	itemElement: function (item) {
		return this.$data({
			"view-id": this.cid(),
			"cid": BetaJS.Ids.objectId(item)
		}, this.$selector_list);
	},
	
	_findIndexElement: function (index) {
		return this.$data({
			"view-id": this.cid(),
			"index": index
		}, this.$selector_list);
	},

	_changeItem: function (item) {},

	__updateItemIndex: function (item, index) {
		var element = this.itemElement(item);
		element.attr("data-index", index);
		this._updateItemIndex(item, element);
	},

	__reIndexItem: function (item) {
		var element = this.itemElement(item);
		var index = this.collection().getIndex(item);
		if (index === 0)
			this.$selector_list.prepend(element);
		else {
			var before = this._findIndexElement(index - 1);
			before.after(element);
		}
	},
	
	_updateItemIndex: function (item, index) {},
	
	__sort: function () {
		for (var index = this.collection().count() - 1; index >= 0; index--)
			this.$selector_list.prepend(this._findIndexElement(index));
	},
	
	itemData: function (item) {
		return this.__itemData[item.cid()];
	},

	_registerItem: function (item) {
		this.__itemData[item.cid()] = {
			properties: new BetaJS.Properties.Properties({
				selected: false,
				new_element: false
			})
		};
	},
	
	_unregisterItem: function (item) {
		if (!this.__itemData[item.cid()])
			return;
		this.__itemData[item.cid()].properties.destroy();
		delete this.__itemData[item.cid()];
	},
	
	_activateItem: function (item) {
		var container = this.evaluateTemplate("item-container", {
			item: item,
			item_container_element: this.__item_container_element, 
			item_container_attrs: this.__item_container_attrs,
			item_container_classes: this.__item_container_classes			
		});
		var index = this.__collection.getIndex(item);
		if (index === 0)
			this.$selector_list.prepend(container);
		else {
			var before = this._findIndexElement(index - 1);
			if (before.length > 0) 
				before.after(container);
			else {
				var after = this._findIndexElement(index + 1);
				if (after.length > 0)
					after.before(container);
				else
					this.$selector_list.append(container);
			}
		}
		this.trigger("activate_item", item);
	},
	
	_deactivateItem: function (item) {
		this.itemData(item).new_element = false;
		var element = this.itemElement(item);
		element.remove();
	},
	
	_addItem: function (item) {
		this._registerItem(item);
		if (this.isActive()) {
			this.itemData(item).new_element = true;
			this._activateItem(item);
		}
	},
	
	_removeItem: function (item) {
		if (this.isActive())
			this._deactivateItem(item);
		this._unregisterItem(item);
	},
	
	isSelected: function (item) {
		return this.itemData(item).properties.get("selected");
	},
	
	select: function (item) {
		var data = this.itemData(item);
		if (this.__selectable && !this.isSelected(item)) {
			if (!this.__multi_select)
				this.collection().iterate(function (object) {
					this.unselect(object);
				}, this);
			data.properties.set("selected", true);
			this.trigger("select", item);
		}
		return data;
	},
	
	unselect: function (item) {
		var data = this.itemData(item);
		if (this.__selectable && this.isSelected(item)) {
			data.properties.set("selected", false);
			this.trigger("unselect", item);
		}
		return data;
	}	
	
});



BetaJS.Views.CustomListView.extend("BetaJS.Views.ListView", {
	
	constructor: function(options) {
		options = options || {};
		if ("item_template" in options)
			options.templates = {item: options.item_template};
		if ("item_dynamic" in options)
			options.dynamics = {item: options.item_dynamic};
		this._inherited(BetaJS.Views.ListView, "constructor", options);
		this._setOption(options, "item_label", "label");
		this._setOption(options, "render_item_on_change", BetaJS.Types.is_defined(this.dynamics("item")));
	},
	
	_changeItem: function (item) {
		this._inherited(BetaJS.Views.ListView, "_changeItem", item);
		if (this.__render_item_on_change && this.isActive())
			this._renderItem(item);
	},
	
	_activateItem: function (item) {
		this._inherited(BetaJS.Views.ListView, "_activateItem", item);
		this._renderItem(item);
	},
	
	_renderItem: function (item) {
		var element = this.itemElement(item);
		var properties = this.itemData(item).properties;
		if (this.templates("item"))
			element.html(this.evaluateTemplate("item", {item: item, properties: properties}));
		else if (this.dynamics("item"))
			this.evaluateDynamics("item", element, {item: item, properties: properties}, {name: "item-" + BetaJS.Ids.objectId(item)});
		else
			element.html(item.get(this.__item_label)); 
	},
	
	_deactivateItem: function (item) {
		if (this.dynamics("item"))
			this.dynamics("item").removeInstanceByName("item-" + BetaJS.Ids.objectId(item));
		this._inherited(BetaJS.Views.ListView, "_deactivateItem", item);
	}
	
});


BetaJS.Views.CustomListView.extend("BetaJS.Views.SubViewListView", {
	
	_sub_view: BetaJS.Views.View,
	
	_sub_view_options: function (item) {
		return {
			item: item,
			item_properties: this.itemData(item).properties
		};
	},
	
	_property_map: function (item) {},
	
	constructor: function(options) {
		this._inherited(BetaJS.Views.SubViewListView, "constructor", options);
		if ("create_view" in options)
			this._create_view = options.create_view;
		if ("sub_view" in options)
			this._sub_view = this.cls.parseType(options.sub_view, "object");
		if ("sub_view_options" in options)
			this._sub_view_options_param = options.sub_view_options;
		if ("property_map" in options)
			this._property_map_param = options.property_map;
	},
	
	_create_view: function (item, element) {
		var properties = BetaJS.Objs.extend(
			BetaJS.Types.is_function(this._property_map) ? this._property_map.apply(this, [item]) : this._property_map,
			BetaJS.Types.is_function(this._property_map_param) ? this._property_map_param.apply(this, [item]) : this._property_map_param);
		var options = BetaJS.Objs.extend(
			BetaJS.Types.is_function(this._sub_view_options) ? this._sub_view_options.apply(this, [item]) : this._sub_view_options,
			BetaJS.Objs.extend(
				BetaJS.Types.is_function(this._sub_view_options_param) ? this._sub_view_options_param.apply(this, [item]) : this._sub_view_options_param || {},
				BetaJS.Objs.map(properties, item.get, item)));
		options.el = this.itemElement(item);
		return new this._sub_view(options);
	},
	
	_activateItem: function (item) {
		this._inherited(BetaJS.Views.SubViewListView, "_activateItem", item);
		var view = this._create_view(item); 
		this.delegateEvents(null, view, "item", [view, item]);
		this.itemData(item).view = view;
		this.addChild(view);
	},
	
	_deactivateItem: function (item) {
		var view = this.itemData(item).view;
		this.removeChild(view);
		view.destroy();
		this._inherited(BetaJS.Views.SubViewListView, "_deactivateItem", item);
	}
	
});


BetaJS.Classes.Module.extend("BetaJS.Views.Modules.ListViewAnimation", {

	_register: function (object, data) {
		object.on("activate_item", function (item) {
			if (object.itemData(item).new_element) {
				var element = object.itemElement(item);
				element.css("display", "none");
				element.fadeIn();
			}
		}, this);
	}
	
}, {
	
	__singleton: null,
	
	singleton: function () {
		if (!this.__singleton)
			this.__singleton = new this({auto_destroy: false});
		return this.__singleton;
	}
	
});

BetaJS.Views.View.extend("BetaJS.Views.OverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["overlay-view-template"]
	},

	/*
	 * overlay_inner (optional) : sub view to be bound to the overlay
	 * 
	 * anchor: "none" | "absolute" | "element" | "relative"
     *
	 * overlay_left
	 * overlay_top
     *
	 * overlay_align_vertical: "top" | "center" | "bottom"
	 * overlay_align_horizontal: "left" | "center" | "right"
	 *
	 * element-align-vertical: "top" | "center" | "bottom"
	 * element-align-horizontal: "left" | "center" | "right"
     *
	 * element
	 */
	constructor: function (options) {
		options = options || {};
		options.anchor = options.anchor || "absolute";
		//options.hide_on_leave = "hide_on_leave" in options ? options.hide_on_leave : true;
		options.visible = "visible" in options ? options.visible : false;
		options.children_classes = options.children_classes || [];
		if (BetaJS.Types.is_string(options.children_classes))
			options.children_classes = options.children_classes.split(" ");
		options.children_classes.push("overlay-container-class");
		this._inherited(BetaJS.Views.OverlayView, "constructor", options);
		this._setOption(options, "anchor", "none");
		this._setOption(options, "element", "");
		this._setOption(options, "overlay_left", 0);
		this._setOption(options, "overlay_top", 0);
		this._setOption(options, "overlay_align_vertical", "top");
		this._setOption(options, "overlay_align_horizontal", "left");
		this._setOption(options, "element_align_vertical", "bottom");
		this._setOption(options, "element_align_horizontal", "left");
		if (options.overlay_inner) {
			options.overlay_inner.setEl('[data-selector="container"]');
			this.overlay_inner = this.addChild(options.overlay_inner);
		}
		if (!("hide_on_leave" in options) || options.hide_on_leave)
			this.add_module(BetaJS.Views.Modules.HideOnLeave.singleton());
		this.on("show", this._after_show, this);
	},
	
	_after_show: function () {	
		if (this.__anchor == "none")
			return;
		var overlay = this.$(".overlay-container-class");
		var width = overlay.outerWidth();
		var height = overlay.outerHeight();

		var left = this.__overlay_left;
		var top = this.__overlay_top;
		
		if (this.__overlay_align_vertical == "bottom")
			top -= height;
		else if (this.__overlay_align_vertical == "center")
			top -= Math.round(height/2);

		if (this.__overlay_align_horizontal == "right")
			left -= width;
		else if (this.__overlay_align_horizontal == "center")
			left -= Math.round(width/2);
			
		var element = this.$el;
		if (this.__anchor == "element" && this.__element) {
			element = this.__element;
			if (BetaJS.Types.is_string(element))
				element = BetaJS.$(element);
			else if (BetaJS.Class.is_class_instance(element))
				element = element.$el;
		}
		if (this.__anchor == "relative" || this.__anchor == "element") {
			element_width = element.outerWidth();
			element_height = element.outerHeight();
			left += element.offset().left - $(window).scrollLeft();
			top += element.offset().top - $(window).scrollTop();
			if (this.__element_align_vertical == "bottom")
				top += element_height;
			else if (this.__element_align_vertical == "center")
				top += Math.round(element_height/2);
			if (this.__element_align_horizontal == "right")
				left += element_width;
			else if (this.__element_align_horizontal == "center")
				left += Math.round(element_width/2);
		}
		overlay.css("left", left + "px");
		overlay.css("top", top + "px");
	}

});
BetaJS.Views.View.extend("BetaJS.Views.FullscreenOverlayView", {
	
	_templates: {
		"default": BetaJS.Templates.Cached["fullscreen-overlay-view-template"]
	},
	
	_events: function () {
		return [{
			'click [data-selector="outer"]': "unfocus",
			'touchstart [data-selector="outer"]': "unfocus"
		}];
	},

	constructor: function (options) {
		options = options || {};
		options.el = options.el || "body";
		options.append_to_el = "append_to_el" in options ? options.append_to_el : true;
		options.visible = "visible" in options ? options.visible : false;
		this._inherited(BetaJS.Views.FullscreenOverlayView, "constructor", options);
		options.overlay_inner.setEl('[data-selector="inner"]');
		this.overlay_inner = this.addChild(options.overlay_inner);
		this._setOption(options, "hide_on_unfocus", true);
		this._setOption(options, "destroy_on_unfocus", false);
		this.on("show", this._after_show, this);
		this.on("hide", this._after_hide, this);
	},
	
	_after_show: function () {	
		var outer = this.$('[data-selector="outer"]');
		var inner = this.$('[data-selector="inner"]');
		var container = this.$('[data-selector="container"]');
		container.removeClass("fullscreen-overlay-float");
		container.removeClass("fullscreen-overlay-fit");
		var outer_width = outer.outerWidth();
		var outer_height = outer.outerHeight();
		var inner_width = inner.outerWidth();
		var inner_height = inner.outerHeight();
		var left = Math.floor((outer_width - inner_width) / 2);
		var top = Math.floor((outer_height - inner_height) / 2);
		if (left >= 0 && top >= 0) {
			container.css("left", left + "px");
			container.css("top", top + "px");
			container.addClass("fullscreen-overlay-float");
		} else {
			container.css("left", "0px");
			container.css("top", "0px");
			container.addClass("fullscreen-overlay-fit");
		}
		BetaJS.$("body").addClass("fullscreen-overlay-body");
	},
	
	_after_hide: function () {
		BetaJS.$("body").removeClass("fullscreen-overlay-body");
	},
	
	unfocus: function () {
		if (this.__destroy_on_unfocus)
			this.destroy();
		else if (this.__hide_on_unfocus)
			this.hide();
	}

});
BetaJS.Views.ListContainerView.extend("BetaJS.Views.FormControlView", {
	
	constructor: function (options) {
		this._inherited(BetaJS.Views.FormControlView, "constructor", options);
		this._model = options.model;
		this._property = options.property;
		this._setOption(options, "validate_on_change", false);
		this._setOption(options, "validate_on_show", false);
		this._setOption(options, "error_classes", "");
		this.control_view = this.addChild(this._createControl(this._model, this._property, options.control_options || {}));
		this.label_view = this.addChild(new BetaJS.Views.LabelView(BetaJS.Objs.extend(options.label_options || {}, {visible: false})));
		if (this.__validate_on_change)
			this._model.on("change:" + this._property, this.validate, this);
		if (this.__validate_on_show)
			this.on("show", this.validate, this);
		this._model.on("validate:" + this._property, this.validate, this);
	},
	
	validate: function () {
		if (this.isActive()) {
			var result = this._model.validateAttr(this._property);
			this.label_view.setVisibility(!result);
			if (result) {
				this.$el.removeClass(this.__error_classes);
			} else {
				this.$el.addClass(this.__error_classes);
				this.label_view.set("label", this._model.getError(this._property));
			}
		}			
	},
	
	_createControl: function (model, property, options) {}
	
});

BetaJS.Views.FormControlView.extend("BetaJS.Views.FormInputView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.InputView(BetaJS.Objs.extend(options, {
			value: model.binding(property)
		}));
	}
	
});

BetaJS.Views.FormControlView.extend("BetaJS.Views.FormCheckBoxView", {
	
	_createControl: function (model, property, options) {
		return new BetaJS.Views.CheckBoxView(BetaJS.Objs.extend(options, {
			checked: model.binding(property)
		}));
	}
	
});

BetaJS.Views.ListContainerView.extend("BetaJS.Views.ToolBarView", {
	
	_css: function () {
		return {
			"divider": "divider",
			"group": "group"
		};
	},

	constructor: function (options) {
		options = BetaJS.Objs.extend({
			clear_float: true
		}, options || {});
		this._inherited(BetaJS.Views.ToolBarView, "constructor", options);
		this.__group_by_ident = {};
		this.__item_by_ident = {};
		if (options.groups) {
			BetaJS.Objs.iter(options.groups, function (group) {
				this.addGroup(group);
			}, this);
		}
		if (options.items) {
			BetaJS.Objs.iter(options.items, function (item) {
				this.addItem(item);
			}, this);
		}
	},
	
	__group_parent_options: BetaJS.Objs.objectify([
		"group_ident", "group_type", "group_options"
	]),

	addGroup: function (options) {
		var parent_options = {
			group_type: "container"
		};
		var group_options = {};
		BetaJS.Objs.iter(options || {}, function (value, key) {
			if (key in this.__group_parent_options)
				parent_options[key] = value;
			else
				group_options[key] = value;
		}, this);
		var view = null;
		if (parent_options.group_type == "container") {
			group_options.el_classes = this.css("group");
			view = this.addChild(new BetaJS.Views.ListContainerView(group_options), parent_options);
			if (parent_options.group_ident) {
				if (parent_options.group_ident in this.__group_by_ident)
					throw ("Group identifier already registered: " + parent_options.group_ident);
				this.__group_by_ident[parent_options.group_ident] = view;
			}
			return view;			
		} else if (parent_options.group_type == "divider") {
			group_options.el_classes = this.css("divider");
			view = this.addChild(new BetaJS.Views.View(group_options), parent_options);
		} else throw ("Unknown group type: " + parent_options.group_type);
		return view;			
	},
	
	__item_parent_options: BetaJS.Objs.objectify([
		"item_ident", "item_type", "item_group"
	]),
	
	addItem: function (options) {
		var parent_options = {
			item_type: "ButtonView"
		};
		var item_options = {};
		BetaJS.Objs.iter(options || {}, function (value, key) {
			if (key in this.__item_parent_options)
				parent_options[key] = value;
			else
				item_options[key] = value;
		}, this);
		if (parent_options.item_type in BetaJS.Views)
			parent_options.item_type = BetaJS.Views[parent_options.item_type];
		if (BetaJS.Types.is_string(parent_options.item_type))
			parent_options.item_type = BetaJS.Scopes.resolve(parent_options.item_type);
		var parent = this;
		if (parent_options.item_group) {
			if (parent_options.item_group in this.__group_by_ident) {
				parent = this.__group_by_ident[parent_options.item_group];
				var group_options = this.childOptions(parent);
				item_options = BetaJS.Objs.extend(group_options.group_options || {}, item_options);
			} else
				throw ("Unknown group identifier: " + parent_options.item_group);
		}
		var view = parent.addChild(new parent_options.item_type(item_options), parent_options);
		this.delegateEvents(null, view, "item", [view, parent_options]);
		if (parent_options.item_ident)
			this.delegateEvents(null, view, "item-" + parent_options.item_ident, [view, parent_options]);
		if (parent_options.item_ident) {
			if (parent_options.item_ident in this.__item_by_ident)
				throw ("Item identifier already registered: " + parent_options.item_ident);
			this.__item_by_ident[parent_options.item_ident] = view;
		}
		return view;
	},
	
	itemByIdent: function (ident) {
		return this.__item_by_ident[ident];
	}
		
});
