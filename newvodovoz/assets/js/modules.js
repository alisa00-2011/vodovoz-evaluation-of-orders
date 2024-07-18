var siteModules = (function(window, undefined) {

    function accordions(options) {

        options.selector = !!options.selector ? options.selector : '.js-accordion';
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        // Init
        init(options);

        $(window)
            .off('resize.accordionsRefresh')
            .on('resize.accordionsRefresh', function() {

                helpers.delay.call($('body'), init(options), 250, 'accordions-');

            });

        function init(options) {

            var $accordion = $(options.namespace + options.selector);

            $accordion.each(function() {

                var $accordion = $(this),
                    screens = !!$accordion.data('resolutions') ? $accordion.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],
                    selector = $accordion.data('actionOnLink') ? 'li > a, li > span' : 'li > a > .js-accordion-trigger, li > span';

                $accordion.data('screens', screens);

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $accordion.find('li > ul, li > div').slideUp({ duration: 0 });
                    $accordion.find('.opened').find('> ul, > div').slideDown({ duration: 0 });

                }
                else {

                    $accordion.find('li > ul, li > div').show();

                }

                $accordion
                    .find(selector)
                    .each(function() {

                        var childLevel = !!$(this).closest('li').find('> ul, > div').length;

                        $(this)
                            .closest('li')
                            .toggleClass('hasChild', childLevel);

                        if (screens.indexOf(helpers.screen()) >= 0) {

                            $(this)
                                .off('click.accordionClick')
                                .on('click.accordionClick', function(e) {

                                    //if (childLevel) {
                                    if ($(this).closest('li').hasClass('hasChild')) {

                                        e.preventDefault();

                                        // Close neighbors items
                                        if (!!$accordion.data('neighbors')) {

                                            var $siblings = $(this).closest('li').siblings();

                                            $siblings.toggleClass('opened', false);

                                            $siblings
                                                .find('> ul, > div')
                                                .slideUp({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('floatedPanels.refresh'); } });

                                        }

                                        // Open current item
                                        var $current = $(this).closest('li');

                                        $current.toggleClass('opened');

                                        $current
                                            .find('> ul, > div')
                                            .slideToggle({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('floatedPanels.refresh'); } });

                                    }

                                    $(this).closest('ul').toggleClass('faded', $accordion.find('> .hasChild.opened').length);

                                });

                        } else {

                            $(this).closest('li').find('> ul, > div').css('display', '');

                        }

                    });

                $accordion
                    .off('accordion.close')
                    .on('accordion.close', function() {

                        if ($accordion.data('screens').indexOf(helpers.screen()) >= 0) {

                            $(this).find('li').each(function() {

                                $(this).toggleClass('opened', false);

                                $(this)
                                    .find('> ul, > div')
                                    .slideUp({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('floatedPanels.refresh'); } });

                            });

                        }

                    });

                $accordion
                    .off('accordion.open')
                    .on('accordion.open', function() {

                        if ($accordion.data('screens').indexOf(helpers.screen()) >= 0) {

                            $(this).find('li').each(function() {

                                $(this).toggleClass('opened', true);

                                $(this)
                                    .find('> ul, > div')
                                    .slideDown({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('floatedPanels.refresh'); } });

                            });

                        }

                    });

            });

        }

    }

    function autoComplete(namespace) {

        namespace = !!namespace ? namespace + ' ' : '';

        var $fields = $(namespace + '.js-autoComplete');

        $fields.each(function() {

            var $this = $(this).attr('autocomplete', 'off'),
                $wrapper = $this.parent(),

                $wg = $('<div class="b-autoComplete"></div>').appendTo($wrapper),
                $wgInner = $('<div class="b-autoComplete_inner js-scrollBar"></div>').prependTo($wg),

                navIndex = -1;

            $this.closest('form').on('keypress.enterKey', function(e) {

                if (e.keyCode === 13 && $wg.find('li.focus').length) {

                    e.preventDefault();
                    window.location = $wg.find('li.focus .b-autoComplete_good, li.focus .b-autoComplete_footer_btn').attr('href');

                }

            });

            $this.on('keyup.autoComplete get.autoComplete', function(e) {

                var value = $(this).val(),

                    upArrow = e.keyCode === 38,
                    downArrow = e.keyCode === 40,

                    enterKey = e.keyCode === 13;

                if (value.length > 1 && !(upArrow || downArrow || enterKey)) {

                    $wrapper.toggleClass('request', true);

                    $.ajax({
                        url: $this.data('source') || $this.closest('form').attr('action'),
                        method: $this.closest('form').attr('method') || 'post',
                        data: $this.closest('form').serialize() + '&trigger=' + $this.attr('name'),
                        dataType: 'json',
                        success: function (response) {

                            $wrapper.toggleClass('request', false);

                            if (response.status) {

                                $wg.find('> *:not(.b-autoComplete_inner)').remove();

                                if (!!response.footer) {

                                    $wg.append(response.footer);

                                }

                                $wgInner.html(response.results);
                                //sitePlugins.scrollBars({ namespace: '.b-autoComplete' });

                                $wg.toggleClass('opened', true);
                                $wrapper.toggleClass('autoCompleteOpened', true);

                                $(document)
                                    .off('touchend.closeAutoComplete click.closeAutoComplete')
                                    .on(helpers.isTouchDevice() ? 'touchend.closeAutoComplete' : 'click.closeAutoComplete', function(e) {

                                        var $target = $(e.target),

                                            wgClass = 'b-autoComplete',//$wrapper.attr('class').split(' ')[0],
                                            targetIsWg = $target.hasClass(wgClass) || !!$target.closest('.' + wgClass).length;

                                        if (!targetIsWg) {

                                            $wg.toggleClass('opened', false);
                                            $wrapper.toggleClass('autoCompleteOpened', false);

                                            setTimeout(function() {

                                                $wgInner.empty();

                                            }, 350);

                                        }

                                    });

                            }

                        }
                    });

                }

                // Arrow nav
                if ($wg.hasClass('opened') && (upArrow || downArrow)) {

                    var $items = $wg.find('li'/*'.b-autoComplete_good, .b-autoComplete_footer_btn'*/);

                    navIndex += upArrow ? -1 : downArrow ? 1 : 0;
                    navIndex = navIndex < 0 ? $items.length - 1 : navIndex + 1 > $items.length ? 0 : navIndex;

                    $items.removeClass('focus');
                    $items.eq(navIndex).addClass('focus');

                }

            });

            $wrapper.on('click.autoComplete', '.b-autoComplete_list li', function(e) {

                if (!$(this).find('a').length) {

                    e.preventDefault();

                    if (!!$this.closest('form').data('setAutoCompleteParams')) {

                        $.each($(this).data(), function(key, value) {

                            if ($this.parent().find('input[type="hidden"][name="' + key + '"]').length) {

                                $this.parent().find('input[type="hidden"][name="' + key + '"]').val(value);

                            }
                            else {

                                $this.parent().prepend('<input type="hidden" name="' + key + '" value="' + value + '" />')

                            }

                        });

                    }

                    $this.val($(this).text()).trigger('change');
                    $wg.toggleClass('opened', false);

                    setTimeout(function() {

                        $wgInner.empty();

                    }, 400);

                }

            });

        });

    }

    function dropDown(options) {

        var $locker = !!options.locker ? options.locker : $('.b-page');

        options.switch = !!options.switch ? options.switch : 'opened';
        options.lock = !!options.lock ? options.lock : false;

        $(document)
            .off('click.dropDown' + options.selector)
            .on('click.dropDown' + options.selector, function(e) {

                var $target = $(e.target),

                    targetIsSwitcher = $target.hasClass(options.selector + '-toggle') || !!$target.closest('.' + options.selector + '-toggle').length,
                    isSwipeAction = helpers.touches.touchmove.y > -1 && (Math.abs(helpers.touches.touchstart.y - helpers.touches.touchmove.y) > 5);

                if (targetIsSwitcher) {

                    $target = $target.hasClass(options.selector + '-toggle') ? $target : $target.closest('.' + options.selector + '-toggle');

                    if ($target.is('a')) { e.preventDefault(); }

                    var screens = !!$target.data('resolutions') ? $target.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],
                        touchOnly = !!$target.data('touch') ? $target.data('touch') : false;

                    if (screens.indexOf(helpers.screen()) >= 0 && touchOnly ? !!helpers.mobile() : true) {

                        e.preventDefault();

                        var $dropDown = $target.closest('.' + options.selector),
                            state = $dropDown.hasClass(options.switch);

                        $('.' + options.selector).toggleClass(options.switch, false);

                        $dropDown.toggleClass(options.switch, !state);
                        $dropDown.find('.' + options.selector + '-box').toggleClass(options.switch, !state);

                        if (!!options.onToggle) {

                            options.onToggle.call($dropDown, !state);

                        }

                        if ((options.lock || !!$dropDown.data('lock'))) {

                            if (!state) {

                                _lockPage.call($locker);

                            } else {

                                _unLockPage.call($locker);

                            }

                        }

                        setTimeout(function() {

                            $(window).trigger('floatedPanels.stepRefresh');

                        }, 300);

                    }

                }
                else if (!isSwipeAction && (!$target.closest('.' + options.selector + '-box').length || ($target.hasClass(options.selector + '-close') || $target.closest('.' + options.selector + '-close').length) )) {

                    $('.' + options.selector).each(function() {

                        var $this = $(this),

                            state = $this.hasClass(options.switch),
                            screens = !!$(this).find(options.selector + '-toggle').data('resolutions') ? $(this).find(options.selector + '-toggle').data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                        if (screens.indexOf(helpers.screen()) >= 0) {

                            $this.toggleClass(options.switch, false);

                            if ((options.lock || !!$this.data('lock')) && state) {

                                _unLockPage.call($locker);

                            }

                            if (!!options.onToggle) {

                                options.onToggle.call($this, false);

                            }

                            $(this).trigger('dropDown.closing');

                            setTimeout(function() {

                                $(window).trigger('floatedPanels.stepRefresh');

                            }, 300);

                        }

                    });

                }

                helpers.touches = {
                    touchstart: {x: -1, y: -1 },
                    touchmove: { x: -1, y: -1 }
                };

            });

        $('.' + options.selector)
            .off('dropDown.open')
            .on('dropDown.open', function() {

                $(this).toggleClass(options.switch, true);

                if ((options.lock || !!$(this).data('lock'))) {

                    _lockPage.call($locker);

                }

            })
            .off('dropDown.close')
            .on('dropDown.close', function() {

                $(this).toggleClass(options.switch, false);
                _unLockPage.call($locker);

            });

        var $body = $('body'),
            $header = $('.b-header__sticky, .b-header__sticky .b-header_drop_nav');

        function _lockPage() {

            if (!this.data('isLocked')) {

                var scroll = document.documentElement.scrollTop || document.body.scrollTop;

                this.data('isLocked', true);
                this.data('vpOverflow', $body.css('overflow'));
                this.data('lockScrollState', scroll);

                $body.css({
                    overflow: 'hidden'
                });

                if (document.body.scrollHeight > window.innerHeight) {

                    $body.css({
                        paddingRight: helpers.getScrollBarWidth()
                    });

                    $header.css({
                        paddingRight: helpers.getScrollBarWidth()
                    });

                }

                if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {

                    $body.css({
                        position: 'fixed',
                        left: 0,
                        top: -($body.scrollTop()),
                        right: 0
                    });

                }

            }

        }

        function _unLockPage() {

            setTimeout($.proxy(function() {

                if (!!this.data('isLocked')) {

                    $body.css({
                        position: '',
                        left: '',
                        top: '',
                        right: '',
                        overflow: '',
                        paddingRight: '',
                        height: ''
                    });

                    $body.css({ paddingRight: ''});
                    $header.css({ paddingRight: ''});

                    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {

                        $body.scrollTop(this.data('lockScrollState'));

                    }

                }

                this.data('isLocked', false);

            }, this), 300);

        }

    }

    function tabs(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        var widget = options.selector,
            toggle = options.selector + '-toggle',
            toggleItem = options.selector + '-btn',
            content = options.selector + '-wrapper',
            page = options.selector + '-page';

        init(options);

        $(window)
            .off('resize.tabsRefresh')
            .on('resize.tabsRefresh', function() {

                init(options);

            });

        function init(options) {

            $(options.namespace + options.selector).each(function() {

                var $wg = $(this),
                    $wrapper = $(this).find(content),

                    screens = !!$(this).data('resolutions') ? $(this).data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    // Init tabs
                    $(this).toggleClass('js-init', true);

                    setTimeout(function() {

                        $(this).toggleClass('js-transition', true);

                    }, 500);

                    if (!$(this).find(toggle + ' a.current').length)
                        $(this).find(toggle + ' a:first').addClass('current');

                    if (!$(this).find(toggleItem + '.current').length)
                        $(this).find(toggleItem + ':first').addClass('current');

                    var hash = $(this).find(toggle + ' a.current, ' + toggleItem + '.current').data('href') || $(this).find(toggle + ' a.current, ' + toggle + ' ' + toggleItem + '.current').attr('href'),
                        height = $(page + hash).outerHeight(true);

                    $(this)
                        .find(page)
                        .toggleClass('opened', false);

                    if (!$wg.data('noInitialTab')) {

                        $(this)
                            .find(page + hash)
                            .toggleClass('opened', true);

                    }

                    // Listening events
                    $wg
                        .off('click.switchTabs change.changeTabs mouseover.hoverTabs')
                        .on(!$wg.data('hoverTabs') || helpers.isTouchDevice() ? 'click.switchTabs change.changeTabs' : 'mouseover.hoverTabs', (!!$wg.data('strongByLevel') ? ' > ' : '') + options.selector + '-toggle a[href*="#"], ' + toggleItem, function(e) {

                            if (!$wg.data('hoverTabs') && $(this).is('a[href*="#"]')) {

                                e.preventDefault();

                            }
                            else if (!!$wg.data('hoverTabs') && helpers.isTouchDevice()) {

                                if (!$(this).data('alreadyClicked') && !$(this).data('noChild')) {

                                    e.preventDefault();

                                    $wg.find(options.selector + '-toggle a, ' + toggleItem).data('alreadyClicked', false);
                                    $(this).data('alreadyClicked', true);

                                }

                            }

                            $wrapper.css({ height: $(page + hash).outerHeight(true) });

                            hash = $(this).data('href') || $(this).attr('href');
                            height = $(page + hash).outerHeight(true);

                            // Off tabs
                            $(this)
                                .closest(toggle)
                                .find('a, ' + toggleItem)
                                .toggleClass('current', false);

                            $(this)
                                .closest(widget)
                                .find($wg.data('strongByLevel') ? '> ' + content + ' > ' + page : page)
                                .toggleClass('opened', false);

                            // On select tab
                            $(this)
                                .toggleClass('current', true);

                            $(this)
                                .closest(widget)
                                .find(page + hash)
                                .toggleClass('opened', true);

                            // Correct wrapper
                            $wrapper.stop(true).animate({ height: height }, $wrapper.hasClass('js-transition') ? 500 : 0, 'easeOutQuart', function() {

                                $(this).css({ height: '' });

                            });

                            // Callback fire
                            if (typeof options.onToggle !== 'undefined' && options.onToggle) {

                                options.onToggle.call($wg, $(this), $(this).closest(options.selector).find(options.selector + '-page' + ($(this).data('href') || $(this).attr('href'))));

                            }

                            // Refresh floated
                            if (!$wg.data('hoverTabs') && $(this).is('a[href*="#"]')) {

                                $(window).trigger('floatedPanels.refresh');

                            }

                            // Xhr
                            var xhrUrl = $(this).data('xhrUrl'),
                                xhrParams = $(this).data('xhrParams');

                            if (!!xhrUrl && !!xhrParams) {

                                $.ajax({
                                    url: xhrUrl || window.location,
                                    method: $(this).data('method') || 'post',
                                    dataType: 'json',
                                    data: $.extend({}, xhrParams),
                                    success: function(response) {}
                                });

                            }

                        });

                    // Set hash
                    if (window.location.hash !== '#' && window.location.hash.length > 1) {

                        var $target = $(this).find(toggle + ' [href="' + window.location.hash + '"], ' + toggle + ' [data-hash="' + window.location.hash + '"]');
                            $target.trigger('click.switchTabs');

                        $('html, body').animate({ scrollTop: $('[href="' + window.location.hash + '"]').closest('.js-tabs').offset().top - (['xs', 'sm'].breakPoint() ? $('.b-header').outerHeight() + 20 : 20) }, 400);

                    }

                } else {

                    $(this)
                        .toggleClass('js-init', false);

                    $(this)
                        .find(toggle + ' a')
                        .toggleClass('current', false);

                    $(this)
                        .find(content)
                        .css({ height: '' });

                }

            });

        }

    }

    function hashNav() {

        var $body = $('body'), timer = false;

        $body
            .off('click.hashNav')
            .on('click.hashNav', '[data-hash], a[href^="#"]:not([href="#"], [class*="js-tabs-toggle"] a, .js-popup)', function(e) {

                if (!$(this).data('delay') || ['md', 'lg', 'xl'].indexOf(helpers.screen()) >= 0) {

                    _goTo.call(this, e);

                }
                else {

                    if (typeof timer !== 'boolean') {

                        clearTimeout(timer);

                    }

                    timer = setTimeout($.proxy(function() {

                        _goTo.call(this, e);

                    }, this), $(this).data('delay') || 0);

                }

            });

        function _goTo(e) {

            $body.toggleClass('scrollingTo', true);

            var url = $(this).attr('href') || $(this).data('hash'),
                $element = !!$(url).length ? $(url) : $('[name="' + (url.substring(1)) + '"]'),

                threshold = ($(this).data('offset') || 20) + (['xs', 'sm'].breakPoint() ? $('.b-header').outerHeight() : 20);

            if (url.length > 1 && $element.length) {

                e.preventDefault();

                var destination = $element.offset().top - threshold;

                if ($element.css('transform') !== 'none') {

                    destination -= $element.css('transform').split(/[()]/)[1].split(',')[5];

                }

                $('html, body').animate({ scrollTop: destination }, 800, 'easeOutQuart', $.proxy(function() {

                    $body.toggleClass('scrollingTo', false);

                }, this));

            }

            if ($element.is('.js-tabs-page')) {

                $element.closest('.js-tabs').find('[href="' + url + '"]').trigger('click.switchTabs');

            }

        }

    }

    function imagesOnRetinaDisplays(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '.b-page ';

        if ('devicePixelRatio' in window && window.devicePixelRatio > 1) {

            var $images = $(options.namespace + '.js-retina');

            $images.each(function() {

                var lowRes = $(this).attr('src'),
                    highRes = $(this).data('2x');

                $(this)
                    .off('error.retinaFallback')
                    .on('error.retinaFallback', function() {

                        $(this).attr('src', lowRes);

                    })
                    .attr('src', highRes);

            });

            // Cookie
            document.cookie = 'devicePixelRatio=' + window.devicePixelRatio + ';';

        }

    }

    function loadingOnRequire(options) {

        /**
         *
         * @param {String} [options.btn] - Class of the button
         * @param {Function} [options.onComplete] - Callback function
         */

        // Loading on require
        $('body').on('click.loadingOnRequire', options.btn, function(e) {

            e.preventDefault();

            var $link = $(this).toggleClass('request', true),
                $target = $($link.data('loadingTarget')),

                qs = $link.attr('href').split('?'),
                qsObj = {};

            if (typeof qs[1] !== 'undefined') {

                qsObj = qs[1].split("&").reduce(function(prev, curr, i, arr) {

                    var p = curr.split("=");
                    prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);

                    return prev;

                }, {});

            }

            $link.data('page', $link.data('page') || 2);

            _loadContent.call($target,
                {
                    url: $link.attr('href').split('?')[0],
                    method: $link.data('method') || 'get',
                    data: $.extend({}, { page: $link.data('page') }, qsObj),
                    onComplete: options.onComplete,
                    beforeShow: options.beforeShow,
                    wrapping: $(this).data('wrapping')
                },
                function(response) {

                    setTimeout(function() {

                        $link.toggleClass('request', false);

                    }, 300);

                    $link.toggleClass('fade', response.last);
                    $link.closest('.js-loading-on-require-wrap').toggleClass('fade', response.last);

                    $link
                        .attr('href', response.nextUrl || $link.attr('href'))
                        .data('page', $link.data('page') + 1);

                    if (!!response.btnText) {

                        $link.text(response.btnText);

                    }

                    if (!!response.info) {

                        $($link.data('loadingTarget') + '-info').text(response.info);

                    }

                }
            );

        });

        function _loadContent(options, callback) {

            var $target = this,
                $wrapper = $('<div class="js-loading-wrapper"></div>');

            $.ajax($.extend({}, {
                dataType: 'json',
                success: function(response) {

                    if (!!options.wrapping) {

                        $wrapper.append(response.html);
                        $wrapper.css({ opacity: 0, transition: 'opacity 400ms' });

                        $target.append($wrapper);
                        $wrapper.slideUp(0);

                        if ('IntersectionObserver' in window) {

                            lazyLoadImages = document.querySelectorAll('.lazy');

                            lazyLoadImages.forEach(function(image) {

                                imageObserver.observe(image);

                            });

                        }

                        setTimeout(function() {

                            if (!!options.beforeShow) {

                                options.beforeShow.call($wrapper, response);

                            }

                            $wrapper
                                .slideDown({ duration: 400, easing: 'easeOutQuart',
                                    step: function() {

                                        //$(window).trigger('floatedPanels.stepRefresh');

                                    },
                                    complete: function() {

                                        if (!!options.onComplete) {

                                            options.onComplete.call($wrapper, response);

                                        }

                                        $wrapper.find('> *').unwrap();

                                        $(window).trigger('resize');
                                        $(window).trigger('floatedPanels.refresh');

                                    }
                                })
                                .css({ overflow: 'hidden', opacity: 1 });

                        }, 1);

                    } else {

                        var $items = $(response.html);

                        $items = $items.add($target.find('> div:last-child').filter(function() { return $(this).is(':hidden'); }));
                        $items.css({ opacity: 0, transition: 'opacity 400ms' });

                        $target.append($items);
                        $items.slideUp(0);

                        if ('IntersectionObserver' in window) {

                            lazyLoadImages = document.querySelectorAll('.lazy');

                            lazyLoadImages.forEach(function(image) {

                                imageObserver.observe(image);

                            });

                        }

                        if (!!options.beforeShow) {

                            options.beforeShow.call($target, response);

                        }

                        $items
                            .slideDown({ duration: 400, easing: 'easeOutQuart',
                                step: function() {

                                    //$(window).trigger('floatedPanels.stepRefresh');

                                },
                                complete: function() {

                                    if (!!options.onComplete) {

                                        options.onComplete.call($(this), response);

                                    }

                                    $(window).trigger('resize');
                                    $(window).trigger('floatedPanels.refresh');

                                }
                            })
                            .css({ opacity: '' });

                    }

                    if (!!callback) {

                        callback(response);

                    }

                }
            }, options));

        }

    }

    function spoilers(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        options.toggleClass = !!options.toggleClass ? options.toggleClass : 'opened';

        // Hash check
        var hash = location.hash;

        if (!!hash && hash.match('spoiler')) {

            $(options.selector).each(function() {

                $(this).removeClass('opened');

                if ($(this).attr('id') === hash.split('#')[1]) {

                    $(this).addClass('opened');

                }

            });

        }

        // Init
        init(options);

        $(window)
            .off('resize.spoilerRefresh')
            .on('resize.spoilerRefresh', function() {

                init(options);

            });

        function init(options) {

            $(options.namespace + options.selector).each(function() {

                var $spoiler = $(this).toggleClass('js-spoiler-active', true),

                    $body = $spoiler.find(options.selector + '-box').css({ display: '' }),
                    $toggle = $spoiler.find(options.selector + '-toggle').off('click.spoiler'),

                    screens = !!$spoiler.data('resolutions') ? $spoiler.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $spoiler.not('.' + options.toggleClass).find(options.selector + '-box').slideDown(0).slideUp(0);
                    $spoiler.filter('.' + options.toggleClass).find(options.selector + '-box').slideDown(0);

                    $toggle
                        .off('click.spoiler')
                        .on('click.spoiler', function(e) {

                            if (!$(e.target).is('a[href]:not(a[href="#"])')) {

                                e.preventDefault();

                            }

                            if (!$(e.target).hasClass('e-hint') && !$(e.target).closest('.e-hint').length) {

                                var item = $(this).closest(options.selector),
                                    state = item.hasClass(options.toggleClass) && item.find(/*'> ' + */options.selector + '-box').is(':visible');

                                if (!state) {

                                    spoilerOpen.call(item, options.selector, options.onToggle, options.beforeToggle, item.data('correctPosition'));

                                } else {

                                    spoilerClose.call(item, options.selector, options.onToggle, options.beforeToggle);

                                }

                                // Close neighbors items
                                if (!!item.data('closeNeighbors')) {

                                    var $neighbors = typeof item.data('closeNeighbors') === 'boolean' ? item.siblings(options.selector) : item.closest(item.data('closeNeighbors')).find(options.selector).not($spoiler);

                                    if (!item.data('closeNeighborsPreventPositioning') && ['xs', 'sm'].breakPoint()) {

                                        var $prev = item.prevAll(options.selector + '.opened');

                                        $prev = $prev.length ? $prev : item.parent()/*item.closest('.js-tabs-wrapper')*/;

                                        $('html, body').animate({ scrollTop: $prev.offset().top - 60 }, 250);

                                    }

                                    $neighbors.each(function() {
                                        spoilerClose.call($(this), options.selector);
                                    });

                                }

                            }

                        });

                } else {

                    $spoiler.find(options.selector + '-box').show();

                }

            });

        }

        function spoilerClose(sel, callback, callbackBefore) {

            var $spoiler = this,

                $spoilerToggle = this.find(sel + '-toggle'),
                $spoilerContent = this.find(sel + '-box').filter(function() {

                    return $(this).closest('.js-spoiler, .js-spoilerRoute, .js-spoilerPoint')[0] === $spoiler[0];

                });

            $spoiler.toggleClass(options.toggleClass, false);

            $spoilerToggle = $spoilerToggle.find('[data-closed][data-opened]').length ? $spoilerToggle.find('[data-closed][data-opened]') : $spoilerToggle ;

            var toggle = !!$spoilerToggle.data('closed') ? $spoilerToggle.data('closed') : $spoilerToggle.html();

            if (!!$spoilerToggle.data('closed')) {

                $spoilerToggle.html(toggle);

            }

            $spoilerToggle.toggleClass('active', false);

            if (typeof callbackBefore !== 'undefined' && callbackBefore) {

                callbackBefore($spoilerContent);

            }

            $spoilerContent
                .slideUp({ duration: 250,
                    step: function() {

                        $(window).trigger('floatedPanels.stepRefresh');

                    },
                    complete: function() {

                        $(window).trigger('floatedPanels.refresh');

                        if(typeof callback !== 'undefined' && callback) {

                            callback(this);

                        }

                    }
                });

        }

        function spoilerOpen(sel, callback, callbackBefore, correctPosition) {

            var $spoiler = this,

                $spoilerToggle = this.find(sel + '-toggle'),
                $spoilerContent = this.find(sel + '-box').filter(function() {

                    return $(this).closest('.js-spoiler, .js-spoilerRoute, .js-spoilerPoint')[0] === $spoiler[0];

                });

            $spoiler.toggleClass(options.toggleClass, true);

            $spoilerToggle = $spoilerToggle.find('[data-closed][data-opened]').length ? $spoilerToggle.find('[data-closed][data-opened]') : $spoilerToggle ;

            var toggle = !!$spoilerToggle.data('opened') ? $spoilerToggle.data('opened') : $spoilerToggle.html();

            if (!!$spoilerToggle.data('opened')) {

                $spoilerToggle.html(toggle);

            }

            $spoilerToggle.toggleClass('active', true);

            if (typeof callbackBefore !== 'undefined' && callbackBefore) {

                callbackBefore($spoilerContent);

            }

            $spoilerContent
                .slideDown({ duration: 250,
                    step: function() {

                        $(window).trigger('floatedPanels.stepRefresh');

                    },
                    complete: function() {

                        if (correctPosition) {

                            var $el = $spoiler;

                            $el = $el.prev().length ? $el.prev() : $el.parent();

                            var offset = $el.offset().top,
                                scroll = document.documentElement.scrollTop || document.body.scrollTop;

                            if (offset < scroll - 30) {

                                $('html, body').animate({ scrollTop: offset - 30 }, 250);

                            }

                        }

                        $(window).trigger('floatedPanels.refresh');
                        $(window).trigger('resize');

                        if (typeof callback !== 'undefined' && callback) {

                            callback(this);

                        }

                    }
                });

        }

    }

    function pockets(options) {

        // Init
        init(options);

        $(window)
            .off('load.pocketRefresh resize.pocketRefresh')
            .on('load.pocketRefresh resize.pocketRefresh', function() {

                helpers.delay.call($('body'), function() {

                    init(options);

                }, 250, 'pocket-');

            });

        function init(options) {

            $(options.selector).each(function() {

                var $pocket = $(this),

                    $pocketBody = $pocket.find(options.selector + '-box'),
                    $pocketBodyInner = $pocket.find(options.selector + '-box-inner').css({ overflow: 'hidden' }),
                    $pocketToggle = $pocket.find(options.selector + '-toggle').off('click.pocketModule'),

                    screens = !!$pocket.data('resolutions') ? $pocket.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],

                    heights = !!$pocket.data('heights') ? $pocket.data('heights').split(',') : false,
                    blocks = !!$pocket.data('blocks') ? $pocket.data('blocks').split(',') : false,

                    lines = !!$pocket.data('lines') ? $pocket.data('lines').split(',') : [2, 3, 4, 6, 6];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $pocketBody.css({ overflow: 'hidden' });

                    var maxHeight = $pocketBodyInner.length ? $pocketBodyInner.outerHeight() : $pocketBody.outerHeight();

                    $pocket.data('range', { min: 0, max: maxHeight });

                    if (!!heights) {

                        $pocket.data('range', {
                            min: parseInt(heights[screens.indexOf(helpers.screen())], 10),
                            max: maxHeight
                        });

                    }
                    else if (!!blocks) {

                        var minHeight = 0,
                            margin = 0,

                            length = blocks[screens.indexOf(helpers.screen())];

                        $pocketBodyInner.find(!!$pocket.data('blocksTarget') ? $pocket.data('blocksTarget') + ' > *' : '> *').each(function(i) {

                            if (i < length) {

                                minHeight += $(this).outerHeight();

                                if (i > 0) {

                                    minHeight += Math.max(margin, parseInt($(this).css('margin-top'), 10));

                                }

                                margin = parseInt($(this).css('margin-bottom'), 10);

                            }
                            else {

                                return false;

                            }

                        });

                        $pocket.data('range', {
                            min: minHeight,
                            max: maxHeight
                        });

                    }
                    else if (!!lines) {

                        $pocket.data('range', {
                            min: _getLineHeight.call($pocketBody) * lines[screens.indexOf(helpers.screen())] - 2,
                            max: maxHeight
                        });

                    }

                    if (!$pocket.data('noAnimation')) {

                        $pocketBody
                            .css(helpers.pfx + 'transition', 'max-height ' + options.duration + 'ms')
                            .css('transition', 'max-height ' + options.duration + 'ms');

                    }

                    setTimeout(function() {

                        if (typeof $pocket.data('range') !== 'undefined') {

                            $pocket.not('.opened').find(options.selector + '-box').css({ maxHeight: $pocket.data('range').min });

                        }

                        if ($.isFunction($.fn.owlCarousel)) {

                            $pocketBody.closest('.owl-carousel').trigger('refresh.owl.carousel');

                        }

                    }, 10);

                    $pocketToggle
                        .parent()
                        .toggleClass('excess', $pocket.data('range').max <= $pocket.data('range').min);

                    $pocketToggle
                        .off('click.pocketModule')
                        .on('click.pocketModule', function(e) {

                            e.preventDefault();

                            var $this = $(this).closest(options.selector),
                                state = $this.hasClass('opened');

                            _pocketToggle.call($this, options, !state);

                            // Close neighbors items
                            if (!!$this.data('closeNeighbors')) {

                                var $neighbors = typeof $this.data('closeNeighbors') === 'boolean' ? $this.siblings(options.selector) : $this.closest($this.data('closeNeighbors')).find(options.selector).not($(this));

                                $neighbors.each(function() {

                                    _pocketToggle.call($(this), options, false);

                                });

                            }

                        });

                    setTimeout(function() {

                        $pocket.toggleClass('active', true);

                    }, 100);

                } else {

                    $pocket.toggleClass('active', false);

                    $pocketBody.css({ maxHeight: '', overflow: 'visible' });
                    $pocketBodyInner.css({ overflow: '' });

                }

            });

        }

        function _getLineHeight() {

            var lineHeight = this.css('line-height') !== 'normal' ? parseFloat(this.css('line-height')) : 1.14,
                fontSize = Math.ceil(parseFloat(this.css('font-size')));

            lineHeight = typeof lineHeight !== 'undefined' && lineHeight < fontSize ? lineHeight * fontSize : lineHeight;

            return parseInt(typeof lineHeight !== 'undefined' ? lineHeight : fontSize, 10);

        }

        function _pocketToggle(options, state) {

            if (typeof options.onToggle !== 'undefined' && options.onToggle) {

                options.onToggle.call(this, state);

            }

            var $pocket = this,

                $pocketBody = $pocket.find(options.selector + '-box'),
                $pocketBodyInner = $pocket.find(options.selector + '-box-inner'),
                $pocketToggle = $pocket.find(options.selector + '-toggle'),

                stringFlag = state ? 'opened' : 'closed',
                height = state ? $pocketBodyInner.length ? $pocketBodyInner.outerHeight() : $pocket.data('range').max : $pocket.data('range').min;

            $pocketBody.css({ maxHeight: !state ? $pocketBodyInner.length ? $pocketBodyInner.outerHeight() : $pocket.data('range').max : $pocket.data('range').min });

            $pocketToggle = $pocketToggle.find('[data-opened][data-closed]').length ? $pocketToggle.find('[data-opened][data-closed]') : $pocketToggle;

            setTimeout($.proxy(function() {

                $pocket.toggleClass('opened', state);

                $pocketBody.css({ maxHeight: height });
                $pocketToggle.html(!!$pocketToggle.data(stringFlag) ? $pocketToggle.data(stringFlag) : $pocketToggle.html());

                if (!!$pocket.data('noAnimation')) {

                    $pocketBody.css({ overflow: state ? '' : 'hidden' });
                    $pocketBodyInner.css({ overflow: state ? '' : 'hidden' });

                }

                // Refresh carousel height
                var $parentCarousel = $pocket.closest('.owl-carousel');

                if ($parentCarousel.length) {

                    var carouselData = $parentCarousel.data('owl.carousel');

                    if (!!carouselData.options.responsive[carouselData._breakpoint].autoHeight) {

                        $parentCarousel.trigger('refresh.owl.carousel');

                    }

                }

                setTimeout($.proxy(function() {

                    if (state) $pocketBody.css({ maxHeight: '' });

                    if (typeof options.onToggled !== 'undefined' && options.onToggled) {

                        options.onToggled.call(this, state);

                    }

                }, this), options.duration);

            }, this), 10);

        }

    }

    function floatedPanels(options) {

        options = !!options ? options : {};
        options.selector = !!options.selector ? options.selector : '.js-float-panel';

        var $collection = $(options.selector),
            $header = $('.b-header');

        if ( $collection.length /*&& !helpers.isTouchDevice()*/ ) {

            $collection.each(function() {

                var $sidebar = $(this).parent(),
                    $sidebarBox = $(this),

                    offset = typeof $sidebarBox.data('offset') !== 'undefined' ? $sidebarBox.data('offset') : 20,
                    threshold = (['xs', 'sm'].breakPoint() ? $header.outerHeight() : $('.b-header__sticky').length ? $(window).width() >= 1024 ? 90 : 68 : 0) + offset || offset,

                    telemetry = {};

                // Set data
                $sidebar
                    .css({ minHeight: '' })
                    .css({ minHeight: ($(options.selector + '-column').outerHeight() + ($(options.selector + '-column-additional').length ? $(options.selector + '-column-additional').outerHeight() : 0)) - parseInt($sidebar.css('margin-bottom'), 10) - ($sidebar.prev().length ? $sidebar.prev().outerHeight(true) + parseInt($sidebar.css('margin-top'), 10) : 0) });

                $sidebarBox
                    .css({ width: $sidebar.width() });

                telemetry = {
                    height: $sidebarBox.outerHeight(),
                    offsetTop: $sidebar.offset().top - threshold,
                    bottomExtremePoint: $sidebar.offset().top + $sidebar.outerHeight()
                };

                _sideBarTracker();

                // Refresh data (load.sideBarsRefresh - excluded)
                $(window)
                    .off('load.sideBarsRefresh resize.sideBarsRefresh floatedPanels.refresh')
                    .on('load.sideBarsRefresh resize.sideBarsRefresh floatedPanels.refresh', function() {

                        threshold = (['xs', 'sm'].breakPoint() ? $header.outerHeight() : $('.b-header__sticky').length ? $(window).width() >= 1024 ? 90 : 68 : 0) + offset || offset;

                        $sidebar.css({ minHeight: '' });
                        $sidebarBox.css({ width: $sidebar.width() });

                        helpers.delay.call($sidebarBox, $.proxy(function() {

                            $sidebar.css({ minHeight: ($(options.selector + '-column').outerHeight() + ($(options.selector + '-column-additional').length ? $(options.selector + '-column-additional').outerHeight() : 0)) - parseInt($sidebar.css('margin-bottom'), 10) - ($sidebar.prev().length ? $sidebar.prev().outerHeight(true) + parseInt($sidebar.css('margin-top'), 10) : 0) });
                            $sidebarBox.css({ width: $sidebar.width() });

                            telemetry = {
                                height: $sidebarBox.outerHeight(),
                                offsetTop: $sidebar.offset().top - threshold,
                                bottomExtremePoint: $sidebar.offset().top + $sidebar.outerHeight()
                            };

                        }, this), 150);

                        _sideBarTracker();

                    });

                $(window)
                    .off('floatedPanels.stepRefresh')
                    .on('floatedPanels.stepRefresh', function() {

                        threshold = (['xs', 'sm'].breakPoint() ? $header.outerHeight() : $('.b-header__sticky').length ? $(window).width() >= 1024 ? 90 : 68 : 0) + offset || offset;

                        $sidebar.css({ minHeight: '' });
                        $sidebar.css({ minHeight: ($(options.selector + '-column').outerHeight() + ($(options.selector + '-column-additional').length ? $(options.selector + '-column-additional').outerHeight() : 0)) - parseInt($sidebar.css('margin-bottom'), 10) - ($sidebar.prev().length ? $sidebar.prev().outerHeight(true) + parseInt($sidebar.css('margin-top'), 10) : 0) });

                        telemetry = {
                            height: $sidebarBox.outerHeight(),
                            offsetTop: $sidebar.offset().top - threshold,
                            bottomExtremePoint: $sidebar.offset().top + $sidebar.outerHeight()
                        };

                        _sideBarTracker();

                    });

                // Scroll tracker
                $(window)
                    .off('scroll.sidebarTracker')
                    .on('scroll.sidebarTracker', _sideBarTracker);

                $(window)
                    .off('load.sidebarTracker')
                    .on('load.sidebarTracker', function() {

                        helpers.delay.call($sidebar, $.proxy(function() {

                            _sideBarTracker();

                        }, this), 150);

                    });

                setTimeout(function () {

                    $(window).trigger('floatedPanels.refresh');

                }, 600);

                // Processing
                function _sideBarTracker(e, data) {

                    var scrollState = document.documentElement.scrollTop || document.body.scrollTop,
                        sidebarData = data || telemetry;

                    $sidebarBox.removeClass('m-top m-bottom m-float');

                    if ($sidebarBox.data('bp') === 'lg' ? $(window).width() >= 1024 : ($sidebarBox.data('bp').split(',') || ['lg']).indexOf(helpers.screen()) >= 0) {

                        if ($sidebarBox.height() < $sidebar.height()/* && !helpers.isTouchDevice()*/) {

                            $sidebarBox.toggleClass('m-top', sidebarData.offsetTop > scrollState);
                            $sidebarBox.toggleClass('m-bottom', sidebarData.bottomExtremePoint <= scrollState + sidebarData.height + threshold);
                            $sidebarBox.toggleClass('m-fixed', scrollState >= sidebarData.offsetTop && (scrollState + sidebarData.height + threshold) < sidebarData.bottomExtremePoint);

                        }

                    }

                }

            });

        }

    }

    return {
        accordions: accordions,
        autoComplete: autoComplete,
        dropDown: dropDown,
        floatedPanels: floatedPanels,
        pockets: pockets,
        spoilers: spoilers,
        tabs: tabs,
        hashNav: hashNav,
        imagesOnRetinaDisplays: imagesOnRetinaDisplays,
        loadingOnRequire: loadingOnRequire
    };

})(window);