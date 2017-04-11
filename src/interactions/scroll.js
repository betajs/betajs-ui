Scoped.define("module:Interactions.Scroll", [
    "module:Interactions.ElementInteraction",
    "base:Objs",
    "browser:Dom",
    "module:Interactions.ScrollStates"
], function(ElemInter, Objs, Dom, ScrollStates, scoped) {
    return ElemInter.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(element, options, data, stateNS) {
                stateNS = stateNS || ScrollStates;
                options = Objs.extend({
                    discrete: false,
                    currentCenter: false,
                    currentTop: true,
                    scrollEndTimeout: 50,
                    whitespace: 10000,
                    display_type: "",
                    elementMargin: 20,
                    enable_scroll_modifier: "scroll"
                }, options);
                inherited.constructor.call(this, element, options, stateNS);
                this._itemsElement = Dom.unbox(options.itemsElement || element);
                this._disableScrollCounter = 0;
                this._host.initialize("Idle");
                this._scrollingDirection = true;
                this._lastScrollTop = null;
                this.__on(this.element(), "scroll", function() {
                    var scrollTop = this.element().scrollTop;
                    if (this._lastScrollTop !== null)
                        this._scrollingDirection = scrollTop >= this._lastScrollTop;
                    this._lastScrollTop = scrollTop;
                });
            },

            _whitespaceType: function() {
                if (this.options().display_type)
                    return this.options().display_type;
                return (this.element().style.display || "").toLowerCase().indexOf('flex') >= 0 ? "flex" : "default";
            },

            _whitespaceCreate: function() {
                var whitespace = document.createElement("whitespace");
                var type = this._whitespaceType();

                if (type == "flex") {
                    whitespace.style.display = "-ms-flexbox";
                    whitespace.style.display = "-webkit-flex";
                    whitespace.style.display = "flex";
                } else
                    whitespace.style.display = "block";

                return whitespace;
            },

            _whitespaceGetHeight: function(whitespace) {
                return whitespace ? Dom.elementDimensions(whitespace).height : 0;
            },

            _whitespaceSetHeight: function(whitespace, height) {
                if (!whitespace)
                    return;
                var type = this._whitespaceType();

                if (type == "flex") {
                    whitespace.style["-webkit-flex"] = "0 0 " + height + "px";
                    whitespace.style["-ms-flex"] = "0 0 " + height + "px";
                    whitespace.style.flex = "0 0 " + height + "px";
                } else
                    whitespace.style.height = height + "px";
            },

            itemsElement: function() {
                return this._itemsElement;
            },

            scrollingDirection: function() {
                return this._scrollingDirection;
            },

            currentElement: function() {
                var offset = Dom.elementOffset(this.element());
                var h = this._options.currentTop ? this._options.elementMargin : (this.element().clientHeight - 1 - this._options.elementMargin);
                var w = this.element().clientWidth / 2;
                var current = Dom.elementFromPoint(offset.left + w, offset.top + h);
                while (current && current.parentNode != this.itemsElement())
                    current = current.parentNode;
                if (!current)
                    return null;
                if (!this._options.currentCenter)
                    return current;
                if (this._options.currentTop) {
                    var delta_top = offset.top - Dom.elementOffset(current).top;
                    if (delta_top > Dom.elementDimensions(current).height / 2)
                        current = current.nextElementSibling;
                } else {
                    var delta_bottom = offset.top + h - Dom.elementOffset(current).top;
                    if (delta_bottom < Dom.elementDimensions(current).height / 2)
                        current = current.previousElementSibling;
                }
                return current;
            },

            scrollTo: function(position, options) {
                var scroll_top = position - (this._options.currentTop ? 0 : (this.element().clientHeight - 1));
                options = options || {};
                options.scroll_top = scroll_top;
                this._host.state().next("ScrollingTo", options);
            },

            scrollToElement: function(element, options) {
                element = Dom.unbox(element);
                var top = Dom.elementOffset(element).top - Dom.elementOffset(this.element()).top + this.element().scrollTop;
                this.scrollTo(top + (this._options.currentTop ? 0 : (Dom.elementDimensions(element).height - 1)), options);
            },

            disableScroll: function() {
                if (this._disableScrollCounter === 0)
                    this.element().style.overflow = "hidden";
                this._disableScrollCounter++;
            },

            enableScroll: function() {
                this._disableScrollCounter--;
                if (this._disableScrollCounter === 0)
                    this.element().style.overflow = this._options.enable_scroll_modifier;
            },

            scrolling: function() {
                return this._host.state().state_name() != "Idle";
            }

        };
    });
});


Scoped.define("module:Interactions.ScrollStates.Idle", ["module:Interactions.State"], function(State, scoped) {
    return State.extend({
        scoped: scoped
    }, {

        itemsElement: function() {
            return this.parent().itemsElement();
        },

        _start: function() {
            this.on(this.element(), "scroll", function() {
                this.next("Scrolling");
            });
        }

    });
});


Scoped.define("module:Interactions.ScrollStates.Scrolling", ["module:Interactions.ScrollStates.Idle"], function(State, scoped) {
    return State.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            _start: function() {
                this.__timer = null;
                this.on(this.element(), "scroll", function() {
                    this._scroll();
                    this.parent().trigger("scroll");
                    clearTimeout(this.__timer);
                    var opts = this.options();
                    var self = this;
                    this.__timer = setTimeout(function() {
                        self.parent().disableScroll();
                        self.parent().trigger("scrollend");
                        self._scrollend();
                        var current = self.parent().currentElement();
                        if (opts.discrete && current) {
                            self.parent().scrollToElement(current, {
                                animate: true,
                                abortable: true
                            });
                        } else
                            self.eventualNext("Idle");
                    }, opts.scrollEndTimeout);
                });
            },

            _scroll: function() {},

            _scrollend: function() {},

            _end: function() {
                clearTimeout(this.__timer);
                this.parent().enableScroll();
                inherited._end.call(this);
            }

        };
    });
});


Scoped.define("module:Interactions.ScrollStates.ScrollingTo", ["module:Interactions.ScrollStates.Idle", "module:Elements.DefaultAnimator"], function(State, Animator, scoped) {
    return State.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            _locals: ["scroll_top", "animate", "abortable"],

            /* Linter */
            _scroll_top: null,
            _abortable: null,

            _start: function() {
                if (!this._abortable)
                    this.parent().disableScroll();
                this.parent().trigger("scrollto");
                this.on(this.element(), "scroll", function() {
                    this._scroll();
                });
                if (this._abortable) {
                    this.on(this.element(), "wheel", function() {
                        this._moved = true;
                        this._abort();
                    });
                    this.on(this.element(), "touchstart", function() {
                        this._moved = true;
                        this._abort();
                    });
                }
                this.suspend();
                if (this._animate) {
                    this._animation = new Animator(
                        this.element(), {
                            styles: {
                                scrollTop: this._scroll_top
                            }
                        },
                        this._finished,
                        this);
                    this._animation.start();
                } else {
                    this.element().scrollTop = this._scroll_top;
                    this._scroll();
                    this._finished();
                }
            },

            _abort: function() {
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

            _finished: function() {
                this.parent().trigger("scrolltoend");
                if (this.destroyed())
                    return;
                this._scrollend();
                if (this._transitioning)
                    this.eventualResume();
                else {
                    this.resume();
                    this.eventualNext(this._moved ? "Scrolling" : "Idle");
                }
            },

            _scroll: function() {},

            _scrollend: function() {},

            _transition: function() {
                this._abort();
            },

            _end: function() {
                if (!this._abortable)
                    this.parent().enableScroll();
                if (this._animation)
                    this._animation.weakDestroy();
                inherited._end.call(this);
            }

        };
    });
});