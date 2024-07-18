$(document).ready(function() {

    // Init responsive helpers
    siteResponsive.init('.b-page');

    // Init forms handlers
    forms.init('.b-page');

    // User interface
    site.init();

    // Init plugins
    sitePlugins.popUps();

    sitePlugins.carousels({
        selector: '.b-carousel'
    });

    // Init UI modules
    siteModules.hashNav();
    siteModules.autoComplete();

    siteModules.accordions({
        selector: '.js-accordion'
    });

    siteModules.dropDown({
        selector: 'js-dropDown'
    });

    siteModules.tabs({
        selector: '.js-tabs',
        onToggle: function($btn, $page) {

            if (this.hasClass('b-checkout') && this.find('.b-form').length) {

                $page.find('[data-required]').each(function() {

                    $(this)
                        .attr('data-required', true)
                        .data('required', true);

                });

                $page.siblings('.js-tabs-page').each(function() {

                    $(this).find('[data-required]').each(function() {

                        $(this)
                            .attr('data-required', false)
                            .data('required', false);

                        $(this).closest('.m-error').removeClass('m-error');

                    });

                });

            }

        }
    });

    siteModules.spoilers({
        selector: '.js-spoiler',
        beforeToggle: function(box) {}
    });

    siteModules.pockets({
        selector: '.js-pocket',
        duration: 400
    });

    siteModules.loadingOnRequire({
        btn: '.js-loading-on-require',
        beforeShow: function() {

            $(window).trigger('floatedPanels.stepRefresh');

        }
    });

    // Shop modules
    shopModules.init();

});

// UI
var site = (function(window, undefined) {

    'use strict';

    var $body = $('body');

    function onDomReady() {

        /*
        siteModules.floatedPanels({
            selector: '.js-float-panel'
        });*/

    }

    function onLoadPage() {

        $(window).on('load.pageReady', function() {

            // DOM is loaded
            $('html').addClass('domIsReady');

            // Vertical alignment
            setTimeout(function() {

                $(window).trigger('refresh.flexRows');

            }, 300);

        });

    }

    function targetBlank() {

        $body
            .on('click.targetBlank', '[href][data-target="_blank"]', function() {

                return !window.open($(this).attr('href'));

            });

    }

    function header() {

        var $header = $('.b-header');

        // Menu drop
        siteModules.dropDown({
            selector: 'js-headerMenu',
            switch: 'showMenu',
            lock: true,
            onToggle: function(flag) {}
        });

        // Search
        siteModules.dropDown({
            selector: 'js-headerSearch',
            switch: 'showSearch',
            onToggle: function(flag) {

                if (this.hasClass('showSearch')) {

                    setTimeout(function() {

                        $('.b-header_top_search_form_field input[type="text"]')[0].focus();

                    }, 200);

                }

            }
        });

        // On scroll
        _headerScroll();
        $(window).on('scroll.headerScroll', _headerScroll);

        function _headerScroll() {

            $header.toggleClass('fixed', $header.hasClass('b-header__sticky') && (document.documentElement.scrollTop || document.body.scrollTop) > $('.b-header_top').outerHeight());

        }

    }

    function pageUp() {

        var $footer = $('.b-footer'),
            $pageUp = $('<button class="e-pageUp" type="button"><svg width="22" height="36" aria-hidden="true"><use xlink:href="#page-up"></use></svg></button>').appendTo($footer.find('> .container'));

        $pageUp.on('click.pageUp', function(e) {

            e.preventDefault();
            $('html, body').animate({ scrollTop: 0 }, 800, 'easeOutQuart');

        });

        _processing();

        $(window).on('resize.pageUp', function() {

            helpers.delay.call($pageUp, _processing, 100);

        });

        $(window).on('scroll.pageUp pageUp.Refresh', _processing);

        function _processing() {

            var scroll = document.documentElement.scrollTop || document.body.scrollTop,

                windowHeight = $(window).height(),
                screenBottom = scroll + windowHeight;

            $pageUp.toggleClass('show', screenBottom > windowHeight * 1.25);
            $pageUp.toggleClass('fixed', screenBottom >= $footer.offset().top + (['md', 'lg'].breakPoint() ? 84 : 54));

        }

    }

    function verticalAlignment() {

        $('.b-catalog_feed')
            .flexRows({
                auto: true,
                strong: false,
                selector: '.b-good_title'
            })
            .flexRows({
                auto: true,
                strong: false,
                selector: '.b-good_info'
            })
            .flexRows({
                auto: true,
                strong: false,
                selector: '.b-good_props'
            })
            .flexRows({
                auto: true,
                strong: true,
                selector: '.b-good_purchase'
            });

    }

    return {
        init: function() {

            // Valid target attribute
            targetBlank();

            // Header
            header();

            // Page up
            pageUp();

            // Vertical alignment
            verticalAlignment();

        },
        onDomReady: onDomReady,
        onLoadPage: onLoadPage
    };

})(window);

// On load page function
site.onLoadPage();
