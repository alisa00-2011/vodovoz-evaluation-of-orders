var sitePlugins = (function(window, undefined) {

    'use strict';

    function carousels(init) {

        init.selector = !!init.selector ? init.selector : '.b-carousel';
        init.namespace = !!init.namespace ? init.namespace + ' ' : '';

        init.options = !!init.options ? init.options : {};

        var $collection = $(init.namespace + init.selector);

        _init.call($collection);

        $(window)
            .off('resize.owlCarouselRefresh')
            .on('resize.owlCarouselRefresh', function() {

                helpers.delay.call($(window), function() {

                    _init.call($collection);

                }, 250, 'owl-');

            });

        function _init() {

            if ($.isFunction($.fn.owlCarousel)) {

                this.each(function() {

                    var $carousel = $(this),
                        screens = !!$carousel.data('resolutions') ? $carousel.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],

                        detached = null;

                    var minAmount = !!$carousel.data('loop') ? $carousel.find('.b-carousel_item').length - 1 : $carousel.find('.b-carousel_item').length - 1;

                    if (screens.indexOf(helpers.screen()) >= 0 && minAmount >= $carousel.data()[helpers.screen()]) {

                        $carousel
                            .closest('.b-carousel_wrap')
                            .toggleClass('owl-carousel-wrap', true);

                        if (!$carousel.hasClass('owl-carousel')) {

                            $carousel
                                .toggleClass('owl-carousel', true)
                                .owlCarousel($.extend({

                                    items: 1,
                                    margin: typeof $carousel.data('margin') === 'number' ? $carousel.data('margin') : 20,

                                    animateOut: $carousel.data('animateOut') || false,
                                    animateIn: $carousel.data('animateIn') || false,

                                    autoplay: $carousel.data('auto') || false,
                                    autoplayTimeout: $carousel.data('interval') * 1000 || 10000,

                                    autoHeight: typeof $carousel.data('autoHeight') !== 'object' ? $carousel.data('autoHeight') || false : false,
                                    autoWidth: $carousel.data('autoWidth') || false,

                                    loop: typeof $carousel.data('loop') !== 'undefined' ? $carousel.data('loop') : true,
                                    lazyLoad: !!$carousel.data('lazyLoad'),

                                    mouseDrag: !!$carousel.data('mouseDrag') || false,
                                    touchDrag: typeof $carousel.data('touchDrag') !== 'undefined' ? !!$carousel.data('touchDrag') : true,
                                    pullDrag: false,
                                    freeDrag: false,

                                    dots: $carousel.data('dots') || false,
                                    dotsEach: typeof $carousel.data('dotsEach') !== 'undefined' ? !! $carousel.data('dotsEach') : true,

                                    //dotsSpeed: typeof $carousel.data('dotsEach') !== 'undefined' ? 250 : 125,

                                    dotClass: 'b-carousel_paging_bullet',
                                    dotsClass: 'b-carousel_paging',

                                    dotsContainer: $carousel.data('dotsContainer') || false,

                                    nav: $carousel.data('nav') || false,
                                    navText: $carousel.data('navText') || ['<svg width="14" height="84" aria-hidden="true"><use xlink:href="#arrow-prev"></use></svg>', '<svg width="14" height="84" aria-hidden="true"><use xlink:href="#arrow-next"></use></svg>'],
                                    navClass: $carousel.data('navClass') || ['b-carousel_arrow b-carousel_arrow__prev', 'b-carousel_arrow b-carousel_arrow__next'],

                                    navContainer: $carousel.data('navContainer') || false,

                                    smartSpeed: $carousel.data('smartSpeed') || 250,

                                    scrollBar: $carousel.data('scrollBar') || false,
                                    scrollBarContainer: $carousel.data('scrollBarContainer') || false,

                                    scrollBarClass: 'b-carousel_scroll_bar',
                                    scrollBarHandleClass: 'b-carousel_scroll_bar_handle',

                                    startPosition: typeof $carousel.data('startPosition') !== 'undefined' ? $carousel.data('startPosition') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPosition') : 0,

                                    useCSS: !!$carousel.data('useCss'),
                                    fallbackEasing: 'easeOutCubic',

                                    responsive: {
                                        0: {
                                            items: $carousel.data('xs'),
                                            margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[0] : $carousel.data('margin'),
                                            mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[0] : false,
                                            nav: _navShouldBe.call($carousel, $carousel.data('xs')),
                                            dots: _dotsShouldBe.call($carousel, $carousel.data('xs')),
                                            dotsEach: typeof $carousel.data('dotsEach') !== 'undefined' ? !! $carousel.data('dotsEach') : false,
                                            loop: _loopControl.call($carousel, $carousel.data('xs')),
                                            startPosition: typeof $carousel.data('startPositionXs') !== 'undefined' ? $carousel.data('startPositionXs') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionXs') : 0
                                        },
                                        480: {
                                            items: $carousel.data('sm'),
                                            margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[1] : $carousel.data('margin'),
                                            mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[1] : false,
                                            nav: _navShouldBe.call($carousel, $carousel.data('sm')),
                                            dots: _dotsShouldBe.call($carousel, $carousel.data('sm')),
                                            dotsEach: typeof $carousel.data('dotsEach') !== 'undefined' ? !! $carousel.data('dotsEach') : false,
                                            loop: _loopControl.call($carousel, $carousel.data('sm')),
                                            startPosition: typeof $carousel.data('startPositionSm') !== 'undefined' ? $carousel.data('startPositionSm') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionSm') : 0
                                        },
                                        768: {
                                            items: $carousel.data('md'),
                                            margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[2] : $carousel.data('margin'),
                                            mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[2] : false,
                                            nav: _navShouldBe.call($carousel, $carousel.data('md')),
                                            dots: _dotsShouldBe.call($carousel, $carousel.data('md')),
                                            loop: _loopControl.call($carousel, $carousel.data('md')),
                                            startPosition: typeof $carousel.data('startPositionMd') !== 'undefined' ? $carousel.data('startPositionMd') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionMd') : 0
                                        },
                                        1024: {
                                            items: $carousel.data('mdLg') || $carousel.data('lg'),
                                            margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[2] : $carousel.data('margin'),
                                            mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[2] : false,
                                            nav: _navShouldBe.call($carousel, $carousel.data('mdLg') || $carousel.data('lg')),
                                            dots: _dotsShouldBe.call($carousel, $carousel.data('mdLg') || $carousel.data('lg')),
                                            loop: _loopControl.call($carousel, $carousel.data('mdLg') || $carousel.data('lg')),
                                            startPosition: typeof $carousel.data('startPositionLg') !== 'undefined' ? $carousel.data('startPositionLg') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionLg') : 0
                                        },
                                        1200: {
                                            items: $carousel.data('lg'),
                                            margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[3] : $carousel.data('margin'),
                                            mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[3] : false,
                                            nav: _navShouldBe.call($carousel, $carousel.data('lg')),
                                            dots: _dotsShouldBe.call($carousel, $carousel.data('lg')),
                                            loop: _loopControl.call($carousel, $carousel.data('lg')),
                                            startPosition: typeof $carousel.data('startPositionLg') !== 'undefined' ? $carousel.data('startPositionLg') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionLg') : 0
                                        }
                                    },
                                    onInitialized: function() {

                                        this._direction = null;
                                        _itemsCounter.call(this);

                                        if ('IntersectionObserver' in window) {

                                            lazyLoadClonedImages = document.querySelectorAll('.cloned .lazy');

                                            lazyLoadClonedImages.forEach(function(image) {

                                                imageObserver.observe(image);

                                            });

                                        }

                                    },
                                    onResized: function() {

                                        _itemsCounter.call(this);

                                    },
                                    onChanged: function() {

                                        _itemsCounter.call(this);

                                    },
                                    onChange: function(e) {

                                        // Get direction
                                        if (e.property.name === 'position') {

                                            this._direction = e.property.value > e.item.index ? 'next' : 'prev';

                                        }

                                    }
                                }, init.options));

                            if (typeof $carousel.data('sync') !== 'undefined') {

                                var selector = $carousel.data('sync'),

                                    $items = $(selector),
                                    $syncedCarousel = $items.closest('.b-carousel'),

                                    syncInProcess = false;

                                $(selector).first().addClass('active');

                                $('body').on('click.owlCarouselThumbs', selector, function(e, disable) {

                                    e.preventDefault();

                                    var prevIndex = $syncedCarousel.find('.owl-item.active').find(selector + '.active').closest('.owl-item').index();

                                    $(selector).removeClass('active');
                                    $(selector + '[data-index="' + $(this).data('index') + '"]').addClass('active');

                                    syncInProcess = true;
                                    $carousel.trigger('to.owl.carousel', [$(this).data('index'), $carousel.data('smartSpeed') || 250], true);

                                    if (typeof $carousel.data('timerSyncInProcess') !== 'undefined') {

                                        clearTimeout($carousel.data('timerSyncInProcess'));

                                    }

                                    $carousel.data('timerSyncInProcess', setTimeout($.proxy(function() {

                                        syncInProcess = false;

                                    }, this), 400));

                                });

                            }

                        }

                    } else {

                        $carousel
                            .closest('.b-carousel_wrap')
                            .toggleClass('owl-carousel-wrap', false);

                        if (!!$carousel.data('owlCarousel') || !!$carousel.data('owl.carousel')) {

                            $carousel.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
                            $carousel.find('.owl-stage-outer').children().unwrap();

                        }

                    }

                });

            } // isFunction end

        }  // end of init scope

        function _navShouldBe(limit) {

            var navOption = typeof this.data('nav') === 'undefined' ? true : !!this.data('nav'),
                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return navOption && itemsEnough;

        }

        function _dotsShouldBe(limit) {

            var dotsOption = !!this.data('dots'),
                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return dotsOption && itemsEnough;

        }

        function _loopControl(limit) {

            var loopOption = typeof this.data('loop') === 'undefined' ? true : !!this.data('loop'),
                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return loopOption && itemsEnough/*(loopControlOption ? itemsEnough : true)*/;

        }

        function _itemsCounter() {

            if (this.$element.hasClass('b-carousel__counter')) {

                var amount = this.$element.find('.b-carousel_paging').find('.b-carousel_paging_bullet').length,
                    current = this.$element.find('.b-carousel_paging').find('.b-carousel_paging_bullet.active').index() + 1;

                this.$element.attr('data-counter', current + '/' + amount);
                $(this.$element.data('counter')).html('<span>' + current + '</span>/' + amount).removeClass('hidden');

            }

        }

    }

    function popUps() {

        var $page = $('.b-page'),

            $popUps = $('.js-popup'),

            $lightBoxes = $('.js-lightBox'),
            $videoBoxes = $('.js-videoBox'),

            settings = {
                animationStyleOfBox: 'scale',
                animationStyleOfChange: 'slide',

                boxHorizontalGutters: 10,
                boxVerticalGutters: 40,

                closeBtnLocation: 'box',
                directionBtnLocation: 'box',

                overlayOpacity: .5,
                scrollLocker: $page
            };

        if ($.isFunction($.fn.leafLetPopUp)) {

            $popUps.leafLetPopUp($.extend({}, settings, {
                closeBtnLocation: 'box',
                selector: '.js-popup',
                boxWidth: function() {

                    return this.data('boxWidth') || 600

                },
                beforeLoad: function(scroll, leaflet) {

                    var $leaflet = $('.b-leaflet');

                    $leaflet.data('triggerElement', leaflet.elements.link);

                    if (leaflet.elements.link.data('leafletMod')) {

                        $('body').addClass(leaflet.elements.link.data('leafletMod'));
                        $leaflet.addClass(leaflet.elements.link.data('leafletMod'));

                    }

                },
                beforeClose: function(leaflet) {

                    if (leaflet.elements.link.data('leafletMod')) {

                        $('body').removeClass(leaflet.elements.link.data('leafletMod'));

                    }

                },
                afterLoad: function() {

                    // Forms
                    forms.init('.b-leaflet');

                    // Captcha
                    // forms.reCaptcha('.b-leaflet .js-reCaptcha');

                }
            }));

            $lightBoxes.leafLetPopUp($.extend({}, settings, {
                animationStyleOfBox: 'scale',
                boxWidth: 1200,
                boxHorizontalGutters: 30,
                boxVerticalGutters: 30,
                contentType: 'image',
                closeBtnLocation: 'overlay',
                directionBtnLocation: 'overlay',
                overlayOpacity: .5,
                selector: '.js-lightBox',
                maxHeight: function() {

                    return $(window).height() - (parseInt($('.b-leaflet_inner').css('paddingTop'), 10) * 2);

                }
            }));

            $videoBoxes.leafLetPopUp($.extend({}, settings, {
                animationStyleOfBox: 'scale',
                boxWidth: 1000,
                content: true,
                contentType: 'iframe',
                closeBtnLocation: 'overlay',
                directionBtnLocation: 'overlay',
                overlayOpacity: .5,
                selector: '.js-videoBox'
            }));

            $('body')
                .off('click.closeLeafletPopups')
                .on('click.closeLeafletPopups', '.js-popup-close', function(e) {

                    e.preventDefault();

                    $('body').removeClass('b-leaflet_mobileForm');
                    $popUps.leafLetPopUp('hide');

                });

        }

    }

    return {
        carousels: carousels,
        popUps: popUps
    };

})(window);