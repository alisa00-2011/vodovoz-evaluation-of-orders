var YandexMaps = (function(window, undefined) {

    'use strict';

    var pinSvg = '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="nonzero"><circle fill="#0076C0" cx="16" cy="16" r="16"/><circle fill="#FFF" cx="16" cy="16" r="10"/><circle fill="#0076C0" cx="16" cy="16" r="4"/></g></svg>',
        clusterSvg = '<svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="nonzero"><circle fill="#0076C0" cx="21" cy="21" r="21"/><circle fill="#FFF" cx="21" cy="21" r="15"/></g></svg>';

    function init() {

        // Address map
        address({
            selector: '.b-addressMap'
        });

        // Simple map
        outposts({
            selector: '.b-outpostsMap'
        });

    }

    function address(settings) {

        settings = !!settings ? settings : {};

        settings.namespace = !!settings.namespace ? settings.namespace + ' ' : '';
        settings.selector = !!settings.selector ? settings.selector : '.b-map';

        settings.collection = !!settings.collection ? settings.collection : $(settings.namespace + settings.selector);

        if (ymaps !== 'undefined' && !!ymaps) {

            ymaps.ready(function () {

                settings.collection.each(function() {

                    var $map = $(this).empty(),

                        map = new ymaps.Map($map.attr('id'), {
                            center: [59.939095, 30.315868],
                            zoom: $map.data('zoom') || 16,
                            controls: $map.data('controls') || ['fullscreenControl']
                        }),

                        objectManager = new ymaps.ObjectManager(),
                        collection;

                    map.element = $map;

                    // Drag behavior
                    if (helpers.isTouchDevice()) {

                        map.behaviors.disable('drag');

                    }

                    // Zoom control
                    map.controls.add('zoomControl', {
                        float: 'none',
                        size: !!$map.data('zoomSize') ? ['md', 'lg'].breakPoint() ? 'large' : 'small' : 'large',
                        position: {
                            right: 10,
                            top: ($map.height() / 2) - (!!$map.data('zoomSize') ? ['md', 'lg'].breakPoint() ? 103 : 30 : 103)
                        }
                    });

                    // Search control
                    var searchControl = new ymaps.control.SearchControl({
                        options: {
                            noPlacemark: true,
                            placeholderContent: 'Введите здесь адрес доставки'
                        }
                    });

                    searchControl.events.add('resultselect', function(e) {

                        var index = e.get('index'), address, fullAddress, coordinates;

                        searchControl.getResult(index).then(function(res) {

                            address = res.properties.get('name');
                            fullAddress = res.properties.get('text');
                            coordinates = res.geometry.getCoordinates();

                            $('.js-delivery-address')
                                .val(fullAddress).trigger('change').trigger('refresh.validate')
                                .closest('.b-checkout_map_address').removeClass('hidden');

                            $('.js-delivery-address-text').text(address);

                            _userPlaceMark.call(map, coordinates);

                        });

                    });

                    map.controls.add(searchControl);

                    // Click on map
                    map.events.add('click', function(e) {

                        var coordinates = e.get('coords');

                        _getAddress(coordinates);

                        map
                            .panTo(coordinates)
                            .then(function() {

                                _userPlaceMark.call(map, coordinates);

                            });

                    });

                    // Init user address
                    var currentAddress = $('.js-delivery-address').val();

                    if (currentAddress !== '') _geoQuery.call(map, currentAddress);

                });

                function _userPlaceMark(coordinates) {

                    var $map = this.element, map = this;

                    if (!!$map.data('userPlaceMark')) {

                        $map.data('userPlaceMark').geometry.setCoordinates(coordinates);

                    }
                    else {

                        $map.data('userPlaceMark', new ymaps.Placemark(coordinates, { id: 'userAddress' }, { preset: 'islands#blueDotIcon', draggable: true }));

                        $map.data('userPlaceMark').events.add('dragend', function () {

                            var newCoordinates = $map.data('userPlaceMark').geometry.getCoordinates();

                            map.panTo(newCoordinates);
                            _getAddress(newCoordinates);

                        });

                        map.geoObjects.add($map.data('userPlaceMark'));

                    }

                }

                function _getAddress(coordinates) {

                    ymaps
                        .geocode(coordinates)
                        .then(function(res) {

                            var object = res.geoObjects.get(0),

                                address = object.properties.get('name'),
                                fullAddress = object.getAddressLine();

                            $('.js-delivery-address')
                                .val(fullAddress).trigger('change').trigger('refresh.validate')
                                .closest('.b-checkout_map_address').removeClass('hidden');

                            $('.js-delivery-address-text').text(address);

                        });

                }

                function _geoQuery(address) {

                    var map = this;

                    ymaps
                        .geocode(address, { results: 1 })
                        .then(function(res) {

                            var object = res.geoObjects.get(0),
                                coordinates = object.geometry.getCoordinates();

                            _userPlaceMark.call(map, coordinates);

                        });

                }

            }); //ymaps.ready end scope

        }

    }

    function outposts(settings) {

        settings = !!settings ? settings : {};

        settings.namespace = !!settings.namespace ? settings.namespace + ' ' : '';
        settings.selector = !!settings.selector ? settings.selector : '.b-map';

        settings.collection = !!settings.collection ? settings.collection : $(settings.namespace + settings.selector);

        if (ymaps !== 'undefined' && !!ymaps) {

            ymaps.ready(function () {

                settings.collection.each(function() {

                    var $map = $(this).empty(),

                        map = new ymaps.Map($map.attr('id'), {
                            center: [59.939095, 30.315868],
                            zoom: $map.data('zoom') || 16,
                            controls: $map.data('controls') || ['fullscreenControl', 'searchControl']
                        }),

                        objectManager = new ymaps.ObjectManager({
                            clusterize: !!$map.data('clusterize'),
                            gridSize: 120
                        }),

                        collection;

                    map.element = $map;

                    // Drag behavior
                    if (helpers.isTouchDevice()) {

                        map.behaviors.disable('drag');

                    }

                    // Zoom control
                    map.controls.add('zoomControl', {
                        float: 'none',
                        size: !!$map.data('zoomSize') ? ['md', 'lg'].breakPoint() ? 'large' : 'small' : 'large',
                        position: {
                            right: 10,
                            top: ($map.height() / 2) - (!!$map.data('zoomSize') ? ['md', 'lg'].breakPoint() ? 103 : 30 : 103)
                        }
                    });

                    // Get points data
                    if (!!$map.data('source') && !$map.data('clusterize')) {

                        collection = {
                            type: 'FeatureCollection',
                            features: []
                        };

                        var src = window[$map.data('source')];

                        $.each(src, function(key, value) {

                            collection.features.push(processingSource.call(value, key));

                        });

                        objectManager.add(collection);
                        map.geoObjects.add(objectManager);

                    }
                    else if (!!$map.data('source') && !!$map.data('clusterize')) {

                        collection = {
                            type: 'FeatureCollection',
                            features: []
                        };

                        $.each(window[$map.data('source')], function(key, value) {

                            collection.features.push(processingSource.call(value));

                        });

                        objectManager.clusters.options.set({
                            clusterIcons: [
                                {
                                    href: '',
                                    size: [42, 42],
                                    offset: [-21, -21]
                                }
                            ],
                            clusterNumbers: [300],
                            clusterDisableClickZoom: false,
                            clusterIconContentLayout: ymaps.templateLayoutFactory.createClass('<div class="b-map_cluster">' + clusterSvg + '<span class="b-map_cluster_content">$[properties.geoObjects.length]</span></div>')
                        });

                        objectManager.add(collection);
                        map.geoObjects.add(objectManager);

                    }

                    map.setBounds(map.geoObjects.getBounds());

                    if (objectManager.objects.getLength() === 1 && !!map.element.data('zoom'))  {

                        map.setZoom(map.element.data('zoom'));

                    }

                    $map.data('mapInstance', map);
                    $map.data('objectManager', objectManager);

                    setCorrectBounds.call($map);

                    // Outpost events
                    objectManager.objects.events.add('click', function(e) {

                        var id = e.get('objectId'),
                            object = objectManager.objects.getById(id);

                        $('.js-outpost-id')
                            .val(id)
                            .trigger('change').trigger('refresh.validate');

                        $('.js-outpost-info')
                            .html(object.properties.outpostInfo)
                            .closest('.b-checkout_map_address').removeClass('hidden');

                    });

                });

            }); //ymaps.ready end scope

        }

    }

    function processingPoint() {

        var id = this.data('id') || helpers.randomString(6),
            color = this.data('color') || 'default',

            data = {
                id: id,
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: this.data('coordinates') || [0, 0]
                },
                options: {
                    hideIconOnBalloonOpen: false,
                    balloonShadow: false,
                    balloonAutoPan: false
                },
                properties: {
                    id: id,
                    color: color,
                    balloonContent: !this.is('.b-map') ? !this.data('noBalloon') ? $('<div />').append(this.clone()).html() : false : false,
                    entrance: this.data('customMarkEntrance') || false
                }
            },

            markerLayoutId = 'VV#marker' + id.toString().capitalizeFirstLetter();

        // Marker
        if (!!this.data('customMark')) {

            var label = !!this.data('label') ? '<div class="b-map_marker_label">' + this.data('label') + '</div>' : '';

            ymaps.layout.storage.add(markerLayoutId, ymaps.templateLayoutFactory.createClass(
                '<div class="b-map_marker[if properties.hidden] hidden[endif][if properties.color] $[properties.color][endif]">' + label + pinSvg + '</div>'));

            $.extend(data.options, {
                iconLayout: markerLayoutId,
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [
                        [-16, -16], [16, 16]
                    ]
                }
            });

        }
        else {

            $.extend(data.options, {
                preset: 'islands#blueDotIcon'
            });

        }

        return data;

    }

    function processingSource(i) {

        var id = this.id || helpers.randomString(6),

            data = {
                type: 'Feature',
                id: id,
                geometry: this.geometry,
                options: {
                    hideIconOnBalloonOpen: false,
                    balloonShadow: false,
                    balloonAutoPan: true
                },
                properties: {
                    id: id,
                    customMark: true,
                    customBalloon: typeof this.properties.balloonContent !== 'undefined' ? this.properties.balloonContent : true,
                    entrance: false
                }
            },

            markerLayoutId = 'VV#marker' + id.toString().capitalizeFirstLetter();

        // Extend
        $.extend(data.options, this.options);
        $.extend(data.properties, this.properties);

        // Marker
        if (data.properties.customMark) {

            var label = !!data.properties.label ? '<div class="b-map_marker_label">' + data.properties.label + '</div>' : '';

            ymaps.layout.storage.add(markerLayoutId, ymaps.templateLayoutFactory.createClass(
                '<div class="b-map_marker[if properties.hidden] hidden[endif][if properties.color] $[properties.color][endif]">' + label + pinSvg + '</div>'));

            $.extend(data.options, {
                iconLayout: markerLayoutId,
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [
                        [-16, -16], [16, 16]
                    ]
                }
            });

        }
        else {

            $.extend(data.options, {
                preset: 'islands#blueDotIcon'
            });

        }

        // Balloon
        if (data.properties.customBalloon) {

            var balloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="b-map_balloon"><span class="b-map_balloon_close i-icon i-close"></span><div class="b-map_balloon_inner">$[[options.contentLayout observeSize minWidth=300 maxWidth=584]]</div></div>', {
                    build: function () {

                        this.constructor.superclass.build.call(this);
                        this._$element = $('.b-map_balloon', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.b-map_balloon_close')
                            .on('click', $.proxy(this.onCloseClick, this));

                    },
                    clear: function () {

                        this._$element.find('b-map_balloon_close').off('click');
                        this.constructor.superclass.clear.call(this);

                    },
                    onSublayoutSizeChange: function () {

                        balloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if(!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();
                        this.events.fire('shapechange');

                    },
                    applyElementOffset: function () {

                        this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2), top: -(this._$element[0].offsetHeight + 56)
                            //left: '100%', marginLeft: 35, top: '50%', marginTop: -(this._$element[0].offsetHeight / 2) - 21
                        });

                    },
                    onCloseClick: function (e) {

                        e.preventDefault();
                        this.events.fire('userclose');

                    },
                    getShape: function () {

                        if(!this._isElement(this._$element)) {
                            return balloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + 34
                            ]
                        ]));

                    },
                    _isElement: function (element) {
                        return element && element[0] && element.find('.b-map_balloon_arrow')[0];
                    }
                }),

                balloonContentLayout = ymaps.templateLayoutFactory.createClass('<div class="b-map_balloon_content">$[properties.balloonContent]</div>');

            $.extend(data.options, {
                balloonShadow: false,
                balloonLayout: balloonLayout,
                balloonContentLayout: balloonContentLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,
                openBalloonOnClick: false
            });

        }

        return data;

    }

    function setCorrectBounds() {

        var $map = this,

            map = $map.data('mapInstance'),
            objectManager = $map.data('objectManager');

        setBoundsCenter();
        $(window).on('resize.clinicsOnMapCenter', function() {

            helpers.delay.call($map, setBoundsCenter, 200, 'setCenter-');

        });

        function setBoundsCenter() {

            map.setBounds(map.geoObjects.getBounds());

            if (['sm', 'md'].breakPoint()) {

                map.setZoom(map.getZoom() - 1);

            }

            if (objectManager.objects.getLength() === 1 && !!map.element.data('zoom'))  {

                map.setZoom(map.element.data('zoom'));

            }

        }

        // Correct center
        correct();

        $(window).on('resize.clinicsOnMapCenterCorrect', function() {

            helpers.delay.call($map, correct, 250, 'correctCenter-');

        });

        function correct() {

            if ($map.data('offsets')) {

                var $pageContainer = $map.closest('.container'),

                    x = $map.data('offsets')[helpers.screen()][0],
                    y = $map.data('offsets')[helpers.screen()][1];

                $pageContainer = $pageContainer.length ? $pageContainer : $('.container').first();

                x = typeof x === 'string' ? $pageContainer.width() * (parseFloat(x) / 100) : x;
                y = typeof y === 'string' ? $map.outerHeight() * (parseFloat(y) / 100) : y;

                map.setCenterWithOffset(x, y);

            }

        }

    }

    return {
        init: init,
        setCorrectBounds: setCorrectBounds
    };

})(window);