(function($, _) {

    'use strict';

    var url = '/udata://search/search_do/.json';
    var searchStringParam = 'search_string';
    var perPageParam = 'per_page';
    var searchResults = {};
    var $element = null;
    var $form = null;
    var $templateElement = null;
    var $resultElement = null;
    var allResultButtonSelector = '.search-all-result';
    var maxResultsCount = 15;
    var template = null;
    var allResultsLabel = 'Все результаты'; // getLabel('js-all-results')
    var beforeCloseInterval = 200;

    $(function() {
        $form = $('form.search');
        $element = $('input[name=search_string]', $form).first();
        $templateElement = $('#search-result-template', $form);
        $resultElement = $('.search-result', $form);

        if (!$form.length || !$element.length || !$templateElement.length) {
            return;
        }
        template = _.template($templateElement.html());

        $element.on('input', function() {
            var searchString = $element.val();
            search(searchString, function(response) {
                if (!isValidResult(response)) {
                    return;
                }
                onSearchResult(searchString, response['items']);
            });
        });

        $element.on('blur', function() {
            setTimeout(function() {
                $resultElement.html('');
            }, beforeCloseInterval);
        });
    });

    /**
     * Обработчик события получения результатов поиска
     * @param {String} searchString поисковый запрос
     * @param result
     */
    function onSearchResult(searchString, result) {
        saveResult(searchString, result);
        $resultElement.html('');

        var data = processResult(result);

        if (!data.length) {
            return;
        }
        var resultHtml = template({typesList: data, allResults: allResultsLabel});
        $resultElement.html(resultHtml);

        $(allResultButtonSelector, $resultElement).on('click', function() {
            $form.submit();
        });
    }

    /**
     * Обрабатывает результаты поиска для шаблонизатора
     * @param {JSON} result данные найденных элементов
     * @returns {*}
     */
    function processResult(result) {
        var items = result['item'];

        if (!items) {
            return [];
        }

        return getDataByCategories(items);

        /**
         * Группирует результаты найденные элементы по категориям
         * @param {JSON} items данные найденных элементов
         * @returns {Array}
         */
        function getDataByCategories(items) {
            var data = $.extend(true, {}, items);
            var typesList = [];
            var type = null;

            _.each(data, function(element) {
                type = element['type'];

                if (!type) {
                    type = {id: 0, name: ''};
                }

                if (type.module == 'Структура') {
                    type.module = 'Страницы';
                }

                var addedType = _.findWhere(typesList, {id: type.id});

                if (!addedType) {
                    typesList.push(type);
                }

                type = addedType || type;
                type['elements'] = type['elements'] || [];
                type['elements'].push(element);
            });

            return typesList;
        }
    }

    /**
     * Проверяет вернулись ли от сервера корректные результаты поиска
     * @param {JSON} data результаты поиска
     * @returns {boolean}
     */
    function isValidResult(data) {
        data = data || {};
        return !!data['items'];
    }

    /**
     * Возвращает числовое значение (хэш) строки
     * @param {String} str исходная строка
     * @returns {number}
     */
    function getHash(str){
        var hash = 0;
        if (str.length == 0) {
            return hash;
        }
        var char = '';
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }

    /**
     * Сохраняет результаты поиска
     * @param {String} searchString поисковый запрос
     * @param {JSON} result результаты поиска
     */
    function saveResult(searchString, result) {
        if (searchString) {
            searchResults[getHash(searchString)] = result;
        }
    }


    /**
     * Выполняет поиск вхождения строки
     * @param {String} string поисковый запрос
     * @param {Function} callback вызывается при успешном получении результатов поиска
     * @returns {*}
     */
    function search(string, callback) {
        if (!string) {
            return;
        }

        callback = typeof callback == 'function' ? callback : function() {};

        var request = {};
        request[searchStringParam] = string;
        request[perPageParam] = maxResultsCount;

        var possibleResult = searchResults[getHash(string)];
        if (typeof possibleResult != 'undefined') {
            return onSearchResult(string, possibleResult);
        }

        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            data: request,
            success: callback
        })
    }
})(jQuery, _);