;(function($) {
  'use strict';

  var pluginName = 'selectric',
      classList = 'Input Items Open Disabled TempShow HideSelect Wrapper Hover Responsive Above Scroll Group GroupLabel',
      bindSufix = '.sl',
      defaults = {
        onChange: function(elm) { $(elm).trigger('change')/*$(elm).change()*/; },
        maxHeight: 400,
        keySearchTimeout: 500,
        arrowButtonMarkup: '<b class="button">&#x25be;</b>',
        disableOnMobile: true,
        openOnHover: false,
        hoverIntentTimeout: 500,
        expandToItemText: false,
        responsive: false,
        preventWindowScroll: true,
        inheritOriginalWidth: false,
        allowWrap: true,
        customClass: {
            placeholder: 'placeholder',
            prefix: pluginName,
            camelCase: false,
            overwrite: true
        },
        optionsItemBuilder: '{text}', // function(itemData, element, index)
        labelBuilder: '{text}' // function(currItem)
      },
      hooks = {
        add: function(callbackName, hookName, fn) {
          if ( !this[callbackName] )
            this[callbackName] = {};

          this[callbackName][hookName] = fn;
        },
        remove: function(callbackName, hookName) {
          delete this[callbackName][hookName];
        }
      },
      _utils = {
        // Replace diacritics
        replaceDiacritics: function(s) {
          // /[\340-\346]/g, // a
          // /[\350-\353]/g, // e
          // /[\354-\357]/g, // i
          // /[\362-\370]/g, // o
          // /[\371-\374]/g, // u
          // /[\361]/g,      // n
          // /[\347]/g,      // c
          // /[\377]/g       // y
          var d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' '),
              k = d.length;

          while (k--)
            s = s.toLowerCase().replace(RegExp('[' + d[k] + ']', 'g'), 'aeiouncy'.charAt(k));

          return s;
        },
        // https://gist.github.com/atesgoral/984375
        format: function(f) {var a=arguments;return(""+f).replace(/{(\d+|(\w+))}/g,function(s,i,p) {return p&&a[1]?a[1][p]:a[i]})},
        nextEnabledItem: function(selectItems, selected) {
          while ( selectItems[ selected = (selected + 1) % selectItems.length ].disabled ) {}
          return selected;
        },
        previousEnabledItem: function(selectItems, selected) {
          while ( selectItems[ selected = (selected > 0 ? selected : selectItems.length) - 1 ].disabled ) {}
          return selected;
        },
        toDash: function(str) {
          return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        },
        triggerCallback: function(fn, scope) {
          var elm = scope.element,
              func = scope.options['on' + fn];

          if ( $.isFunction(func) )
            func.call(elm, elm, scope);

          if ( hooks[fn] ) {
            $.each(hooks[fn], function() {
              this.call(elm, elm, scope);
            });
          }

          $(elm).trigger(pluginName + '-' + _utils.toDash(fn), scope);
        }
      },
      $doc = $(document),
      $win = $(window),
      Selectric = function(element, opts) {
        var _this = this,
            $original = $(element),
            $input, $items, $itemsScroll, $wrapper, $label, $outerWrapper, $li,
            isOpen = false,
            isEnabled = false,
            selected,
            currValue,
            itemsHeight,
            itemsInnerHeight,
            finalWidth,
            optionsLength,
            eventTriggers,
            isMobile = /android|ip(hone|od|ad)/i.test(navigator.userAgent),
            tabindex = $original.prop('tabindex'),
            labelBuilder;

        function _init(opts) {
          _this.options = $.extend(true, {}, defaults, _this.options, opts);
          _this.classes = {};
          _this.element = element;

          _utils.triggerCallback('BeforeInit', _this);

          // Disable on mobile browsers
          if ( _this.options.disableOnMobile && isMobile ) {
            _this.disableOnMobile = true;
            return;
          }

          // Preserve data
          _destroy(true);

          // Generate classNames for elements
          var customClass   = _this.options.customClass,
              postfixes     = classList.split(' '),
              originalWidth = $original.width();

          $.each(postfixes, function(i, currClass) {
            var c = customClass.prefix + '-' + currClass;
            _this.classes[currClass.toLowerCase()] = customClass.camelCase ? c : _utils.toDash(c);
          });

          $input        = $('<input/>', { 'class': _this.classes.input, 'readonly': isMobile });
          $items        = $('<div/>',   { 'class': _this.classes.items, 'tabindex': -1 });
          $itemsScroll  = $('<div/>',   { 'class': _this.classes.scroll });
          $wrapper      = $('<div/>',   { 'class': customClass.prefix, 'html': _this.options.arrowButtonMarkup });
          $label        = $('<div class="label"/>');
          $outerWrapper = $original.wrap('<div>').parent().append($wrapper.prepend($label), $items/*, $input*/);

          eventTriggers = {
            open    : _open,
            close   : _close,
            destroy : _destroy,
            refresh : _refresh,
            init    : _init
          };

          $original.on(eventTriggers).wrap('<div class="' + _this.classes.hideselect + '">');
          $.extend(_this, eventTriggers);

          labelBuilder = _this.options.labelBuilder;

          if ( _this.options.inheritOriginalWidth && originalWidth > 0 )
            $outerWrapper.width(originalWidth);

          _populate();
        }

        // Generate options markup and event binds
        function _populate() {
          _this.items = [];

          var $options = $original.children(),
              _$li = '<div class="' + pluginName + '-list">',
              $justOptions = $original.find('option'),
              selectedIndex = $justOptions.index($justOptions.filter(':selected')),
              currIndex = 0;

          currValue = (selected = ~selectedIndex ? selectedIndex : 0);

          if ( optionsLength = $options.length ) {
            // Build options markup
            $options.each(function() {
              var $elm = $(this);

              if ( $elm.is('optgroup') ) {
                var groupDisabled = $elm.prop('disabled'),
                    $children = $elm.children();

                _$li += _utils.format('<div class="{1}"><li class="{2}">{3}</li>',
                  $.trim([_this.classes.group, groupDisabled ? 'disabled' : '', $elm.prop('class')].join(' ')),
                  _this.classes.grouplabel,
                  $elm.prop('label')
                );

                if ( groupDisabled ) {
                  $children.prop('disabled', true);
                }

                $children.each(buildOption);

                _$li += '</div>';
              } else {
                buildOption.call($elm);
              }

              function buildOption() {
                var $elm = $(this),
                    optionText = $elm.html(),
                    selectDisabled = $elm.prop('disabled'),
                    itemBuilder = _this.options.optionsItemBuilder;

                _this.items[currIndex] = {
                  element  : $elm,
                  value    : $elm.val(),
                  text     : optionText,
                  slug     : _utils.replaceDiacritics(optionText),
                  disabled : selectDisabled
                };

                _$li += _utils.format('<li class="' + pluginName + '-list-option' + (!$elm.val() || $elm.val() === '' || typeof $elm.val() === 'undefined' || !!$elm.data('placeholder') ? ' placeholder ' : ' ') + '{2}" data-index="{1}">{3}</li>',
                  currIndex,
                  $.trim([currIndex == currValue ? 'selected' : '', currIndex == optionsLength - 1 ? 'last' : '', selectDisabled ? 'disabled' : ''].join(' ')),
                  $.isFunction(itemBuilder) ? itemBuilder(_this.items[currIndex], $elm, currIndex) : _utils.format(itemBuilder, _this.items[currIndex])
                );

                currIndex++;
              }
            });

            $items.append( $itemsScroll.html(_$li + '</div>') );

            $label.html(
              $.isFunction(labelBuilder) ? labelBuilder(_this.items[currValue]) : _utils.format(labelBuilder, _this.items[currValue])
            )
          }

          $wrapper.add($original).add($outerWrapper).add($input).off(bindSufix);

          $outerWrapper.prop('class', [
            _this.classes.wrapper,
            _this.options.customClass.overwrite ?
              $original.prop('class').replace(/\S+/g, _this.options.customClass.prefix + '-$&') :
              $original.prop('class'),
            _this.options.responsive ? _this.classes.responsive : ''
          ].join(' '));

          if ( !$original.prop('disabled') ) {
            isEnabled = true;

            // Not disabled, so... Removing disabled class and bind hover
            $outerWrapper.removeClass(_this.classes.disabled).on('mouseenter' + bindSufix + ' mouseleave' + bindSufix, function(e) {
              $(this).toggleClass(_this.classes.hover);

              // Delay close effect when openOnHover is true
              if ( _this.options.openOnHover ) {
                clearTimeout(_this.closeTimer);
                e.type == 'mouseleave' ? _this.closeTimer = setTimeout(_close, _this.options.hoverIntentTimeout) : _open();
              }
            });

            // Toggle open/close
            $wrapper.on('click' + bindSufix, function(e) {
              isOpen ? _close() : _open(e);
            });

            $input
              .prop({
                tabindex: tabindex,
                disabled: false
              })
              .on('keypress' + bindSufix, _handleSystemKeys)
              .on('keydown' + bindSufix, function(e) {
                _handleSystemKeys(e);

                // Clear search
                clearTimeout(_this.resetStr);
                _this.resetStr = setTimeout(function() {
                  $input.val('');
                }, _this.options.keySearchTimeout);

                var key = e.keyCode || e.which;

                // If it's a directional key
                // 37 => Left
                // 38 => Up
                // 39 => Right
                // 40 => Down
                if ( key > 36 && key < 41 ) {
                  if ( !_this.options.allowWrap ) {
                    if ( (key < 39 && selected == 0) || (key > 38 && (selected + 1) == _this.items.length) ) {
                      return;
                    }
                  }

                  _select(_utils[(key < 39 ? 'previous' : 'next') + 'EnabledItem'](_this.items, selected));
                }
              })
              .on('focusin' + bindSufix, function(e) {
                // Stupid, but necessary... Prevent the flicker when
                // focusing out and back again in the browser window
                $input.one('blur', function() {
                  $input.blur();
                });

                isOpen || _open(e);
              })
              .on('oninput' in $input[0] ? 'input' : 'keyup', function() {
                if ( $input.val().length ) {
                  // Search in select options
                  $.each(_this.items, function(i, elm) {
                    if ( RegExp('^' + $input.val(), 'i').test(elm.slug) && !elm.disabled ) {
                      _select(i);
                      return false;
                    }
                  });
                }
              });

            $original.prop('tabindex', false);

            // Remove styles from items box
            // Fix incorrect height when refreshed is triggered with fewer options
            $li = $('li', $items.removeAttr('style')).on({
              // Prevent <input> blur on Chrome
              mousedown: function(e) {
                e.preventDefault();
                e.stopPropagation();
              },
              click: function() {
                // The second parameter is to close the box after click
                _select($(this).data('index'), true);

                // Chrome doesn't close options box if select is wrapped with a label
                // We need to 'return false' to avoid that
                return false;
              }
            }).filter('[data-index]');
          } else {
            $outerWrapper.addClass(_this.classes.disabled);
            $input.prop('disabled', true);
          }

          _utils.triggerCallback('Init', _this);
        }

        function _refresh() {
          _utils.triggerCallback('Refresh', _this);
          _populate();
        }

        // Behavior when system keys is pressed
        function _handleSystemKeys(e) {
          var key = e.keyCode || e.which;

          if ( key == 13 ) {
            e.preventDefault();
          }

          // Tab / Enter / ESC
          if ( /^(9|13|27)$/.test(key) ) {
            e.stopPropagation();
            _select(selected, true);
          }
        }

        // Set options box width/height
        function _calculateOptionsDimensions() {
          // Calculate options box height
          // Set a temporary class on the hidden parent of the element
          var hiddenChildren = $items.closest(':visible').children(':hidden').addClass(_this.classes.tempshow),
              maxHeight = _this.options.maxHeight,
              itemsWidth = $items.outerWidth(),
              wrapperWidth = $wrapper.outerWidth() - (itemsWidth - $items.width());

          // Set the dimensions, minimum is wrapper width, expand for long items if option is true
          if ( !_this.options.expandToItemText || wrapperWidth > itemsWidth )
            finalWidth = wrapperWidth;
          else {
            // Make sure the scrollbar width is included
            $items.css('overflow', 'scroll');

            // Set a really long width for $outerWrapper
            $outerWrapper.width(9e4);
            finalWidth = $items.width();
            // Set scroll bar to auto
            $items.css('overflow', '');
            $outerWrapper.width('');
          }

          $items.width(finalWidth).height() > maxHeight && $items.height(maxHeight);

          // Remove the temporary class
          hiddenChildren.removeClass(_this.classes.tempshow);
        }

        // Open the select options box
        function _open(e) {
          _utils.triggerCallback('BeforeOpen', _this);

          if ( e ) {
            e.preventDefault();
            e.stopPropagation();
          }

          if ( isEnabled ) {
            _calculateOptionsDimensions();

            // Find any other opened instances of select and close it
            $('.' + _this.classes.hideselect, '.' + _this.classes.open).children()[pluginName]('close');

            isOpen = true;
            itemsHeight = $items.outerHeight();
            itemsInnerHeight = $items.height();

            // Toggle options box visibility
            $outerWrapper.addClass(_this.classes.open);

            // Give dummy input focus
            $input.val('').is(':focus') || $input.trigger('focus')/*$input.focus()*/;

            $doc.on('click' + bindSufix, _close).on('scroll' + bindSufix, _isInViewport);
            _isInViewport();

            // Prevent window scroll when using mouse wheel inside items box
            if ( _this.options.preventWindowScroll ) {
              $doc.on('mousewheel' + bindSufix + ' DOMMouseScroll' + bindSufix, '.' + _this.classes.scroll, function(e) {
                var orgEvent = e.originalEvent,
                    scrollTop = $(this).scrollTop(),
                    deltaY = 0;

                if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1; }
                if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;  }
                if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY; }
                if ( 'deltaY'      in orgEvent ) { deltaY = orgEvent.deltaY * -1; }

                if ( scrollTop == (this.scrollHeight - itemsInnerHeight) && deltaY < 0 || scrollTop == 0 && deltaY > 0 ) {
                  e.preventDefault();
                }
              });
            }

            _detectItemVisibility(selected);

            _utils.triggerCallback('Open', _this);
          }
        }

        // Detect is the options box is inside the window
        function _isInViewport() {
          $outerWrapper.toggleClass(_this.classes.above, $outerWrapper.offset().top + $outerWrapper.outerHeight() + itemsHeight > $win.scrollTop() + $win.height());
        }

        // Close the select options box
        function _close(e) {
          _utils.triggerCallback('BeforeClose', _this);

          if ( currValue != selected ) {
            _utils.triggerCallback('BeforeChange', _this);

            var text = _this.items[selected].text;

            // Apply changed value to original select
            $original
              .prop('selectedIndex', currValue = selected)
              .data('value', text);

            // Change label text
            $label.html(
              $.isFunction(labelBuilder) ? labelBuilder(_this.items[selected]) : _utils.format(labelBuilder, _this.items[selected])
            );

            _utils.triggerCallback('Change', _this);
          }

            if (typeof e !== 'undefined') {

                if (!$(e.target).is('input')) {

                    // Remove custom events on document
                    $doc.off(bindSufix);

                    // Remove visible class to hide options box
                    $outerWrapper.removeClass(_this.classes.open);

                }

            } else {

                // Remove custom events on document
                $doc.off(bindSufix);

                // Remove visible class to hide options box
                $outerWrapper.removeClass(_this.classes.open);

            }

          isOpen = false;

          _utils.triggerCallback('Close', _this);
        }

        // Select option
        function _select(index, close) {
          // Parameter index is required
          if ( index == undefined ) {
            return;
          }

          // If element is disabled, can't select it
          if ( !_this.items[index].disabled ) {
            // If 'close' is false (default), the options box won't close after
            // each selected item, this is necessary for keyboard navigation
            $li
              .removeClass('selected')
              .eq(selected = index)
              .addClass('selected');

            _detectItemVisibility(index);
            close && _close();
          }
        }

        // Detect if currently selected option is visible and scroll the options box to show it
        function _detectItemVisibility(index) {
          var liHeight = $li.eq(index).outerHeight(),
              liTop = $li[index].offsetTop,
              itemsScrollTop = $itemsScroll.scrollTop(),
              scrollT = liTop + liHeight * 2;

          $itemsScroll.scrollTop(
            scrollT > itemsScrollTop + itemsHeight ? scrollT - itemsHeight :
              liTop - liHeight < itemsScrollTop ? liTop - liHeight :
                itemsScrollTop
          );
        }

        // Unbind and remove
        function _destroy(preserveData) {
          if ( isEnabled ) {
            $items.add($wrapper).add($input).remove();
            !preserveData && $original.removeData(pluginName).removeData('value');
            $original.prop('tabindex', tabindex).off(bindSufix).off(eventTriggers).unwrap().unwrap();
            isEnabled = false;
          }
        }

        _init(opts);
      };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function(args) {
    return this.each(function() {
      var data = $.data(this, pluginName);

      if ( data && !data.disableOnMobile )
        (''+args === args && data[args]) ? data[args]() : data.init(args);
      else
        $.data(this, pluginName, new Selectric(this, args));
    });
  };

  $.fn[pluginName].hooks = hooks;
}(jQuery));
