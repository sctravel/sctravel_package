//
// Typeahead.js - a wrapper for the 
//
// Documentation: http://confluence/display/POS/Typeahead+Javascript
// API documentation: http://confluence/display/POS/Expedia+Suggest+%28Type+Ahead%29+API+Family
//
! function ($) {
    "use strict";

    var tooltipPlugin = 'uitk_tooltip';

    //
    // Constructor
    //
    var Typeahead = function (input, template, options) {

        // The <input>
        this.$element = $(input);

        // The <input>'s <label>
        this.$label = this.$element.closest('label');

        // 'template' can be a CSS selector or an element or precompiled
        if (!options.rawHtml) {
            if (uitk) {
                //if uitk is available returns a compiled template based on id
                //this could be precompiled on the server or compiled on the client
                this.template = uitk.getCompiledTemplate(template);
            } else {
                template = $(template).html();
                this.template = Handlebars.compile(template);
            }
        } else {
            this.template = Handlebars.compile(template);
        }


        this.opts = $.extend(true, {}, Typeahead.defaultOptions, options);

        // State:
        this.searchType = null;
        this.cache = {};
        this.ignoreNext = false; // ???
        this.isClickOn = false;
        this.bodyClick = false;

        // Set up the input and listeners:
        this.$element.autocomplete = 'off';
        // For gecko-based browsers, we turn autocomplete off on the <form>,
        // not the <input>
        this.$element.closest('form').attr('autocomplete', 'off');

        this.$element
            .on('focus', $.proxy(this.focus, this))
            .on('keydown', $.proxy(this.keyDown, this))
            .on('keyup', $.proxy(this.keyUp, this))
            .on('keypress', $.proxy(this.keyPress, this))
            .on('blur', $.proxy(this.blur, this));

        // Typeahead dialog and its listeners:
        this.$ta = $('<div class="typeahead">');

        if (this.opts.tooltip) {
            this.$element[tooltipPlugin]({
                content: this.$ta,
                template: '<div class="uitk-tooltip"><div class="tooltip-inner"></div><span class="tooltip-arrow-border"></span><span class="tooltip-arrow"></span></div>'
            });
        } else {
            this.$ta.appendTo(document.body);

            if (!uitk.isTouchDevice) {
                this.$ta
                    .on('mousedown', $.proxy(this.clickOn, this))
                    .on('mouseup', $.proxy(this.clickOff, this))
                    .on('click', $.proxy(this.click, this))
                    .on('mouseenter', 'a', $.proxy(this.mouseEnter, this));
            } else {
                this.$ta.on('click', function (e) {
                    e.preventDefault()
                });
            }
        }

        // attach a reference to this instance to the input
        this.$element.data('typeahead', this);

        //    console.log(this.$element);
        //    console.log(this.$element.data('typeahead'));
        //    console.log('done');

        // Sometimes the first request is too slow, we ping the service ahead of
        // time to help speed it up:
        this.request('zzzzzz', true);
    };

    //
    // Prototype:
    //
    Typeahead.prototype = {

        constructor: Typeahead,
        shouldBeOpen: false,

        startRequest: function () {
            var text = this.$element.val();
            if (text.length >= this.opts.minchar) {
                if (!this.cache[text]) {
                    this.request(text);
                } else {
                    this.render(text, this.cache[text]);
                }
            } else {
                this.close();
            }
        },

        // ignoreResults is used to ping the typeahead service on init. Apparently this makes things faster.
        request: function (text, ignoreResults) {
            var url = [
                '//suggest.expedia.com/hint/es/',
                this.opts.version,
                '/ac/',
                this.opts.locale,
                '/',
                encodeURIComponent(text),
                '?callback=?'
            ].join('');

            var cb;

            if (ignoreResults) {
                cb = $.noop;
            } else {
                cb = $.proxy(this.callback, this);
            }

            $.getJSON(
                url, {
                    type: this.opts.mask,
                    ab: this.opts.abtest,
                    lob: this.opts.lob,
                    format: 'json',
                    dest: this.opts.dest,
                    maxresults: this.opts.maxresults,
                    rid: this.opts.regionid
                },
                cb);
        },

        callback: function (json) {
            var results = json.sr ? json.sr : json.r;
            var q = json.q;
            if (results && this.shouldBeOpen) {
                this.cache[q] = results;
                this.render(q, results);
            } else {
                this.cache[q] = [];
                this.close();
            }
        },

        render: function (text, results) {

            // does this have results, and has the typeahead changed?
            if (results.length > 0 && this.$element.val() == text) {
                // Sort the results:
                results.sort(function (a, b) {
                    return a.i - b.i;
                });

                var opts = this.opts;

                var categoriesPresent = {};
                $.each(results, function (i, result) {
                    var category = Typeahead.CATEGORIES[result.t];
                    var categoryName = category ? category.name : 'Other'; // TODO : does this case exist? can we move the string to config?

                    if (typeof categoriesPresent[categoryName] === 'undefined') {
                        categoriesPresent[categoryName] = true;
                    }
                });

                // Create a mapping from category to results:
                var resultsByCategory = {};
                if (this.opts.lob == 'HOTELS') {
                    if (categoriesPresent['Region/City']) resultsByCategory['Region/City'] = [];
                    if (categoriesPresent['Attractions']) resultsByCategory['Attractions'] = [];
                    if (categoriesPresent['Airports']) resultsByCategory['Airports'] = [];
                    if (categoriesPresent['Hotels']) resultsByCategory['Hotels'] = [];
                } else if (this.opts.lob == 'CARS') {
                    if (categoriesPresent['Airports']) resultsByCategory['Airports'] = [];
                    if (categoriesPresent['Region/City']) resultsByCategory['Region/City'] = [];
                    if (categoriesPresent['Attractions']) resultsByCategory['Attractions'] = [];
                }

                $.each(results, function (i, result) {
                    var category = Typeahead.CATEGORIES[result.t];
                    var categoryName = category ? category.name : 'Other'; // TODO : does this case exist? can we move the string to config?

                    if (typeof resultsByCategory[categoryName] === 'undefined') {
                        resultsByCategory[categoryName] = [];
                    }
                    resultsByCategory[categoryName].push(result);

                    if (opts.forceicon) {
                        result.icon = opts.forceicon;
                    } else {
                        result.icon = category.icon;
                    }

                    if (typeof result.l != "undefined")
                        result.l = result.l.replace(/'/g, "&#39;");
                    else
                        result.l = result.f.replace(/'/g, "&#39;");

                    result.data = JSON.stringify(result);
                });

                // Create an object to pass to the template:
                var model = {
                    continueText: this.opts.continuetext,
                    closeText: this.opts.closetext,
                    results: results,
                    resultsByCategory: resultsByCategory
                };

                var content = this.template(model);

                this.$ta.html(content);
                if (this.$ta.is(':hidden')) {
                    this.$ta.show();
                }

                this.$label.addClass('focused');

                if (this.opts.tooltip) {
                    this.$element[tooltipPlugin]('show');

                    this.$element[tooltipPlugin]('checkPos', true, true);

                        this.$ta
                            .on('mousedown', $.proxy(this.clickOn, this))
                            .on('mouseup', $.proxy(this.clickOff, this))
                            .on(uitk.clickEvent, $.proxy(this.click, this))
                            .on('mouseenter', 'a', $.proxy(this.mouseEnter, this));

                } else {
                    var height = parseInt(this.$element.css('height'), 10);

                    var offset = this.$element.offset();
                    this.$ta.css({
                        top: offset.top + height + 'px',
                        left: offset.left + 'px'
                    });
                    this.$ta.show();
                }
            } else {
                this.close();
            }
        },

        close: function () {
            this.$label.removeClass('focused');

            if (this.opts.tooltip) {
                this.$element[tooltipPlugin]('hide');
            } else {
                this.$ta.hide();
                this.$ta.html('');
            }

            if (this.bodyClick) {
                this.$ta.unbind('mousedown', $.proxy(this.cancelEvent, this));
                $(document.body).unbind('mousedown', $.proxy(this.close, this));
                this.bodyClick = false;
            }
        },

        prev: function () {
            var links = this.$ta.find('a'),
                current = this.$ta.find('.highlight').removeClass('highlight'),
                i = links.index(current),
                prev = links[i - 1];

            if (prev) {
                $(prev).addClass('highlight');
            }
        },

        next: function () {
            var links = this.$ta.find('a'),
                current = this.$ta.find('.highlight').removeClass('highlight'),
                i = links.index(current),
                next = links[i + 1];

            if (next) {
                $(next).addClass('highlight');
            }
        },

        removeHighlights: function () {
            this.$ta.find('.highlight').removeClass('highlight');
        },

        // Choose the currently selected item:
        selectHighlighted: function (e) {
            var $item = this.$ta.find('.highlight');

            //used for touch devices as they don't have hover and therefore don't highlight
            if(e && $item.length === 0){
                $item = $(e.target).closest('.results-item').find('a');
            }

            this.updateTextField($item);
            $item.removeClass('highlight');
        },

        updateTextField: function ($item) {
            if ($item) {
                var value = $item.attr('data-value');
                if (value) {
                    value = value.replace(/&#39;/g, "'");
                    this.$element.val(value);
                    if (this.opts.selectioncallback) {
                        if (typeof this.opts.selectioncallback == 'function') {
                            this.opts.selectioncallback($item);
                        } else if (typeof this.opts.selectioncallback == 'string') {
                            window[this.opts.selectioncallback]($item);
                        }
                    }
                }
                this.close();
                this.$element.focus();
            }
        },

        focus: function (evt) {},

        keyDown: function (evt) {
            var keyCode;

            if (!evt) evt = window.event;

            keyCode = evt.keyCode;

            switch (keyCode) {
                case 27: // Escape
                    this.close();
                    evt.stopPropagation();
                    break;

                case 9: // Tab
                case 13: // Enter
                    if (this.$ta.find('.highlight').length) {
                        evt.stopPropagation();
                        if (keyCode === 13) {
                            evt.preventDefault();
                        }
                        this.selectHighlighted();
                    }
                    break;

                case 39: // Right
                    if (this.$ta.find('.highlight').length) {
                        this.ignoreNext = true;
                        evt.stopPropagation();
                        this.selectHighlighted();
                    }
                    break;
            }
        },

        keyPress: function (evt) {
            if (!evt) {
                evt = window.event;
            }
            if (evt.keyCode == 13 /* Enter/Return */) {
                this.close();
            }
        },

        keyUp: function (evt) {
            // prevents a key up after an item has been selected by the key board
            if (this.ignoreNext) {
                this.ignoreNext = false;
                return;
            }
            if (!evt) evt = window.event;
            switch (evt.keyCode) {
                case 27: // Escape
                    break;

                case 37: // Left
                    this.removeHighlights();
                    break;

                case 38: // Up
                    this.prev();
                    break;

                case 40: // Down
                    this.next();
                    break;

                case 16: // Shift
                case 17: // Ctrl
                case 18: // Alt
                    break;
                case 13: // Enter/Return
                    this.shouldBeOpen = false;
                    break;

                default:
                    this.shouldBeOpen = true;
                    this.startRequest();
                    break;
            }
        },

        blur: function () {
            // need a delay so we can cancel if the ta is being clicked on
            if (!this.isClickOn) {
                this.close();
            } else {
                this.$ta.bind('mousedown', $.proxy(this.cancelEvent, this));
                $(document.body).bind('mousedown', $.proxy(this.close, this));
                this.bodyClick = true;
            }
        },

        clickOn: function () {
            this.isClickOn = true;
        },

        clickOff: function () {
            this.isClickOn = false;
        },

        click: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.selectHighlighted(e);
        },

        mouseEnter: function (e) {
            this.removeHighlights();
            $(e.currentTarget).addClass('highlight');
        },

        cancelEvent: function (evt) {
            evt.cancelBubble = true;
            if (evt.stopPropagation) evt.stopPropagation();
            if (evt.preventDefault) evt.preventDefault();
            evt.cancel = true;
            evt.returnValue = false;
        },

        remove: function () // TODO - is this method necessary?
        {
            this.$element.autocomplete = 'on';
            this.$element.closest('form').attr('autocomplete', 'on');

            this.$element
                .off('focus', $.proxy(this.focus, this))
                .off('keydown', $.proxy(this.keyDown, this))
                .off('keyup', $.proxy(this.keyUp, this))
                .off('keypress', $.proxy(this.keyPress, this))
                .off('blur', $.proxy(this.blur, this));
            this.$ta
                .off('mousedown', $.proxy(this.mouseDown, this))
                .off('mouseup', $.proxy(this.mouseUp, this))
                .off('click', $.proxy(this.click, this))
                .off('mouseenter', 'a', $.proxy(this.mouseEnter, this))
                .remove();
        }

    };

    //
    // Constants:
    //
    Typeahead.AIRPORT = 1;
    Typeahead.CITY = 2;
    Typeahead.MULTICITY = 4;
    Typeahead.NEIGHBORHOOD = 8;
    Typeahead.POI = 16;
    Typeahead.ADDRESS = 32;
    Typeahead.METROCODE = 64;
    Typeahead.HOTEL = 128;

    Typeahead.REGIONTYPE = {
        'ALL': 31,
        'AIRPORT': 1,
        'CITIES': 2
    };

    Typeahead.LOB = {
        'HOTELS': 'HOTELS',
        'PACKAGES': 'PACKAGES',
        'FLIGHTS': 'FLIGHTS'
    };

    Typeahead.CATEGORIES = {
        'CITY': {
            'id': 0,
            name: 'Region/City',
            icon: 'location'
        },
        'ATTRACTION': {
            'id': 1,
            name: 'Attractions',
            icon: 'location'
        },
        'AIRPORT': {
            'id': 2,
            name: 'Airports',
            icon: 'flights'
        },
        'HOTEL': {
            'id': 3,
            name: 'Hotels',
            icon: 'hotels'
        },
        'ADDRESS': {
            'id': 4,
            name: 'Address',
            icon: 'location'
        },
        'TRAINSTATION': {
            'id': 5,
            name: 'Train Station',
            icon: 'train'
        },
        'METROSTATION': {
            'id': 6,
            name: 'Metro Station',
            icon: 'train'
        }
    };

    // FROM https://gist.github.com/3902173
    //
    // HELPER: #each_with_key
    //
    // Usage: {{#each_with_key container key="myKey"}}...{{/each_with_key}}
    //
    // Iterate over an object containing other objects. Each
    // inner object will be used in turn, with an added key ("myKey")
    // set to the value of the inner object's key in the container.
    Handlebars.registerHelper("each_with_key", function (obj, options) {
        var context,
            buffer = "",
            key,
            keyName = options.hash.key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                context = obj[key];

                if (keyName) {
                    context[keyName] = key;
                }
                buffer += options.fn(context);
            }
        }

        return buffer;
    });

    Typeahead.defaultOptions = {
        // "Options" - to be moved into this.opts, which is a merge from Typeahead.default
        // The options are overwriten with html attributes and need to be all lower case
        minchar: 3,
        maxitems: 10,
        version: 'v2',
        locale: 'en_US',
        abtest: '',
        mask: (Typeahead.AIRPORT | Typeahead.CITY | Typeahead.MULTICITY | Typeahead.NEIGHBORHOOD | Typeahead.POI),
        lob: Typeahead.LOB.FLIGHTS,
        dest: false,
        closetext: 'Close',
        continuetext: 'Continue typing to refine search',
        selectioncallback: null, // called when an item is selected with mouse or keyboard, with one argument that is the selected <a>.
        tooltip: true,
        forceicon: false
    };

    //
    // Instantiate:
    //

    function initTA($el) {
        if ($el.data('typeahead')) return;
        var templateRef = $el.data('template');
        if (templateRef == undefined) return;
        if (templateRef.indexOf('/') >= 0) {
            $.ajax({
                url: templateRef,
                success: function (data) {
                    var ops = $el.data();
                    ops.rawHtml = true;
                    new Typeahead($el, data, ops);
                },
                dataType: "text"
            });
        } else {
            new Typeahead($el, templateRef, $el.data());
        }
    }

    $(function () { // TODO: change this to $(document.body).on(...)
        // Listen for focuses on typeahead elements
        $('body').on('focus.typeahead', '[data-provide="typeahead"]', function (e) {
            e.preventDefault();
            var $el = $(this);
            initTA($el);
        });
        initTA($($('[data-provide="typeahead"]')[0]));
    });

}(window.jQuery);