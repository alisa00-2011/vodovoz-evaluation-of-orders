/**
 * Модуль filters
 * Используется для управления адаптивной фильтрацией
 */

site.filters = (function($) {

    "use strict";

    /** @var {Object} data Глобальные параметры фильтрации */
    var data = {
        paramName: 'filter',
        url: '/udata://catalog/getSmartFilters//',
        categoryId: null,
        form: null,
        params: null,
        changedField: null,
        resultButton: {
            element: null,
            name: null
        },
        processingDone: false
    };

    /** @var {Object} filters */
    var filters = {

        /**
         * Выполняет ajax запрос для получения данных фильтрации
         * @param {Number} categoryId ID категории, в которой выполняется фильтрация
         * @param {Object} params параметры запроса
         * @param {Function} onSuccess callback функция успешного получения JSON данных
         */
        getFilters: function (categoryId, params, onSuccess) {
            var url = data.url + categoryId + '.json';

            $.ajax({
                url: url,
                data: params,
                dataType: 'json',
                type: 'get',
                success: onSuccess
            });

        },
        /**
         * Отображает результат фильтрации (количество найденных товаров)
         * @param {JSON} data ответ от сервера с данными о фильтрации
         */
        showResult: function (data) {
            var button = global.getResultButton();
            button.element.val(button.name + ' (' + data.total + ')');
        },

        /** Инициализирует основные параметры фильтрации */
        init: function() {
            data.form = $('.catalog_filter');
            data.categoryId = data.form.data('category');
            data.resultButton.element = $('#show_result', data.form);
            data.resultButton.name = data.resultButton.element.val();

	        $('.field > h3', data.form).on('click', function() {
		        $(this).siblings('.data').toggle('fast');
	        });

            $('#reset', data.form).click(function(e) {
                e.preventDefault();
                location.href = location.pathname;
            });

            $('.slider', data.form).each(function() {
                var rangeBlock = $(this).parent().parent().find('.range');
                var from = rangeBlock.children('input:first-child');
                var to = rangeBlock.children('input:last-child');
                var startValue = parseFloat(from.data('minimum'));
				var selectedStartValue = parseFloat(from.val());
                var endValue = parseFloat(to.data('maximum'));
				var selectedEndValue = parseFloat(to.val());
                $(this).siblings('.min').text(startValue);
                $(this).siblings('.max').text(endValue);

                $(this).slider({
                    range: true,
                    min: startValue,
                    max: endValue,
                    values: [selectedStartValue, selectedEndValue],
                    slide: function(event, ui) {
                        from.val(ui.values[0]);
                        to.val(ui.values[1]);
                    },
                    change: function(event, ui) {
                        if (from.val() == ui.value) {
                            onChange(from.get(0));
                        }

                        if (to.val() == ui.value) {
                            onChange(to.get(0));
                        }
                    }
                });
            });
			$('div.date_range input[type=text]', data.form).each(function() {
				var minDate = new Date(Date.parse($(this).data('minimum')));
				var maxDate = new Date(Date.parse($(this).data('maximum')));
				var selectedDate = new Date(Date.parse($(this).val()));
				var formattedDate = form.formatDate(selectedDate);
				$(this).val(formattedDate);
				$(this).datepicker({
					dateFormat: "d.m.yy",
					minDate: minDate,
					maxDate: maxDate
				});
			});
        }
    };

    /** @var {Object} helper Содержит функции-помощники */
    var helper = {

        /**
         * Возвращает есть ли в адресе параметры фильтрации
         * @param {String} address адрес
         * @returns {Boolean}
         */
        hasFilterParam: function (address) {
            var query = address || location.search;
            var params = this.getAllParams(query);

            for (var name in params) {
                if (params.hasOwnProperty(name)) {
                    if (helper.getArrayParamName(name) === data.paramName) {
                        return true;
                    }
                }
            }

            return false;
        },

        /**
         * Возвращает все параметры и их значения из строки запроса в виде объекта
         * вида {paramName1: paramValue1, paramName2: paramValue2 ...}
         * @param {String} query адрес с GET-параметрами
         * @returns {Object}
         */
        getAllParams: function(query) {
            var query = query || location.search;
            var decodedQuery = decodeURIComponent(query);
            decodedQuery = decodedQuery.replace(/^\?/, '');
            var params = {};

            if (typeof query === 'string' && query.length === 0) {
                return params;
            }

            var paramGroups = decodedQuery.split('&');

            for (var i = 0; i < paramGroups.length; i++) {
                var group = paramGroups[i].split('=');
                var name = group[0];
                var value = group[1];
                params[name] = value;
            }

            return params;
        },

        getRangeParams: function() {
            var fields = form.getAllFields(form.getFilterForm());
            var params = {};
            var bound;
            var field;

            for (var num in fields) {
                field = fields[num];
                bound = form.getBound(field);

                if (bound === 'from' || bound === 'to') {
                    params[$(field).attr('name')] = $(field).val();
                }
            }
            return params;
        },

        /**
         * Возвращает имя массива по имени параметра
         * @param {String} paramName имя параметра
         * @returns {String} имя массива
         */
        getArrayParamName: function(paramName) {
            var bracketPos = paramName.indexOf('[');

            if (bracketPos === -1) {
                return paramName;
            }

            return paramName.slice(0, bracketPos);
        },

        /**
         * Возвращает объект только с данными о параметрах фильтрации
         * вида вида {paramName1: paramValue1, paramName2: paramValue2 ...}
         * @returns {Object}
         */
        getFilterParams: function() {
            var allParams =  this.getAllParams();
            var filterParams = {};

            for (var name in allParams) {
                if (this.getArrayParamName(name) === data.paramName) {
                    filterParams[name] = allParams[name];
                }
            }

            return filterParams;
        },

        /**
         * Возвращает имя поля по имени параметра
         * @param {String} paramName имя параметра
         * @returns {String} имя поля или пустую строку
         */
        getFieldNameByParam: function (paramName) {
            var matches = /^(\w+)?\[(\w+)/.exec(paramName);

            if (typeof matches[2] !== 'undefined') {
                return matches[2];
            }

            return '';
        },

        /**
         * Производит слияние двух объектов параметра из source в target
         * @param {Object} target
         * @param {Object} source
         * @returns {Object} target
         */
        mergeParams: function (target, source) {
            $.extend(target, source);

            return target;
        },

        /**
         * Назначает обработчик событий выбора значения в фильтре для полей разных типов
         * @param {Function} onChange обрабочик событий
         */
        bindValueChangeHandler: function(onChange) {
			var field = this;
			var fieldType = form.getType(field);

			switch (true) {
				case fieldType.tag === 'input' && (fieldType.type === 'radio' || fieldType.type === 'checkbox'): {
					$(field).click(onChange);
					break;
				}
				case fieldType.parentClass == 'date_range': {
					$(field).change(onChange);
					break;
				}
				default : {
					// From-To
					$(field).bind('focus', function() {
						$(this).data('originValue', $(this).val());
					});

					$(field).focusout(function(e) {
						var originValue = $(this).data('originValue');

						if ($(this).val() !== originValue) {
							onChange(e);
						}
					});
				}
			}
        },
        /**
         * Возвращает данные, пришедшие от сервера по полю с именем name
         * @param {JSON} data данные от сервера
         * @param {String} name имя поля
         * @returns {JSON}
         */
        getFieldDataByName: function(data, name) {
            var groups = getGroups(data);
            var fields = getSubNodes(groups, 'field');

            for (var num in fields) {
                var field = fields[num];
                if (typeof field.name === 'string' && field.name === name) {
                    return field;
                }
            }

            return null;

            /**
             * Возвращает данные групп полей
             * @param {JSON} data
             * @returns {JSON}
             */
            function getGroups(data) {
                var groups = {};
                for (var pos in data['group']) {
                    groups[pos] = data['group'][pos];
                }
                return groups;
            }

            /**
             * Возвращает данные о дочерних элементах с именем nodeName
             * @param {JSON} data
             * @param {String} nodeName имя дочернего элемента
             * @returns {JSON}
             */
            function getSubNodes(data, nodeName) {
                var subNodes = {};
                var i = 0;

                for (var num in data) {
                    var nodes = data[num][nodeName];

                    for (var num in nodes) {
                        subNodes[i] = nodes[num];
                        i++;
                    }
                }
                return subNodes;
            }
        },

        /**
         * Возвращает значения для поля (узлы item)
         * @param {JSON} data
         * @returns {JSON}
         */
        getItems: function(data) {
            return (data && data.item ? data.item : null);
        },

        /**
         * Удаляет параметр поля field из объекта params
         * @param {HTMLElement} field поле фильтрации
         * @param {Object} params параметры
         */
        deleteParam: function (field, params) {
            var paramName = $(field).attr('name');

            if (params[paramName]) {
                delete params[paramName];
            }
        }
    };

    /** @var {Object} form Объект, содержащий функции для работы с формой фильтрации */
    var form = {

        /**
         * Выполняет функцию callback для всех полей fields, которые соответствуют критерию filter
         * @param {Object} fields объект содержащий данные о полях формы фильтрации
         * @param {Function} callback функция, которая будет выполнена для каждого поля
         * @param {Function} filter функция, которая выступает в качестве критерия для отбора полей
         */
        forEachField: function (fields, callback, filter) {
            var callback = typeof callback === 'function' ?  callback : function() {};
            var filter = typeof filter === 'function' ?  filter : function() {return true;};

            var field = null;
            var extraArgs = Array.prototype.slice.call(arguments, 3);
            for (var name in fields) {
                if (fields.hasOwnProperty(name)) {
                    field = fields[name];

                    if (filter(field)) {
                        callback.apply(field, extraArgs);
                    }
                }
            }
        },

        /**
         * Возвращает параметр с его значением поля
         * @param {HTMLElement} field поле
         * @returns {Object}
         */
        getFieldParams: function(field) {
        	var $field = $(field);
            var newValue = $field.val();
            var paramName = $field.attr('name');
            var param = {};
            var fieldType = form.getType(field);

            if (fieldType.type === 'checkbox' && !$field.prop('checked')) {
                return param;
            }

            param[paramName] = newValue;
            return param;
        },

        /** Выполняет визуальную "деактивацию" поля */
        resetField: function() {
            var field = this;

            if ($(field).parent().length) {
                form.makeInActive(field);
            }
        },

        /**
         * Изменяет состояние поля в зависимости от переданных данных
         * @param {JSON} data
         */
        fillField: function (data) {
            var field = this;
            var fieldType = form.getType(field);

            var paramName = $(field).attr('name');
            var fieldName = helper.getFieldNameByParam(paramName);
            var fieldData = helper.getFieldDataByName(data, fieldName);

            if (fieldType.type === 'checkbox') {
                form.fillCheckBoxField(field, fieldData);
            } else if (fieldType.type === 'radio') {
                form.fillRadioField(field, fieldData);
                // Input "From To"
            } else {
                form.fillFromToField(field, fieldData);
            }

        },
        /**
         * Возвращает все поля формы form
         * @param {String|Jquery|HTMLElement} form форма
         * @returns {Object}
         */
        getAllFields: function (form) {
            var fieldsSelector = 'input[name]';
            var allFields = {};
            var i = 0;
            $(fieldsSelector, form).each(function(num, field) {
                allFields[i] = field;
                i++;
            });

            return allFields;
        },

        /** Возвращает форму фильтрации */
        getFilterForm: function() {
            return data.form;
        },

		/**
		 * Возвращает объект с именем тега и типом (атрибут type) поля
		 * @param {HTMLElement} field поле
		 */
		getType: function (field) {
			var tag = $(field).prop('tagName').toLowerCase();
			var type = $(field).attr('type') || null;
			var parentClass = $(field).parent().attr('class');
			return {
				tag: tag,
				type: type,
				parentClass: parentClass
			};
		},

        /**
         * Сделать поле активным
         * @param {HTMLElement} field поле
         */
        makeActive: function(field) {
            $(field).parent().removeClass('inactive');
            $(field).removeAttr('disabled');
        },

        /**
         * Сделать поле неактивным
         * @param {HTMLElement} field поле
         */
        makeInActive: function(field) {
            $(field).parent().addClass('inactive');
            $(field).attr('disabled', '');
        },

        /**
         * Изменяет состояние поля типа "Checkbox" в зависимости от переданных данных
         * @param {HTMLElement} field поле
         * @param {JSON} data
         */
        fillCheckBoxField: function (field, data) {
            var items = null;
            var fieldValue = $(field).val();

            if (data) {
                items = helper.getItems(data);

                for (var num in items) {
                    var item = items[num];

                    if (item.value === fieldValue) {
                        form.makeActive(field);
                    }
                }
            }
        },
        /**
         * Изменяет состояние поля типа "Radio" в зависимости от переданных данных
         * @param {HTMLElement} field поле
         * @param {JSON} data
         */
        fillRadioField: function(field, data) {
            var fieldValue = $(field).val();

            if (typeof fieldValue === 'string' && fieldValue.length === 0) {
                form.makeActive(field);
            }

           form.fillCheckBoxField(field, data);
        },

        /**
         * Изменяет состояние поля типа "От-До" в зависимости от переданных данных
         * @param {HTMLElement} field поле
         * @param {JSON} data
         */
        fillFromToField: function(field, data) {
			if (!data) {
			   return;
			}

			if (data.minimum && data.minimum.value && form.getBound(field) === 'from') {
				if (data['data-type'] != 'date') {
					$(field).val(data.minimum.value);
					return;
				}
				var minDate = form.timestamp2date(data.minimum.value);
				$(field).val(form.formatDate(minDate));
			}

			if (data.maximum && data.maximum.value && form.getBound(field) === 'to') {
				if (data['data-type'] != 'date') {
					$(field).val(data.maximum.value);
					return;
				}
				var maxDate = form.timestamp2date(data.maximum.value);
				$(field).val(form.formatDate(maxDate));
			}
        },

		/**
		 * Преобразует timestamp в Date
		 * @param {Integer} timestamp
		 * @returns {Date}
		 */
		timestamp2date: function(timestamp) {
			return new Date(timestamp * 1000);
		},

		/**
		 * Преобразует Date в строковую дату
		 * @param {Date} date
		 * @returns {String}
		 */
		formatDate: function(date){
			if (!date instanceof Date) {
				return 'Date expected';
			}

			return date.getDate() + '.' + (date.getMonth() + 1)+ '.' + date.getFullYear();
		},

	/**
         * Возвращает имя границы (from или to) поля
         * @param {HTMLElement} field
         * @returns {String}
         */
        getBound: function(field) {
            var name = $(field).attr('name');
            var matches = /\[(\w+)\]$/.exec(name);

            if (matches && matches[1]) {
                return matches[1];
            }

            return '';
        }
    };

    /** @var {Object} global Объект управления глобальными параметрами */
    var global = {

        /**
         * Установливает глобальные параметры
         * @param {Object} params
         */
        setParams: function (params) {
            data.params = params;
        },

        /** Возвращает глобальные параметры */
        getParams: function () {
            return data.params || {};
        },

        /**
         * Устанавливает поле, значение которого было изменено пользователем
         * @param {HTMLElement} field
         */
        setChangedField: function(field) {
            data.changedField = field;
        },

        /**
         * Возвращает поле, значение которого было изменено пользователем
         * @param {HTMLElement} field
         */
        getChangedField: function() {
            return data.changedField;
        },

        /**
         * Возвращает ID категории, по которой выполняется фильтрация
         * @returns {Number} ID категории
         */
        getCategoryId: function() {
            return data.categoryId;
        },

        /**
         * Возвращает кнопку отображаения результатов
         * @returns {HTMLElement}
         */
        getResultButton: function (){
            return data.resultButton;
        }
    };

    $(function() {
        filters.init();

        if (helper.hasFilterParam()) {
            var params = helper.getFilterParams();
            global.setParams(params);
            filters.getFilters(global.getCategoryId(), params, processFilters);
        }

        var fields = form.getAllFields(form.getFilterForm());
        form.forEachField(fields, helper.bindValueChangeHandler, null, onChange);
    });

    function onChange(event) {
        var field = event.target || event;
        global.setChangedField(field);
        var newParams = form.getFieldParams(field);
        var currentParams = global.getParams();

        if (form.getType(field).type === 'checkbox' && !$(field).prop('checked')) {
            helper.deleteParam(field, currentParams);
        }

        helper.mergeParams(currentParams, newParams);
        var rangeParams = helper.getRangeParams();
        helper.mergeParams(currentParams, rangeParams);
        global.setParams(currentParams);
        filters.getFilters(global.getCategoryId(), global.getParams(), processFilters);
    }

    function processFilters(response) {
        var fields = form.getAllFields(form.getFilterForm());

        form.forEachField(fields, form.resetField, function(field) {
            return (form.getType(field).type !== 'text' && !($(field).attr('name') in global.getParams()));
        });

        form.forEachField(fields, form.fillField, null, response);

        if (!data.processingDone) {
            form.forEachField(fields, function() {
                $(this).prop('checked', true);
            }, function(field) {
                return (form.getType(field).type === 'checkbox' ||
                    form.getType(field).type === 'radio') &&
                    (typeof helper.getFilterParams()[field.name] !== 'undefined' &&
                    field.value == helper.getFilterParams()[field.name].replace(/\+/ig, ' '));
            });
        }


        filters.showResult(response, global.getChangedField());
        data.processingDone = true;
    }

    return {
        helper: helper
    };

})(jQuery);
