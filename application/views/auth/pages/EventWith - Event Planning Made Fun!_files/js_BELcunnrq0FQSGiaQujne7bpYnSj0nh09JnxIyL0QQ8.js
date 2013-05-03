/**
*	@name							Elastic
*	@descripton						Elastic is jQuery plugin that grow and shrink your textareas automatically
*	@version						1.6.11
*	@requires						jQuery 1.2.6+
*
*	@author							Jan Jarfalk
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licence						MIT License - http://www.opensource.org/licenses/mit-license.php
*/

(function($){ 
	jQuery.fn.extend({  
		elastic: function() {
		
			//	We will create a div clone of the textarea
			//	by copying these attributes from the textarea to the div.
			var mimics = [
				'paddingTop',
				'paddingRight',
				'paddingBottom',
				'paddingLeft',
				'fontSize',
				'lineHeight',
				'fontFamily',
				'width',
				'fontWeight',
				'border-top-width',
				'border-right-width',
				'border-bottom-width',
				'border-left-width',
				'borderTopStyle',
				'borderTopColor',
				'borderRightStyle',
				'borderRightColor',
				'borderBottomStyle',
				'borderBottomColor',
				'borderLeftStyle',
				'borderLeftColor'
				];
			
			return this.each( function() {

				// Elastic only works on textareas
				if ( this.type !== 'textarea' ) {
					return false;
				}
					
			var $textarea	= jQuery(this),
				$twin		= jQuery('<div />').css({
					'position'		: 'absolute',
					'display'		: 'none',
					'word-wrap'		: 'break-word',
					'white-space'	:'pre-wrap'
				}),
				lineHeight	= parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
				minheight	= parseInt($textarea.css('height'),10) || lineHeight*3,
				maxheight	= parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
				goalheight	= 0;
				
				// Opera returns max-height of -1 if not set
				if (maxheight < 0) { maxheight = Number.MAX_VALUE; }
					
				// Append the twin to the DOM
				// We are going to meassure the height of this, not the textarea.
				$twin.appendTo($textarea.parent());
				
				// Copy the essential styles (mimics) from the textarea to the twin
				var i = mimics.length;
				while(i--){
					$twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
				}
				
				// Updates the width of the twin. (solution for textareas with widths in percent)
				function setTwinWidth(){
					var curatedWidth = Math.floor(parseInt($textarea.width(),10));
					if($twin.width() !== curatedWidth){
						$twin.css({'width': curatedWidth + 'px'});
						
						// Update height of textarea
						update(true);
					}
				}
				
				// Sets a given height and overflow state on the textarea
				function setHeightAndOverflow(height, overflow){
				
					var curratedHeight = Math.floor(parseInt(height,10));
					if($textarea.height() !== curratedHeight){
						$textarea.css({'height': curratedHeight + 'px','overflow':overflow});
					}
				}
				
				// This function will update the height of the textarea if necessary 
				function update(forced) {
					
					// Get curated content from the textarea.
					var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');
					
					// Compare curated content with curated twin.
					var twinContent = $twin.html().replace(/<br>/ig,'<br />');
					
					if(forced || textareaContent+'&nbsp;' !== twinContent){
					
						// Add an extra white space so new rows are added when you are at the end of a row.
						$twin.html(textareaContent+'&nbsp;');
						
						// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
						if(Math.abs($twin.height() + lineHeight - $textarea.height()) > 3){
							
							var goalheight = $twin.height()+lineHeight;
							if(goalheight >= maxheight) {
								setHeightAndOverflow(maxheight,'auto');
							} else if(goalheight <= minheight) {
								setHeightAndOverflow(minheight,'hidden');
							} else {
								setHeightAndOverflow(goalheight,'hidden');
							}
							
						}
						
					}
					
				}
				
				// Hide scrollbars
				$textarea.css({'overflow':'hidden'});
				
				// Update textarea size on keyup, change, cut and paste
				$textarea.bind('keyup change cut paste', function(){
					update(); 
				});
				
				// Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
				$(window).bind('resize', setTwinWidth);
				$textarea.bind('resize', setTwinWidth);
				$textarea.bind('update', update);
				
				// Compact textarea on blur
				$textarea.bind('blur',function(){
					if($twin.height() < maxheight){
						if($twin.height() > minheight) {
							$textarea.height($twin.height());
						} else {
							$textarea.height(minheight);
						}
					}
				});
				
				// And this line is to catch the browser paste event
				$textarea.bind('input paste',function(e){ setTimeout( update, 250); });				
				
				// Run update once when elastic is initialized
				update();
				
			});
			
        } 
    }); 
})(jQuery);;
/*!
 * jCarousel v@VERSION - Riding carousels with jQuery
 * http://sorgalla.com/jcarousel/
 *
 * Copyright 2011, Jan Sorgalla
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * or GPL Version 2 (http://www.opensource.org/licenses/gpl-2.0.php) licenses.
 *
 * Date: @DATE
 */
(function (window) {
    'use strict';

    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            define('jquery.jcarousel', ['jquery'], factory);
        } else {
            var jCarousel = factory(window.jQuery);

            var _jCarousel = window.jCarousel;

            jCarousel.noConflict = function() {
                window.jCarousel = _jCarousel;
                return jCarousel;
            };

            window.jCarousel = jCarousel;
        }
    }(function ($) {
        var toFloat = function(val) {
            return parseFloat(val) || 0;
        };

        var arraySlice = Array.prototype.slice;

        var jCarousel = {};

        jCarousel.version = '@VERSION';

        var rRelativeTarget = /^([+\-]=)?(.+)$/;

        jCarousel.parseTarget = function(target) {
            var relative = false,
                parts = typeof target !== 'object' ?
                            rRelativeTarget.exec(target) :
                            null;

            if (parts) {
                target = parseInt(parts[2], 10) || 0;

                if (parts[1]) {
                    relative = true;
                    if (parts[1] === '-=') {
                        target *= -1;
                    }
                }
            } else if (typeof target !== 'object') {
                target = parseInt(target, 10) || 0;
            }

            return {
                target: target,
                relative: relative
            };
        };

        jCarousel.detectCarousel = function(element) {
            var carousel;

            while (element.size() > 0) {
                carousel = element.filter('[data-jcarousel]');
                if (carousel.size() > 0) {
                    return carousel;
                }

                carousel = element.find('[data-jcarousel]');
                if (carousel.size() > 0) {
                    return carousel;
                }

                element = element.parent();
            }

            return null;
        };

        jCarousel.basePrototype = function(pluginName) {
            return {
                version:     jCarousel.version,
                _options:    {},
                _element:    null,
                _init:       $.noop,
                _create:     $.noop,
                _destroy:    $.noop,
                _reload:    $.noop,
                create: function() {
                    this._element
                        .attr('data-' + pluginName.toLowerCase(), true)
                        .data(pluginName, this);

                    if (false === this._trigger('create')) {
                        return this;
                    }

                    this._create();

                    this._trigger('createend');

                    return this;
                },
                destroy: function() {
                    if (false === this._trigger('destroy')) {
                        return this;
                    }

                    this._destroy();

                    this._trigger('destroyend');

                    this._element
                        .removeData(pluginName)
                        .removeAttr('data-' + pluginName.toLowerCase());

                    return this;
                },
                reload: function(options) {
                    if (false === this._trigger('reload')) {
                        return this;
                    }

                    if (options) {
                        this.options(options);
                    }

                    this._reload();

                    this._trigger('reloadend');

                    return this;
                },
                element: function() {
                    return this._element;
                },
                options: function(key, value) {
                    if (arguments.length === 0) {
                        return $.extend({}, this._options);
                    }

                    if (typeof key === 'string') {
                        if (typeof value === 'undefined') {
                            return typeof this._options[key] === 'undefined' ?
                                    null :
                                    this._options[key];
                        }

                        this._options[key] = value;
                    } else {
                        this._options = $.extend({}, this._options, key);
                    }

                    return this;
                },
                _trigger: function(type, element, data) {
                    var event = $.Event((type + '.' + pluginName).toLowerCase());

                    (element || this._element).trigger(event, [this].concat(data || []));

                    return !event.isDefaultPrevented();
                }
            };
        };

        jCarousel.plugin = function(pluginName, pluginPrototype) {
            return jCarousel.create(pluginName, $.extend({}, {
                    _carousel:   null,
                    carousel: function() {
                        if (!this._carousel) {
                            this._carousel = jCarousel.detectCarousel(this.options('carousel') || this._element);

                            if (!this._carousel) {
                                $.error('Could not detect carousel for plugin "' + pluginName + '"');
                            }
                        }

                        return this._carousel;
                    }
                },
                pluginPrototype
            ));
        };

        jCarousel.create = function(pluginName, pluginPrototype) {
            var Plugin = function(element, options) {
                this._element = $(element);
                this.options(options);

                this._init();
                this.create();
            };

            Plugin.prototype = $.extend(
                {},
                jCarousel.basePrototype(pluginName),
                pluginPrototype
            );

            $.fn[pluginName] = function(options) {
                var args = arraySlice.call(arguments, 1),
                    returnValue = this;

                if (typeof options === 'string') {
                    this.each(function() {
                        var instance = $(this).data(pluginName);

                        if (!instance) {
                            return $.error(
                                'Cannot call methods on ' + pluginName + ' prior to initialization; ' +
                                'attempted to call method "' + options + '"'
                            );
                        }

                        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                            return $.error(
                                'No such method "' + options + '" for ' + pluginName + ' instance'
                            );
                        }

                        var methodValue = instance[options].apply(instance, args);

                        if (methodValue !== instance && typeof methodValue !== 'undefined') {
                            returnValue = methodValue;
                            return false;
                        }
                    });
                } else {
                    this.each(function() {
                        var instance = $(this).data(pluginName);

                        if (instance) {
                            instance.reload(options);
                        } else {
                            new Plugin(this, options);
                        }
                    });
                }

                return returnValue;
            };

            return Plugin;
        };

        jCarousel.create('jcarousel', {
            animating:     false,
            tail:          0,
            inTail:        false,
            resizeTimer:   null,
            lt:            null,
            vertical:      false,
            rtl:           false,
            circular:      false,

            _options: {
                list: function() {
                    return this.element().children().eq(0);
                },
                items: function() {
                    return this.list().children();
                },
                animation: 400,
                wrap:      null,
                vertical:  null,
                rtl:       null,
                center:    false
            },

            // Protected, don't access directly
            _list:         null,
            _items:        null,
            _target:       null,
            _first:        null,
            _last:         null,
            _visible:      null,
            _fullyvisible: null,
            _init: function() {
                var self = this;

                this.onWindowResize = function() {
                    if (self.resizeTimer) {
                        clearTimeout(self.resizeTimer);
                    }

                    self.resizeTimer = setTimeout(function() {
                        self.reload();
                    }, 100);
                };

                this.onAnimationComplete = function(callback) {
                    self.animating = false;

                    var c = self.list().find('[data-jcarousel-clone]');

                    if (c.size() > 0) {
                        c.remove();
                        self._reload();
                    }

                    self._trigger('animateend');

                    if ($.isFunction(callback)) {
                        callback.call(self, true);
                    }
                };

                return this;
            },
            _create: function() {
                this._reload();
                $(window).bind('resize.jcarousel', this.onWindowResize);
            },
            _destroy: function() {
                $(window).unbind('resize.jcarousel', this.onWindowResize);
            },
            _reload: function() {
                this.vertical = this.options('vertical');

                if (this.vertical == null) {
                    this.vertical = this.list().height() > this.list().width();
                }

                this.rtl = this.options('rtl');

                if (this.rtl == null) {
                    this.rtl = (function(element) {
                        if (('' + element.attr('dir')).toLowerCase() === 'rtl') {
                            return true;
                        }

                        var found = false;

                        element.parents('[dir]').each(function() {
                            if ((/rtl/i).test($(this).attr('dir'))) {
                                found = true;
                                return false;
                            }
                        });

                        return found;
                    }(this._element));
                }

                this.lt = this.vertical ? 'top' : 'left';

                // Force items reload
                this._items = null;

                var item = this._target || this.closest();

                // _prepare() needs this here
                this.circular = this.options('wrap') === 'circular';
                this.list().css({'left': 0, 'top': 0});

                if (item.size() > 0) {
                    this._prepare(item);
                    this.list().find('[data-jcarousel-clone]').remove();

                    // Force items reload
                    this._items = null;

                    this.circular = this.options('wrap') === 'circular' &&
                                    this._fullyvisible.size() < this.items().size();

                    this.list().css(this.lt, this._position(item) + 'px');
                }

                return this;
            },
            list: function() {
                if (this._list === null) {
                    var option = this.options('list');
                    this._list = $.isFunction(option) ? option.call(this) : this._element.find(option);
                }

                return this._list;
            },
            items: function() {
                if (this._items === null) {
                    var option = this.options('items');
                    this._items = ($.isFunction(option) ? option.call(this) : this.list().find(option)).not('[data-jcarousel-clone]');
                }

                return this._items;
            },
            closest: function() {
                var self = this,
                    pos = this.list().position()[this.lt],
                    closest = $(), // Ensure we're returning a jQuery instance
                    stop = false,
                    lrb = this.vertical ? 'bottom' : (this.rtl ? 'left' : 'right'),
                    width;

                if (this.rtl && !this.vertical) {
                    pos = (pos + this.list().width() - this.clipping()) * -1;
                }

                this.items().each(function() {
                    closest = $(this);

                    if (stop) {
                        return false;
                    }

                    var dim = self.dimension(closest);

                    pos += dim;

                    if (pos >= 0) {
                        width = dim - toFloat(closest.css('margin-' + lrb));

                        if ((Math.abs(pos) - dim + (width / 2)) <= 0) {
                            stop = true;
                        } else {
                            return false;
                        }
                    }
                });

                return closest;
            },
            target: function() {
                return this._target;
            },
            first: function() {
                return this._first;
            },
            last: function() {
                return this._last;
            },
            visible: function() {
                return this._visible;
            },
            fullyvisible: function() {
                return this._fullyvisible;
            },
            hasNext: function() {
                if (false === this._trigger('hasnext')) {
                    return true;
                }

                var wrap = this.options('wrap'),
                    end = this.items().size() - 1;

                return end >= 0 &&
                    ((wrap && wrap !== 'first') ||
                        (this._last.index() < end) ||
                        (this.tail && !this.inTail)) ? true : false;
            },
            hasPrev: function() {
                if (false === this._trigger('hasprev')) {
                    return true;
                }

                var wrap = this.options('wrap');

                return this.items().size() > 0 &&
                    ((wrap && wrap !== 'last') ||
                        (this._first.index() > 0) ||
                        (this.tail && this.inTail)) ? true : false;
            },
            clipping: function() {
                return this._element['inner' + (this.vertical ? 'Height' : 'Width')]();
            },
            dimension: function(element) {
                return element['outer' + (this.vertical ? 'Height' : 'Width')](true);
            },
            scroll: function(target, animate, callback) {
                if (this.animating) {
                    return this;
                }

                if (false === this._trigger('scroll', null, [target, animate])) {
                    return this;
                }

                if ($.isFunction(animate)) {
                    callback = animate;
                    animate  = true;
                }

                var parsed = jCarousel.parseTarget(target);

                if (parsed.relative) {
                    var end = this.items().size() - 1,
                        scroll = Math.abs(parsed.target),
                        first,
                        index,
                        curr,
                        i,
                        wrap = this.options('wrap');

                    if (parsed.target > 0) {
                        var last = this._last.index();

                        if (last >= end && this.tail) {
                            if (!this.inTail) {
                                this._scrollTail(animate, callback);
                            } else {
                                if (wrap === 'both' || wrap === 'last') {
                                    this._scroll(0, animate, callback);
                                } else {
                                    this._scroll(Math.min(this._target.index() + scroll, end), animate, callback);
                                }
                            }
                        } else {
                            if (last === end &&
                                (wrap === 'both' || wrap === 'last')) {
                                this._scroll(0, animate, callback);
                            } else {
                                first = this._target.index();
                                index = first + scroll;

                                if (this.circular && index > end) {
                                    i = end;
                                    curr = this.items().get(-1);

                                    while (i++ < index) {
                                        curr = this.items().eq(0);
                                        curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                                        this.list().append(curr);
                                        // Force items reload
                                        this._items = null;
                                    }

                                    this._scroll(curr, animate, callback);
                                } else {
                                    this._scroll(Math.min(index, end), animate, callback);
                                }
                            }
                        }
                    } else {
                        if (this.inTail) {
                            this._scroll(Math.max((this._first.index() - scroll) + 1, 0), animate, callback);
                        } else {
                            first = this._first.index();
                            index = first - scroll;

                            if (first === 0 &&
                                (wrap === 'both' || wrap === 'first')) {
                                this._scroll(end, animate, callback);
                            } else {
                                if (this.circular && index < 0) {
                                    i = index;
                                    curr = this.items().get(0);

                                    while (i++ < 0) {
                                        curr = this.items().eq(-1);
                                        curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                                        this.list().prepend(curr);
                                        // Force items reload
                                        this._items = null;

                                        var lt  = toFloat(this.list().css(this.lt)),
                                            dim = this.dimension(curr);

                                        if (this.rtl && !this.vertical) {
                                            lt += dim;
                                        } else {
                                            lt -= dim;
                                        }

                                        this.list().css(this.lt, lt + 'px');
                                    }

                                    this._scroll(curr, animate, callback);
                                } else {
                                    this._scroll(Math.max(first - scroll, 0), animate, callback);
                                }
                            }
                        }
                    }
                } else {
                    this._scroll(parsed.target, animate, callback);
                }

                this._trigger('scrollend');

                return this;
            },
            _scroll: function(item, animate, callback) {
                if (this.animating) {
                    if ($.isFunction(callback)) {
                        callback.call(this, false);
                    }

                    return this;
                }

                if (typeof item !== 'object') {
                    item = this.items().eq(item);
                } else if (typeof item.jquery === 'undefined') {
                    item = $(item);
                }

                if (item.size() === 0) {
                    if ($.isFunction(callback)) {
                        callback.call(this, false);
                    }

                    return this;
                }

                this.inTail = false;

                this._prepare(item);
                var pos = this._position(item),
                    currPos = toFloat(this.list().css(this.lt));

                if (pos === currPos) {
                    if ($.isFunction(callback)) {
                        callback.call(this, false);
                    }

                    return this;
                }

                var properties = {};
                properties[this.lt] = pos + 'px';

                this._animate(properties, animate, callback);

                return this;
            },
            _scrollTail: function(animate, callback) {
                if (this.animating || !this.tail) {
                    if ($.isFunction(callback)) {
                        callback.call(this, false);
                    }

                    return this;
                }

                var pos = this.list().position()[this.lt];

                if (this.rtl) {
                    pos += this.tail;
                } else {
                    pos -= this.tail;
                }

                this.inTail = true;

                var properties = {};
                properties[this.lt] = pos + 'px';

                this._update({
                    target:       this._target.next(),
                    fullyvisible: this._fullyvisible.slice(1).add(this._visible.last())
                });

                this._animate(properties, animate, callback);

                return this;
            },
            _animate: function(properties, animate, callback) {
                if (false === this._trigger('animate')) {
                    if ($.isFunction(callback)) {
                        callback.call(this, false);
                    }

                    return this;
                }

                this.animating = true;

                var animation = this.options('animation');

                if (!animation || animate === false) {
                    this.list().css(properties);
                    this.onAnimationComplete(callback);
                } else {
                    var self = this;

                    if ($.isFunction(animation)) {
                        animation.call(this, properties, function() {
                            self.onAnimationComplete(callback);
                        });
                    } else {
                        var opts = typeof animation === 'object' ?
                                    animation :
                                    {duration: animation},
                            oldComplete = opts.complete;

                        opts.complete = function() {
                            self.onAnimationComplete(callback);
                            if ($.isFunction(oldComplete)) {
                                oldComplete.call(this);
                            }
                        };

                        this.list().animate(properties, opts);
                    }
                }

                return this;
            },
            _prepare: function(item) {
                var index = item.index(),
                    idx = index,
                    wh = this.dimension(item),
                    clip = this.clipping(),
                    update = {
                        target:       item,
                        first:        item,
                        last:         item,
                        visible:      item,
                        fullyvisible: wh <= clip ? item : $()
                    },
                    lrb = this.vertical ? 'bottom' : (this.rtl ? 'left'  : 'right'),
                    curr,
                    margin;

                if (this.options('center')) {
                    wh /= 2;
                    clip /= 2;
                }

                if (wh < clip) {
                    while (true) {
                        curr = this.items().eq(++idx);

                        if (curr.size() === 0) {
                            if (this.circular) {
                                curr = this.items().eq(0);
                                if (item.get(0) === curr.get(0)) {
                                    break;
                                }
                                curr.after(curr.clone(true).attr('data-jcarousel-clone', true));
                                this.list().append(curr);
                                // Force items reload
                                this._items = null;
                            } else {
                                break;
                            }
                        }

                        wh += this.dimension(curr);

                        update.last = curr;
                        update.visible = update.visible.add(curr);

                        // Remove right/bottom margin from total width
                        margin = toFloat(curr.css('margin-' + lrb));

                        if ((wh - margin) <= clip) {
                            update.fullyvisible = update.fullyvisible.add(curr);
                        }

                        if (wh >= clip) {
                            break;
                        }
                    }
                }

                if (!this.circular && wh < clip) {
                    idx = index;

                    while (true) {
                        if (--idx < 0) {
                            break;
                        }

                        curr = this.items().eq(idx);

                        if (curr.size() === 0) {
                            break;
                        }

                        wh += this.dimension(curr);

                        update.first = curr;
                        update.visible = update.visible.add(curr);

                        // Remove right/bottom margin from total width
                        margin = toFloat(curr.css('margin-' + lrb));

                        if ((wh - margin) <= clip) {
                            update.fullyvisible = update.fullyvisible.add(curr);
                        }

                        if (wh >= clip) {
                            break;
                        }
                    }
                }

                this._update(update);

                this.tail = 0;

                if (this.options('wrap') !== 'circular' &&
                    this.options('wrap') !== 'custom' &&
                    update.last.index() === (this.items().size() - 1)) {

                    // Remove right/bottom margin from total width
                    wh -= toFloat(update.last.css('margin-' + lrb));

                    if (wh > clip) {
                        this.tail = wh - clip;
                    }
                }

                return this;
            },
            _position: function(item) {
                var first = this._first,
                    pos   = first.position()[this.lt];

                if (this.rtl && !this.vertical) {
                    pos -= this.clipping() - this.dimension(first);
                }

                if (this.options('center')) {
                    pos -= (this.clipping() / 2) - (this.dimension(first) / 2);
                }

                if ((item.index() > first.index() || this.inTail) && this.tail) {
                    pos = this.rtl ? pos - this.tail : pos + this.tail;
                    this.inTail = true;
                } else {
                    this.inTail = false;
                }

                return -pos;
            },
            _update: function(update) {
                var self = this,
                    current = {
                        target:       this._target || $(),
                        first:        this._first || $(),
                        last:         this._last || $(),
                        visible:      this._visible || $(),
                        fullyvisible: this._fullyvisible || $()
                    },
                    back = (update.first || current.first).index() < current.first.index(),
                    key,
                    doUpdate = function(key) {
                        var elIn = [],
                            elOut = [];

                        update[key].each(function() {
                            if (current[key].index(this) < 0) {
                                elIn.push(this);
                            }
                        });

                        current[key].each(function() {
                            if (update[key].index(this) < 0) {
                                elOut.push(this);
                            }
                        });

                        if (back) {
                            elIn = elIn.reverse();
                        } else {
                            elOut = elOut.reverse();
                        }

                        self._trigger('item' + key + 'in', $(elIn));
                        self._trigger('item' + key + 'out', $(elOut));

                        self['_' + key] = update[key];
                    };

                for (key in update) {
                    doUpdate(key);
                }

                return this;
            }
        });

        return jCarousel;
    }));
}(window));
;
(function($) { 

Drupal.ewNotification = Drupal.ewNotification || {
  wrapperID: '#block-eventwith-notifications-notif-block',
  isActive: false,
  defaults: {
    ttl: 4000,
  },
  setMessage: function(message, isShowing) {
    isShowing = typeof isShowing !== "undefined" ? isShowing : false;

    if (!isShowing) {
      $('.notification-content', Drupal.ewNotification.wrapperID).fadeOut(500, function() {
        $(this).html(message).fadeIn(500);
      });
    }
    else {
      $('.notification-content', Drupal.ewNotification.wrapperID).html(message);
    }
  },
  getMessage: function() {
    return $('.notification-content', Drupal.ewNotification.wrapperID).html();
  },
  showNotification: function(message, ttl, callback) {
    if (Drupal.ewNotification.isActive != true) {
      Drupal.ewNotification.isActive = true;

      if (typeof message !== 'undefined') {
        Drupal.ewNotification.setMessage(message, true);
      }

      ttl = typeof ttl !== 'undefined' ? ttl : Drupal.ewNotification.defaults.ttl;

      $(Drupal.ewNotification.wrapperID).css('top', '-87px');
      $(Drupal.ewNotification.wrapperID).center('horizontal');
      $(Drupal.ewNotification.wrapperID).css('position', 'fixed');
      $(Drupal.ewNotification.wrapperID).show();
      $(Drupal.ewNotification.wrapperID).animate({
        top: '+=80',
      }, 600, 'easeOutBack', function() {
        window.setTimeout(function() {
          Drupal.ewNotification.hideNotification();

          if (typeof callback !== "undefined") {
            callback();
          }
        }, ttl);
      });
    }
  },
  hideNotification: function() {
    $(Drupal.ewNotification.wrapperID).animate({
      top: '-=80',
    }, 600, 'easeInBack', function() {
      $(Drupal.ewNotification.wrapperID).hide();
      Drupal.ewNotification.isActive = false;
    });
  },
};

Drupal.behaviors.ewNotification = {
  attach: function(context, settings) {
    $(Drupal.ewNotification.wrapperID, context).once('ewNotification', function() {
      $('.popup-close', this).click(function() {
        Drupal.ewNotification.hideNotification();
      });
    });
  },
};

Drupal.behaviors.ewNotification = {
  attach: function(context, settings) {
	if(Drupal.settings.eventwithNotifications && Drupal.settings.eventwithNotifications.messages) {
		Drupal.ewNotification.showNotification(Drupal.settings.eventwithNotifications.messages, 2000);
	}
  }
};

})(jQuery);;
(function($){

	Drupal.eventWith = Drupal.eventWith || {
		tapBlockSave : function() {
			var atopBlock = $("#block-eventwith-alternative-time-and-place");
			var extractChanges = function(element) {
				var name = $('.choice-wrapper.selected input', element).attr('name');
				var changes = {};
				changes[name] = $('.choice-wrapper.selected input', element).val();
				return changes;
			}

			var options = extractChanges($('#time-alternative', atopBlock));
			options = $.extend(options, extractChanges($('#place-alternative', atopBlock)));
			options['nid'] = Drupal.settings.eventWith.eventNid;

			$.ajax({
				  type: 'POST',
				  url: Drupal.settings.eventWith.eventWithUpdateAtap,
				  data: options,
				  async: true,
			}).done(function( response ) {
				var result = $.parseJSON(response);
				if(!result) {
					return;
				}
				if(result.status) {
					// unbinding maybe ?
					$('.content', atopBlock).html(result.html);
					if (typeof Drupal.itemListWidget !== "undefined") {
						Drupal.itemListWidget.refreshGamification();
					}
				}
			});

			/*$.post(Drupal.settings.eventWith.eventWithUpdateAtap, options, function(data, textStatus, jqXHR){
				var result = $.parseJSON(data);
				if(!result) {
					return;
				}
				if(result.status) {
					// unbinding maybe ?
					$('.content', atopBlock).html(result.html);
				}
			});*/
		},
		trackConv: function(google_conversion_id, google_conversion_label) {
      var image = new Image(1,1);
      image.src = "http://www.googleadservices.com/pagead/conversion/"+ google_conversion_id +"/?label="+ google_conversion_label + "&guid=ON&script=0";
    }
	};
	$(document).ajaxComplete(function(event, xhr, settings){
		// reAttach flags to data tables new loaded content
		Drupal.behaviors.checkbox.attach();

		if (typeof Drupal.settings.datatables !== 'undefined') {
			$.each(Drupal.settings.datatables, function(key, value){
				if(key == '#items-list-table' || key == '#guests-list-table' || key == '#my-tab-todo-table') {
					return;
				}
				if(settings.url.indexOf(value.sAjaxSource) == 0) {
					// Flag links should be re-binded now. Calling everyone to handle it again
					Drupal.flagLink(key);
					$(key).trigger(key + "-ajax-refreshed");
					// Dosn't display an  empty table
					var response = $.parseJSON(xhr.responseText);
					if(response.aaData.length == 0) {
					   // Empty items. check if the table is
					   $(key).parents('.dataTables_wrapper').hide();
					}
					else {
					   $(key).parents('.dataTables_wrapper').show();
					}
				}
			});
		}
	});

	Drupal.behaviors.ewUserResetPass = {
		attach: function(context, settings) {
			$('.form-submit', '#user-pass').once('ewUserResetPass', function() {
				$(this).mousedown(function() {
					Drupal.ewNotification.showNotification(Drupal.t('Password reset instructions were mailed to ') + $('.form-item-name input', '#user-pass').val(), 4000);
				});
			});
		}
	}

	/**
	 * Top menu behaviors
	 */
	Drupal.behaviors.evTopMenu = {
			attach: function (context, settings) {
				$("#block-eventwith-eventwith-main-menu", context).once('evTopMenu', function () {
					$(".me-row", ".my-events-wrapper").click(function(e){
						window.location.href = $("a",this).attr("href");
					});
				});
				$("#block-eventwith-eventwith-user", context).once('evTopMenu', function () {
					/*$(".eub-top", this).hover(function(e){
					});*/
				});
			}

	}

	Drupal.behaviors.evComments = {
		attach: function (context, settings) {
			$("#block-comment-block-node-comments", context).once('evComments', function () {
				var form = $("#comment-form-wrapper", this);
				var title = $("h2.title", form);
				title.hide();
				var textarea = $("textarea", form);
				$(textarea).attr('title', title.text()).jLabel();

				var comments = $("#comment-wrapper");
				$('.username', comments).live('click', function(){
					return false;
				});
			});
		}
	}

	/**
	 * Popup behaviors
	 */
	Drupal.behaviors.evPopUp = {
		attach: function (context, settings) {
			$(".popup-wrapper", context).once('evPopUp', function () {
				$(".popup-close, .buttons .cancel", this).bind('click', function(){
					$(this).parents('.popup-wrapper').hide();
					$('#ew-overlay').hide();
				});
			});
		}
	}

	/**
	 * Feedback
	 */
	Drupal.behaviors.ewFeedback = {
		attach: function(context, settings) {
			$('#feedback_simple', context).once('ewFeedback', function() {
				$('a', this).click(function(e) {
					$('#ew-overlay').show();
					$('.popup-wrapper', '#block-eventwith-feedback-block').center().fadeIn();

					e.preventDefault();
					return false;
				});
			});

			$('#block-eventwith-feedback-block', context).once('ewFeedback', function() {
				$('textarea', this).elastic();
			});

			$('.send', '#block-eventwith-feedback-block').once('ewFeedback', function() {
				$(this).click(function() {
					$.ajax({
						url: '/ew/send/feedback',
						type: 'POST',
						data: {
							message: $('textarea', '#block-eventwith-feedback-block').val(),
							url: top.location.href,
						},
						dataType: 'JSON',
						success: function(data) {
							if (data.status == 'success') {
								$('.popup-close', '#block-eventwith-feedback-block').click();
								$('textarea', '#block-eventwith-feedback-block').val('');
								Drupal.ewNotification.showNotification(Drupal.t('Got it! Thanks for making EventWith even better.'), 3000);
							}
						},
					});
				});
			});
		}
	}

	/**
	 * Alternative and Time (Item list page)
	 */
	Drupal.behaviors.evATAP = {
		attach: function (context, settings) {
			$("#block-eventwith-alternative-time-and-place", context).once('evATAP', function () {
				var parent = this;
				// Handling event's image hover
				$('.field-name-field-image img', 'article').mouseenter(function() {
					$('.event-image-hover-link .event-image-hover', 'article').fadeIn();
				});
				$('.event-image-hover-link .event-image-hover', 'article').mouseleave(function() {
					$('.event-image-hover-link .event-image-hover', 'article').fadeOut();
				});


				// Handling Alternative place click
				$('.radio', '#place-alternative').live('click', function() {
					if (!$("input", this).is(':disabled') && !$(this).parent().hasClass('selected')) {
						$('.choice-wrapper', '#place-alternative').removeClass('selected');
						$(this).parent().addClass('selected');

						$('.choice-wrapper .ew-radio', '#place-alternative').removeClass('checked');
						$('.ew-radio', this).addClass('checked');

						$('input', '#place-alternative').attr('checked', false);
						$('input', this).attr('checked', true);

						$("#change-alternatives").css('visibility', 'visible');
					}
				});
				// Handling Alternative time click
				$('.radio', '#time-alternative').live('click', function() {
					if (!$("input", this).is(':disabled') && !$(this).parent().hasClass('selected')){
						$('.choice-wrapper', '#time-alternative').removeClass('selected');
						$(this).parent().addClass('selected');

						$('.choice-wrapper .ew-radio', '#time-alternative').removeClass('checked');
						$('.ew-radio', this).addClass('checked');

						$('input', '#time-alternative').attr('checked', false);
						$('input', this).attr('checked', true);

						$("#change-alternatives").css('visibility', 'visible');
					}
				});

				$('.choice-voters', '#place-alternative').live('mouseenter', function(e) {
					$('.voters-wrapper', '#place-alternative').fadeOut();
					var pos = $(e.target).position();
					var container = $(this).parent().children('.voters-wrapper');
					var moveTop = pos.top - container.height() - 12;
					var moveLeft = pos.left - ((container.width() / 2) - ($(this).width() / 2) - 3);

					container.css({
						top: moveTop,
						left: moveLeft
					});

					var tipMoveRight = (container.width() / 2) - ($('.tip', container).width() / 2);

					$('.tip', container).css('right',  tipMoveRight + 'px');

					container.fadeIn();

				});
				$('.choice-voters', '#place-alternative').live('mouseleave', function() {
					$(this).parent().children('.voters-wrapper').fadeOut();
				});
				$('.choice-voters', '#time-alternative').live('mouseenter', function(e) {
					$('.voters-wrapper', '#time-alternative').fadeOut();
					var pos = $(e.target).position();
					var container = $(this).parent().children('.voters-wrapper');
					var moveTop = pos.top - container.height() - 12;
					var moveLeft = pos.left - ((container.width() / 2) - ($(this).width() / 2) - 3);

					container.css({
						top: moveTop,
						left: moveLeft
					});

					var tipMoveRight = (container.width() / 2) - ($('.tip', container).width() / 2);

					$('.tip', container).css('right',  tipMoveRight + 'px');

					container.fadeIn();

				});
				$('.choice-voters', '#time-alternative').live('mouseleave', function() {
					$(this).parent().children('.voters-wrapper').fadeOut();
				});


				//click
				$('#change-alternatives', this).live('click', function(){
					Drupal.eventWith.tapBlockSave();
				});

			});
		}
	}

	/**
	 * $.unserialize
	 *
	 * Takes a string in format "param1=value1&param2=value2" and returns an object { param1: 'value1', param2: 'value2' }. If the "param1" ends with "[]" the param is treated as an array.
	 *
	 * Example:
	 *
	 * Input:  param1=value1&param2=value2
	 * Return: { param1 : value1, param2: value2 }
	 *
	 * Input:  param1[]=value1&param1[]=value2
	 * Return: { param1: [ value1, value2 ] }
	 *
	 * @todo Support params like "param1[name]=value1" (should return { param1: { name: value1 } })
	 */
	$.unserialize = function(serializedString){
		var str = decodeURI(serializedString);
		var pairs = str.split('&');
		var obj = {}, p, idx, val;
		for (var i=0, n=pairs.length; i < n; i++) {
			p = pairs[i].split('=');
			idx = p[0];

			if (idx.indexOf("[]") == (idx.length - 2)) {
				// Eh um vetor
				var ind = idx.substring(0, idx.length-2)
				if (obj[ind] === undefined) {
					obj[ind] = [];
				}
				obj[ind].push(p[1]);
			}
			else {
				obj[idx] = p[1];
			}
		}
		return obj;
	};

	if (!(typeof $.fn.dataTableExt == 'undefined' || typeof $.fn.dataTableExt.oApi == 'undefined')) {
		$.fn.dataTableExt.oApi.fnReloadAjax = function ( oSettings, sNewSource, fnCallback, bStandingRedraw )
		{
		    if ( typeof sNewSource != 'undefined' && sNewSource != null )
		    {
		        oSettings.sAjaxSource = sNewSource;
		    }
		    this.oApi._fnProcessingDisplay( oSettings, true );
		    var that = this;
		    var iStart = oSettings._iDisplayStart;
		    var aData = [];

		    this.oApi._fnServerParams( oSettings, aData );

		    oSettings.fnServerData( oSettings.sAjaxSource, aData, function(json) {
		        /* Clear the old information from the table */
		        that.oApi._fnClearTable( oSettings );

		        /* Got the data - add it to the table */
		        var aData =  (oSettings.sAjaxDataProp !== "") ?
		            that.oApi._fnGetObjectDataFn( oSettings.sAjaxDataProp )( json ) : json;

		        for ( var i=0 ; i<aData.length ; i++ ) {
		            that.oApi._fnAddData( oSettings, aData[i] );
		        }

		        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
		        that.fnDraw();

		        if ( typeof bStandingRedraw != 'undefined' && bStandingRedraw === true ) {
		            oSettings._iDisplayStart = iStart;
		            that.fnDraw( false );
		        }

		        that.oApi._fnProcessingDisplay( oSettings, false );

		        /* Callback user function - for event handlers etc */
		        if ( typeof fnCallback == 'function' && fnCallback != null )
		        {
		            fnCallback( oSettings );
		        }
		    }, oSettings );
		};

	}
})(jQuery);
;
/*!
 * jCarousel Control Plugin v@VERSION
 * http://sorgalla.com/jcarousel/
 *
 * Copyright 2011, Jan Sorgalla
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * or GPL Version 2 (http://www.opensource.org/licenses/gpl-2.0.php) licenses.
 *
 * Date: @DATE
 */

(function (window) {
    'use strict';

    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            define('jquery.jcarousel.control', ['jquery', 'jquery.jcarousel'], factory);
        } else {
            factory(window.jQuery, window.jCarousel);
        }
    }(function ($, jCarousel) {
        jCarousel.plugin('jcarouselControl', {
            _options: {
                target: '+=1',
                event:  'click'
            },
            _active: null,
            _init: function() {
                this.onDestroy = $.proxy(function() {
                    this._destroy();
                    this.carousel().one('createend.jcarousel', $.proxy(this._create, this));
                }, this);
                this.onReload = $.proxy(this._reload, this);
                this.onEvent = $.proxy(function(e) {
                    e.preventDefault();
                    this.carousel().jcarousel('scroll', this.options('target'));
                }, this);
            },
            _create: function() {
                this.carousel()
                    .one('destroy.jcarousel', this.onDestroy)
                    .bind('reloadend.jcarousel scrollend.jcarousel', this.onReload);

                this._element
                    .bind(this.options('event') + '.jcarouselcontrol', this.onEvent);

                this._reload();
            },
            _destroy: function() {
                this._element
                    .unbind('.jcarouselcontrol', this.onEvent);

                this.carousel()
                    .unbind('destroy.jcarousel', this.onDestroy)
                    .unbind('reloadend.jcarousel scrollend.jcarousel', this.onReload);
            },
            _reload: function() {
                var parsed = jCarousel.parseTarget(this.options('target')),
                    carousel = this.carousel(),
                    active;

                if (parsed.relative) {
                    active = carousel.jcarousel(parsed.target > 0 ? 'hasNext' : 'hasPrev');
                } else {
                    var target = typeof parsed.target !== 'object' ?
                                    carousel.jcarousel('items').eq(parsed.target) :
                                    parsed.target;

                    active = carousel.jcarousel('target').index(target) >= 0;
                }

                if (this._active !== active) {
                    this._trigger(active ? 'active' : 'inactive');
                    this._active = active;
                }

                return this;
            }
        });
    }));
}(window));
;
(function($){
Drupal.ewDashboard = Drupal.ewDashboard || {
	blockIDs: [ '#block-eventwith-dashboard-events-stream', '#block-eventwith-fb-facebook-events' ],
	carousel: null,
	deleteNid: null
}

Drupal.behaviors.ewDashboard = {
  attach: function (context, settings) {
  	$.each(Drupal.ewDashboard.blockIDs, function(index, blockID) {
  		$(blockID, context).once('ewDashboard', function() {
	      var carousel = $('.jcarousel', blockID).jcarousel({
	        // Core configuration goes here
		    });

		    $('.jcarousel-prev', blockID).jcarouselControl({
		        target: '-=3',
		        carousel: carousel
		    });

		    $('.jcarousel-next', blockID).jcarouselControl({
		        target: '+=3',
		        carousel: carousel
		    });

		    switch(index) {
		    	case 0:
		    		// eventwith
		    		$('.jcarousel li .views-field', blockID).click(function(event) {
		    			var href = $('.field-content a', $(this).parent()).first().attr('href');
		    			window.location.href = $('.field-content a', $(this).parent()).first().attr('href');
				    });
		    		break;
		    	case 1:
		    		// fb
		    		$('.jcarousel li .views-field', blockID).click(function(event) {
				    	window.location.href = $('a', $(this).parents('li')).first().attr('href');
				    });
		    		break;
		    }

		    $('.delete-event', this).click(function(e) {
		    	$('#ew-overlay').show();
		    	$('.popup-wrapper', '#block-eventwith-dashboard-events-stream').center().fadeIn();

		    	var href = $(this).parent().attr('href');
		    	href = href.replace('/node/', '');
		    	nid = href.replace('/delete', '');
		    	Drupal.ewDashboard.deleteNid = nid;

		    	return false;
		    });

		    $('.popup-wrapper .buttons .approve', this).click(function(e) {
		    	// Fetching the user's facebook even'ts in the background
			  	$.ajax({
			   		url: '/ew/delete/event',
			   		async: false,
			   		type: 'POST',
			   		data: {
			   			'nid': Drupal.ewDashboard.deleteNid,
			   		},
			   		success: function(data, textStatus, jqXHR) {
			   			$('.popup-wrapper .popup-close').click();
			   			if (data.success == true) {
			   				window.location.reload();
			   			}
			   		}
			   	});

		    	return false;
		    });

		    /*$(window).scroll(function() {
		      $('.popup-wrapper', '#block-eventwith-dashboard-events-stream').center();
		    });*/

	  	});
  	});
	}
};

Drupal.behaviors.ewDashboardPostFB = {
  attach: function(context, settings) {
  	$('#friends-box').once('ewDashboardPostFB', function() {
  		$('.action', this).click(function() {
  			// Post to friends
  			var selected = $('.selected', '#friends-box');

        var friends = [];
        $(selected).each(function() {
          var friend = {
            id: $(this).attr("id"),
            name: $('.name', this).text(),
          };
          friends.push(friend);
        });

        if (selected.length > 0) {
          $.ajax({
            url: '/ew/post/friends',
            type: 'POST',
            data: {
              friends: JSON.stringify(friends),
            },
          });
        }
  		});
  	});
  }
};

})(jQuery);;
(function($) {

Drupal.behaviors.ewFBEventsStream = {
	attach: function(context, settings) {
		$('.fake-connect-with-facebook', '#block-eventwith-fb-facebook-events').once('ewFBEventsStream', function() {			
			$(this).click(function() {				
				$('#block-eventwith-fb-facebook-events').css('background', 'transparent');

				$('.fake-connect-with-facebook').fadeOut(500, function() {
					$('.fake-connect-with-facebook').css('visibility', 'hidden');
					$('.fake-connect-with-facebook').css('display', 'block');
					$('.facebook-action-wrapper .loader', '#block-eventwith-fb-facebook-events').fadeIn(500);

					$.ajax({type: 'GET',
			      url: '/ew/get/fb/events',					      
			      dataType: 'json',
			      success: function (data) {
			        if (typeof data.status !== "undefined") {
			        	if (data.status == 'success') {
									$('.facebook-action-wrapper').fadeOut(500, function() {
										$('#block-eventwith-fb-facebook-events').append(data.html).css('display', 'none').fadeIn(500);

										// Allowing the attach function to apply itself
										$('#block-eventwith-fb-facebook-events').removeClass('ewDashboard-processed');
										
										// Connecting the next/prev handler
										Drupal.behaviors.ewDashboard.attach();
									});			        									
								}
								else {
									// No events found
									$('.facebook-action-wrapper .loader', '#block-eventwith-fb-facebook-events').fadeOut(500, function() {
										$('.right-wrapper', '#block-eventwith-fb-facebook-events').prepend(data.html);
										$('.fake-connect-with-facebook').css('display', 'none');
										$('#fb-create-first-event').fadeIn(500);
									});
								}
			        }
			        else {}
			    	}
					});					
				});				
			});

			if (typeof Drupal.settings.ewFB.autoLoadStream !== "undefined" && Drupal.settings.ewFB.autoLoadStream == 'true') {
				$(this).click();
			}
		})
	}
};

})(jQuery);;
;
