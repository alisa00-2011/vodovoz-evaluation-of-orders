var forms = (function(window, undefined) {

    'use strict';

    var $body = $('body');

    function init(namespace) {

        // Content editable blocks
        $body.on('blur', '[contenteditable]', function() {

            var $this = $(this),

                src = $this.html(),
                txt = $this.text(),

                value = $this.html().replace(/<div>/gi,'<br />').replace(/<\/div>/gi,'').replace(/<br\s*[\/]?>/gi, '%br%'),
                sanValue = $this.html(value).text();

            $this.html(src);
            $this.next('[type="hidden"]').val(sanValue.replace(/%br%/gi, '\r\n'));

            if (!txt.length) {

                $this.empty();

            }

        });

        forms.placeholders(namespace + ' .b-form_box.placeholder input, ' + namespace + ' .b-form_box.placeholder select');

        forms.styleControls(namespace + ' input[type="checkbox"], ' + namespace + ' input[type="radio"]', namespace + ' select:not([multiple]):not(.js-selectric)', namespace + ' input[type="file"]:not(.js-uploader)');
        forms.styleSelects(namespace + ' select.js-selectric');

        forms.masking(namespace);
        forms.validate(namespace);

        forms.resetForm();
        forms.confirmCheckbox(namespace);

        forms.datePicker(namespace);

        forms.spinner({
            namespace: namespace,
            selector: '.js-spinner'
        });

    }

    function validate(namespace) {

        $(namespace + ' form:not(.js-detach-validate)').each(function() {

            var $form = $(this);

            if ($.isFunction($.fn.validate) && $form.data('checkup')) {

                $form
                    .on('keyup', '[data-diff]', function() {

                        $($(this).data('diff')).data('conditionalDiff', $(this).val() !== '');

                    });

                $form
                    .validate({
                        onChange: !!$form.data('checkupOnChange') ? $form.data('checkupOnChange') : false,
                        onKeyup: !!$form.data('checkupOnKeyup') ? $form.data('checkupOnKeyup') : false,
                        onBlur: !!$form.data('checkupOnBlur') ? $form.data('checkupOnBlur') : false,
                        conditional: {
                            passwords: function() {

                                return $(this).val() === $('[data-conditional-check="passwords"]').val();

                            },
                            uploader: function() {

                                return $(this).closest('.b-uploader').find('.b-uploader_result').val() !== '';

                            }
                        },
                        eachInvalidField: function(status, options) {

                            var conditional = !!$(this).data('conditionalType') ? formNotifications.labels.conditional[$(this).data('conditionalType')] : formNotifications.labels.conditional[$(this).data('conditional')] || formNotifications.labels.conditional.def,
                                pattern = !!$(this).data('patternType') ? formNotifications.labels.pattern[$(this).data('patternType')] : formNotifications.labels.pattern.def,
                                required = !!$(this).data('requiredNotice') ? $(this).data('requiredNotice') : !!$(this).data('requiredType') ? formNotifications.labels.required[$(this).data('requiredType')] : formNotifications.labels.required.def,

                                notification = (options.required) ? ((!options.conditional) ? conditional : (!options.pattern) ? pattern : '') : required;

                            formNotifications.showErrorLabel.call($(this), notification, 0);

                        },
                        eachValidField: function() {

                            formNotifications.hideErrorLabel.call($(this));

                        },
                        invalid: function(e) {

                            if (!!$form.data('checkupScroll') && !$('html').hasClass('m-leaflet-on')) {

                                setTimeout($.proxy(function() {

                                    var $errorFirst = $(this).find('.b-form_box.m-error').first();

                                    if (/*['xs', 'sm'].indexOf(helpers.screen()) >= 0 && */$errorFirst.length) {

                                        $('html, body').animate({ scrollTop: $errorFirst.offset().top - 140 }, 600);

                                    }

                                }, this), 100);

                            }
                            else {

                                setTimeout($.proxy(function() {

                                    var $errorFirst = $(this).find('.b-form_box.m-error').first();

                                    if ($errorFirst.length) {

                                        $('.b-leaflet').animate({ scrollTop: $errorFirst.offset().top - 140 }, 600);

                                    }

                                }, this), 100);

                            }

                        },
                        valid: function(e) {

                            var $form = $(this),
                                $btn = $(this).find('button[type="submit"].e-btn'),

                                xhrSubmit = !!$(this).data('xhr'),

                                validHandler = $(this).data('handler'),
                                validHandlerMethod = $(this).data('handlerProperty');

                            if (typeof window[validHandler] === 'function') {

                                window[validHandler].call($form, e);

                            }
                            else if (typeof window[validHandler] === 'object') {

                                if (!!window[validHandler][validHandlerMethod]) {

                                    window[validHandler][validHandlerMethod].call($form, e);

                                }

                            }

                            if (xhrSubmit) {

                                e.preventDefault();
                                $btn.prop('disabled', true).toggleClass('request');

                                $.ajax({
                                    url: $form.attr('action'),
                                    method: $form.attr('method'),
                                    data: $form.serialize() + '&' + objSerialize($btn.data()),
                                    dataType: 'json',
                                    success: function(response) {

                                        $btn.prop('disabled', false).toggleClass('request');
                                        xhrFormHandler.response.call($form, response);

                                    }
                                });

                            }

                        }

                    })
                    .off('focus selectric-before-open refresh.validate')
                    .on('focus selectric-before-open refresh.validate', 'input, textarea, select, div[contenteditable]', function() {

                        $(this).closest('.m-valid').removeClass('m-valid');
                        $(this).closest('.m-error').removeClass('m-error');

                    });

            }

            // Check to toggle a button
            if ($form.data('checkupBtn')) {

                $form.validate({
                    nameSpace : 'buttonSwitching',
                    onKeyup: true,
                    onBlur: true,
                    buttonSwitching: true,
                    switching: function(event, options, btnState) {

                        $(this).data('validateStatus', options);

                        var xhrValidateState = typeof $form.data('xhrValidateState') !== 'undefined' ? $form.data('xhrValidateState') : true,
                            prop = btnState && xhrValidateState;

                        $(this).find('button[type="submit"]').prop('disabled', !prop);

                    }
                });

            }

        }); // End loop

    }

    function styleControls(input, select, file) {

        if ($.isFunction($.fn.uniform)) {

            // Inputs
            $(input)
                .not('.js-switcher')
                .uniform();

            // Select
            if(!!select) {

                $(select).uniform({
                    selectAutoWidth: false,
                    selectClass: 'e-select'
                });

            }

            // File
            if(!!file) {

                $(file).each(function() {

                    $(this).uniform({
                        fileButtonHtml: 'Обзор',
                        fileClass: 'e-uploader',
                        filenameClass: 'e-uploader_file',
                        fileButtonClass: 'e-uploader_btn e-btn e-btn_green_outline',
                        fileDefaultHtml: $(this).data('label') || 'Прикрепить файл:'
                    });

                });

            }

        }

    }

    function styleSelects(selector) {

        if (helpers.isTouchDevice()) {

            if ($.isFunction($.fn.uniform)) {

                $(selector).uniform({
                    selectAutoWidth: false,
                    selectClass: 'e-select'
                });

            }

        }
        else {

            if ($.isFunction($.fn.selectric)) {

                $(selector).selectric({
                    maxHeight: 200,
                    arrowButtonMarkup: '',
                    disableOnMobile: false,
                    optionsItemBuilder: function(data, el) {

                        var storage = $(el).data();

                        return data.text + ((!!storage.someData) ? '<span>' + storage.someData + '</span>' : '');

                    },
                    labelBuilder: function(data) {

                        var icon = '<svg width="9" height="9" aria-hidden="true"><use xlink:href="#chevron-bold-down"></use></svg>',
                            text = data.value !== '' ? data.text : '<span class="placeholder">' + data.text + '</span>';

                        return !!icon ? text + icon : text;

                    }
                });

            }

        }

    }

    function placeholders(selector) {

        $(selector).each(function() {

            _processing.call($(this));

        });

        function _processing() {

            this.closest('.b-form_box').toggleClass('active', $(this).val() !== '');

            this.on('focus blur change selectric-change', function(e) {

                $(this).closest('.b-form_box').toggleClass('active', e.type === 'focus' || !!$(this).val().length);

            });

            setTimeout($.proxy(function() {

                this.closest('.b-form_box').toggleClass('transition');

            }, this), 100);

        }

    }

    function masking(namespace) {

        if ($.isFunction($.fn.mask)) {

            $(namespace + ' [data-masking]').each(function() {

                $(this).mask($(this).data('masking'), {});

                $(this)
                    .data('storagePlaceholder', $(this).attr('placeholder'))
                    .on('focus.maskingPlaceholder', function() {

                        $(this)
                            .attr('placeholder', $(this).data('maskingPlaceholder'));

                    })
                    .on('blur.maskingPlaceholder', function() {

                        $(this)
                            .attr('placeholder', $(this).data('storagePlaceholder'));

                    });

            });

        }

    }

    function confirmCheckbox(namespace) {

        $(namespace).on('change.confirmCheckbox', '.js-confirm', function() {

            var $form = $(this).closest('form'),
                $btn = $form.find('button[type="submit"]'),

                reCaptchaResult = $form.data('reCaptchaResult') || !$form.find('.js-reCaptcha').length,
                available = typeof $btn.data('available') !== 'undefined' ? $btn.data('available') : true;

            $btn.prop('disabled', !($(this).is(':checked') && reCaptchaResult && available));

        });

    }

    function resetForm() {

        $body
            .off('click.resetForm')
            .on('click.resetForm', '.js-reset-form', function(e) {

                e.preventDefault();

                var $form = $(this).closest('form');

                $form[0].reset();

                $form.find('div[contenteditable]').empty();
                $form.find('div[contenteditable] ~ input[type="hidden"]').val('');

                $form.find('input[type="text"], input[type="email"], input[type="tel"], select').not('[data-default]').val('').trigger('change');
                $form.find('input[type="radio"], input[type="checkbox"]').prop('checked', false);

                $form.find('select').selectric('refresh');

                $form.find('.js-range').slider('option', {
                    values: [
                        $($form.find('.js-range').data('from')).data('default'),
                        $($form.find('.js-range').data('to')).data('default')
                    ]
                });

                $.uniform.update();

            });

    }

    function spinner(options) {

        options = !!options ? options : {};

        options.selector = !!options.selector ? options.selector : '.js-spinner';
        options.namespace = !!options.namespace ? options.namespace + ' ' : '.b-page';

        options.checkMaxHandler = !!options.checkMaxHandler ? options.checkMaxHandler : false;
        options.checkMinHandler = !!options.checkMinHandler ? options.checkMinHandler : false;

        var $spinner = $(options.namespace + options.selector);

        $spinner
            .each(function() {

                var $field = $(this),

                    step = Number($(this).data('step') || 1),
                    min = Number($(this).data('min') || step),

                    suffix = typeof $field.data('suffix') !== 'undefined' ? (' ' + $field.data('suffix')) : '',

                    value = $(this).val() || step;

                value = checkMax.call($field, value);

                var minus = '<span>-</span>',
                    plus = '<span>+</span>';

                $field.val(value + suffix);

                if (!$field.closest('.b-spinner').length) {

                    $field.wrap('<div class="b-spinner"></div>');

                }

                if (!$field.closest('.b-spinner').find('.b-spinner_buttons').length) {

                    $field
                        .closest('.b-spinner')
                        .append('<div class="b-spinner_buttons"><button class="e-btn" data-spin="up">' + plus + '</button><button class="e-btn" data-spin="down">' + minus + '</button></div>');

                    $field
                        .closest('.b-spinner')
                        .off('click.spinAmount')
                        .on('click.spinAmount', 'button', function(e) {

                            e.preventDefault();

                            step = Number($field.data('step') || 1);
                            min = Number($field.data('min') || step);

                            var quantity = parseFloat($(this).closest('.b-spinner').find('input').val().replace(suffix, '')),

                                it = Number($field.data('it') || 1),
                                target = 0;

                            switch($(this).data('spin')) {

                                default:
                                case 'up':
                                    it++;
                                    target = quantity*100 + step*100;
                                    break;

                                case 'down':
                                    it = (it < 2) ? 1 : it - 1;
                                    target = (quantity*100 < (step*100 + min*100)) ? min*100 : quantity*100 - step*100;
                                    break;

                            }

                            target = target/100;

                            var result = target.isInteger() ? target + suffix : target.toFixed(2) + suffix;

                            $(this).closest('.b-spinner').find('input').data('it', it).val(result).trigger('blur').trigger('change');

                        });

                    $field
                        .off('keyup.spinnerKeyup')
                        .on('keyup.spinnerKeyup', function() {

                            if (!$(this).val().match(/^\d+$/)) {

                                $(this).val($(this).data('step') || 1);

                            }

                        })
                        .off('blur.spinnerBlur')
                        .on('blur.spinnerBlur', function() {

                            var suffix = typeof $(this).data('suffix') !== 'undefined' ? (' ' + $(this).data('suffix')) : '';

                            if ($(this).val() === '' || $(this).val() === 0) {

                                $(this).val($(this).data('step') || 1);

                            }

                            // Check maximum
                            var testedValue = checkMax.call($(this), $(this).val().replace(suffix, ''), options.checkMaxHandler),
                                result = testedValue.isInteger() ? testedValue + suffix : testedValue.toFixed(2) + suffix;

                            $(this).val(result);

                            if (!!options.onBlur) {

                                options.onBlur(parseFloat($(this).val()));

                            }

                        });

                }

            });

        function checkMax(amount, checkMaxHandler) {

            var checkMax = typeof this.data('max') !== 'undefined' && Number(amount) > this.data('max');

            if (!!checkMaxHandler) {

                checkMaxHandler.call(this, checkMax);

            }

            return checkMax ? this.data('max') : Number(amount);

        }

        function checkMin(amount, checkMinHandler) {

            var checkMin = typeof this.data('min') !== 'undefined' && Number(amount) < this.data('min');

            if (!!checkMinHandler) {

                checkMinHandler.call(this, checkMin);

            }

            return checkMin ? this.data('min') : Number(amount);

        }

    }

    function datePicker(namespace) {

        if ($.isFunction($.fn.datepicker)) {

            $(namespace + ' .js-datePicker').each(function() {

                var $datePicker = $(this),
                    $datePickerInput = $datePicker.find('input');

                $datePicker.datepicker({
                    inline: true,
                    minDate: new Date(),
                    onSelect: function onSelect(fd, date) {

                        $datePickerInput.val(fd).trigger('change').trigger('refresh.validate');

                    }
                });

            });

        }

    }

    return {
        init: init,
        confirmCheckbox: confirmCheckbox,
        datePicker: datePicker,
        masking: masking,
        placeholders: placeholders,
        resetForm: resetForm,
        spinner: spinner,
        styleControls: styleControls,
        styleSelects: styleSelects,
        validate: validate
    };

})(window);

var formNotifications = (function(window, undefined) {

    var settings = {
        errorClass: 'm-error',
        errorSuffix: '_error',
        validClass: 'm-valid'
    };

    var extendLabels = typeof formNotices !== 'undefined' ? formNotices : {},

        labels = {
            required: {
                def: 'Необходимо заполнить',
                select: 'Необходимо выбрать'
            },
            conditional: {
                def: 'Введенные данные не совпадают',
                credit: 'Некорректный номер банковской карты',
                passwords: 'Введенные пароли не совпадают',
                checkboxes: 'Необходимо выбрать один из параметров',
                inn: 'Ошибка в ИНН',
                snils: 'Ошибка в номере СНИЛС',
                diff: 'Заполните хотя бы одно поле',
                phoneOrEmail: 'Укажите телефон или email',
                uploader: 'Необходимо загрузить хотя бы один файл',
                uploaderAmount: 'Необходимо загрузить от 2-х до 5-ти изображений'
            },
            pattern: {
                def: 'Некорректный формат данных',
                email: 'Некорректный e-mail',
                phone: 'Некорректный телефон',
                date: 'Некорректно указана дата',
                time: 'Некорректно указано время'
            },
            uploader: {
                count: 'Вы пытаетесь загрузить больше изображений, чем это допустимо',
                size: 'Загрузите файл размером меньше 10 Мб',
                uploading: 'Во время загрузки изображений возникла ошибка'
            },
            submit: {
                success: 'Спасибо. Мы свяжемся с вами в ближайшее время.',
                error: 'Ошибка.'
            }
        };

    labels = $.extend({}, labels, extendLabels);

    // Notification alerts
    function showMessage(msg, status, hideForm, callback) {

        var $notice = this.find('.b-form_message').length ? this.find('.b-form_message') : $('<div class="b-form_message"></div>').prependTo(this),
            suffix = status ? 'success' : 'error';

        if (hideForm) {

            $notice
                .html('<div class="b-form_message_balloon b-form_message_balloon__' + suffix + '"><div class="b-form_message_balloon_capsule"><div class="b-form_message_balloon_capsule_inner">' + msg + '</div></div></div>')
                .css({ position: 'absolute', zIndex: 10, left: 0, top: '50%', right: 0, padding: 0, marginTop: -($notice.find('.b-form_message_balloon').height() / 2) });

            $notice.toggleClass('b-form_message__show', true);

            this
                .css({ height: this.outerHeight() })
                .toggleClass('b-form__hide', true)
                .animate({ height: $notice.find('.b-form_message_balloon').height() }, 300, 'easeOutQuart');

        }
        else {

            $notice
                .height($notice.height())
                .html('<div class="b-form_message_balloon b-form_message_balloon__' + suffix + '"><div class="b-form_message_balloon_capsule"><div class="b-form_message_balloon_capsule_inner">' + msg + '</div></div></div>');

            $notice
                .toggleClass('b-form_message__show', true)
                .animate({ height: $notice.find('.b-form_message_balloon').height(), paddingBottom: hideForm ? 0 : 16 }, 300, 'easeOutQuart', function() {

                    $(this).css({ height: '' });

                });

        }

        // Callback
        if(!!callback) {

            callback.call(this);

        }

    }

    function showMessageInPopUp(msg, status, hideForm, callback) {

        var $form = this.find('form'),

            $msg = $('<div class="b-form_message b-form_message__show"></div>'),
            $msgInner = $('<div class="b-form_message_inner"></div>').appendTo($msg),
            $msgBalloon = $('<div class="b-form_message_balloon b-form_message_balloon__' + (status ? 'success' : 'error') + '"></div>').appendTo($msgInner);

        $msgBalloon.append('<div class="b-form_message_balloon_capsule"><div class="b-form_message_balloon_capsule_inner">' + msg + '</div></div>');

        this.leafLetPopUp('show', {
            animationStyleOfBox: 'scale',
            animationStyleOfChange: 'slide',
            boxWidth: 490,
            boxHorizontalGutters: 15,
            boxVerticalGutters: 15,
            closeBtnLocation: 'box',
            content: $msg,
            overlayOpacity: .65,
            scrollLocker: $('.b-page'),
            scrollMode: /*!helpers.mobile() ? */'inner'/* : 'outer'*/,
            beforeLoad: function() {

                this.addClass('b-form_message_leaflet');

            },
            afterLoad: function() {

                if (hideForm) {

                    $form
                        .toggleClass('disabled', true)
                        .find('input, select, textarea, button')
                        .prop('disabled', true);

                    $.uniform.update($form.find('input, select, textarea'));

                }

                // Callback
                if(!!callback) {

                    callback.call(this);

                }

            }
        });

    }

    function hideMessage() {

        var $notice = this.find('.b-form_message').length ? this.find('.b-form_message') : $('<div class="b-form_message"></div>').prependTo(this);

        $notice
            .slideUp({duration: 400, easing: 'easeOutQuart' });

    }

    // Notification labels
    function showErrorLabel(text, status) {

        var $field = this.closest('.b-form_box');

        $field
            .find('.b-form_box' + settings.errorSuffix).remove();

        if (!$(this).data('rowed')) {

            $field
                .find('.b-form_box_field')
                .append('<div class="b-form_box' + settings.errorSuffix + '">' + text + '</div>');

        }
        else {

            $field
                .append('<div class="b-form_box' + settings.errorSuffix + '">' + text + '</div>');

        }

        setTimeout(function() {

            $field
                .removeClass(settings.validClass)
                .addClass(settings.errorClass);

        }, 100);

        setTimeout(function() {

            $(window).trigger('aside.refresh');

        }, 250);

    }

    function hideErrorLabel() {

        var $field = this.closest('.b-form_box');

        $field.removeClass(settings.errorClass);
        $field.find('.b-form_box' + settings.errorSuffix).remove();

        if ($field.find('[data-required]').length) {

            setTimeout(function() {

                $field.addClass(settings.validClass);

            }, 100);

            setTimeout(function() {

                $(window).trigger('aside.refresh');

            }, 250);

        }

        if (!!this.data('xhrCheck')) {

            xhrCheckField.call(this);

        }

    }

    function xhrCheckField() {

        var $field = this,
            data = { action: 'xhrCheck' };

        data[$field.attr('name')] = $field.val();

        $.ajax({
            url: $field.data('xhrCheck') || $field.closest('form').attr('action'),
            method: $field.closest('form').attr('method'),
            data: data,
            dataType: 'json',
            before: function() {

                $field.closest('.b-form_box').toggleClass('request', true);

            },
            success: function(response) {

                if (response.result) {

                    $(response.target).html(response.notice);

                }

            }
        });

    }

    return {
        labels: labels,
        showErrorLabel: showErrorLabel,
        hideErrorLabel: hideErrorLabel,
        showMessage: showMessage,
        hideMessage: hideMessage,
        showMessageInPopUp: showMessageInPopUp
    };

})(window);

var xhrFormHandler = (function(window, undefined) {

    function response(response) {

        var $form = this,
            message = '';

        // start check
        if (typeof response.fields === 'boolean' && response.fields) {

            message = response.msg || formNotifications.labels.submit.success;

            if (!!$form.data('inPopUp')) {

                formNotifications.showMessageInPopUp.call(this.closest('.b-form'), message, true, response.hideForm);

            } else {

                formNotifications.showMessage.call(this.closest('.b-form'), message, !!response.fields, !!response.hideForm);

            }

        }
        else if (typeof response.fields === 'boolean' && !response.fields) {

            message = response.msg || formNotifications.labels.submit.error + messageStr.substring(0, messageStr.length - 2) + '.';

            formNotifications.showMessage.call(this.closest('.b-form'), message, false, false, function(form) {

                highlightFields($form, response.fields);

            });

        }
        else if (typeof response.fields === 'object') {

            // Get error message string
            var messageStr = ' Некорректно заполнены поля: ';

            $.each(response.fields, function(key, value) {

                var fieldName = $form.find('[name="' + key + '"]').attr('placeholder') || $form.find('[name="' + key + '"]').closest('.b-form_box').find('.b-form_box_title').text().replace(' *', '');

                messageStr += '&laquo;' + fieldName + '&raquo;, ';

            });

            message = response.msg || formNotifications.labels.submit.error + messageStr.substring(0, messageStr.length - 2) + '.';

            formNotifications.showMessage.call(this.closest('.b-form'), message, false, false, function(form) {

                highlightFields($form, response.fields);

            });

        } else {

            if ('console' in window) {
                console.log('Неверный формат ответа обработчика формы');
                console.log(response);
            }

        }

    }

    function highlightFields(form, array) {

        $.each(array, function(key, value) {

            formNotifications.showErrorLabel.call(form.find('[name="' + key + '"]'), value, 0);

        });

    }

    return {
        response: response
    };

})(window);
