/** Виджет выбора способа доставки у ApiShip */
(function () {
	var infoBuilder,
		$form = $('form#deliverySettingsForm'),
		widget = {},
		$infoPanel = $('#order_delivery_apiship'),
		$widgetPanel = $('#apiShipWidget'),
		hiddenInputTpl = '';

	$.get('/templates/demodizzy/js/hiddenInputTpl.html', function (data) {
		hiddenInputTpl = _.template(data);
	});

	infoBuilder = new prettyInfoAboutDelivery({
		deliveryId: ApiShipId,
		showCost: true,
		onBuildDom: function (result) {
			$('#order_delivery_apiship').append($(result));
		}
	});

	if ($('input[name="delivery-id"][data-api="api-ship"]').attr('checked')) {
		$widgetPanel.show();
		$infoPanel.show();
	}

	$('input[name="delivery-id"]').on('change', function (e) {
		if ($(e.currentTarget).attr('checked') && $(e.currentTarget).attr('data-api') == 'api-ship') {
			$widgetPanel.show();
			$infoPanel.show();
		} else {
			$widgetPanel.hide();
			$infoPanel.hide();
		}
	});

	$.ajax({
		url: '//' + window.location.host + '/udata://emarket/getOrderDeliveryAddress/.json',
		dataType: 'json'
	})
		.done(function (res) {
			var city = res.result.city;
			widget = new widgetApiShipDelivery({
				el: '#apiShipWidget',
				orderId: basketOrderId,
				deliveryId: ApiShipId,
				city: city,
				onSelect: updateDeliveryInfo,
				disableCloseButton: true,
				disableToDoorSlider: true
			});
		});

	$form.submit(function () {
		var $radio = $('input[name=delivery-id]:checked');
		if ($radio.attr('data-api') === 'api-ship') {
			if (!widget.validate()) {
				alert(getLabel('js-choose-error-tariff-point-no-select'));
				return false;
			}
		}
		return true;
	});

	function updateDeliveryInfo(params) {
		if (widget.validate()) {
			$('#order_delivery_apiship').html($(hiddenInputTpl(params)));
			infoBuilder.updateInfo(params);
		} else {
			alert(getLabel('js-choose-error-tariff-no-select'));
		}
	}
})();