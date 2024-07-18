var siteResponsive = (function(window, undefined) {

    function init(namespace) {

        // For Retina displays
        siteModules.imagesOnRetinaDisplays();

        // Tables
        swipedTables({
            collection: '.b-wysiwyg table:not(.b-table_collapsed), .b-daico_section_table',
            namespace: namespace
        });

        // Set screen class
        var $body = $('body')
            .addClass('m-' + helpers.screen())
            .addClass('m-' + (!!helpers.isTouchDevice() ? 'touch' : 'mouse'))
            .addClass(navigator.platform.match(/(Mac)/i) ? 'm-mac' : 'm-win');

        $(window)
            .off('resize.screenClasses')
            .on('resize.screenClasses', function() {

                $body
                    .removeClass('m-xs m-sm m-md m-lg')
                    .addClass('m-' + helpers.screen());

            });

    }

    function swipedTables(options) {

        _processing();

        $(window)
            .off('load.swipedTables resize.swipedTables')
            .on('load.swipedTables resize.swipedTables', _processing);

        function _processing() {

            var $collection = $(options.collection);

            $collection.each(function() {

                if (!$(this).closest('.b-table_overflow').length) {

                    $(this).wrap('<div class="b-table_overflow"></div>');
                    $(this).closest('.b-table_overflow').wrap('<div class="b-table_overflow_wrap"></div>');

                    $(this).closest('.b-table_overflow_wrap').append('<div class="b-table_overflow_bar"><div class="b-table_overflow_bar_handle"></div></div>');

                }

                var $container = $(this).closest('.b-table_overflow'),

                    tableWidth = $(this).width(),
                    containerWidth = $container.width(),

                    scrollable = tableWidth > containerWidth && ($(this).data('resolutions') ? $(this).data('resolutions').split(',').indexOf(helpers.screen()) >= 0 : true);

                $(this).closest('.b-table_overflow').toggleClass('scrollable', scrollable);

                $(this).closest('.b-table_overflow_wrap').toggleClass('scrollable', scrollable);
                $(this).closest('.b-table_overflow_wrap').toggleClass('fade-right', scrollable);

                _scrollIndicatorSize.call($(this));

                $(this)
                    .closest('.b-table_overflow')
                    .off('scroll.tableOnScroll')
                    .on('scroll.tableOnScroll', _scrollIndicator);

            });

        }

        function _scrollIndicatorSize() {

            var $overflow = this.closest('.b-table_overflow'),
                $bar = $overflow.next('.b-table_overflow_bar');

            $bar.find('.b-table_overflow_bar_handle').width( $bar.width() * (this.closest('.b-table_overflow').width() / this.width()) );

        }

        function _scrollIndicator() {

            var $this = $(this),
                $bar = $this.next('.b-table_overflow_bar');

            $bar.find('.b-table_overflow_bar_handle').css({ left: $(this).scrollLeft() * $bar.width() / $this.find('> *').width() });

            $this.closest('.b-table_overflow_wrap').toggleClass('fade-left', $this.scrollLeft() > 0);
            $this.closest('.b-table_overflow_wrap').toggleClass('fade-right', $this.scrollLeft() + $this.outerWidth() < $this.find('> *').outerWidth());

        }

    }

    return {
        init: init
    };

})(window);