site.basket = {};

site.basket.replace = function(id) {
	if (id == 'all') {
		jQuery('a[id^="add_basket_"]').each(function() {
			$(this).text(i18n.basket_add_button)
			jQuery('.basket_info_summary').text(i18n.basket_empty);
		});
	}
	return function(e) {
		var text, discount, goods_discount_price, goods_discount, item_total_price, item_discount, cart_item, basket, i, item, related_goods,
			cart_summary = jQuery('.cart_summary'),
			cart_discount = jQuery('.cart_discount'),
			goods_discount_price = jQuery('.cart_goods_discount'),
			rem_item = true,
			detect_options = {};

		if (e.summary.amount > 0) {
			text = e.summary.price.actual;
			goods_discount = ((typeof e.summary.price.original == 'undefined') ? e.summary.price.actual : e.summary.price.original);
			discount = ((typeof e.summary.price.discount != 'undefined') ? e.summary.price.discount : '0');
			for (i in e.items.item) {
				item = e.items.item[i];
				if (item.id == id) {
					rem_item = false;
					item_total_price = item["total-price"].actual;
					item_discount = ((typeof item.discount != 'undefined') ? item.discount.amount : '0');
				}
				if (item.page.id == id) {
					if (detect_options.amount) {
						detect_options.amount = detect_options.amount + item.amount;
					}
					else detect_options = {'id':id, 'amount':item.amount};
				}
			}
			if (detect_options.amount) {
				var add_basket_button = jQuery('#add_basket_' + detect_options.id);
				if (add_basket_button[0].tagName.toUpperCase() == 'A' && !site.basket.is_cart) {
					add_basket_button.text(i18n.basket_add_button + ' (' + detect_options.amount + ')');
				}
				if (add_basket_button[0].tagName.toUpperCase() == 'FORM') {
					add_basket_button = jQuery('input:submit', add_basket_button);
					add_basket_button.val(i18n.basket_add_button + ' (' + detect_options.amount + ')');
				}
				else add_basket_button.val(i18n.basket_add_button + ' (' + detect_options.amount + ')');
			}
			if (rem_item) {
				if (cart_item = jQuery('.cart_item_' + id)) {
					if(related_goods = jQuery('.cart_item_' + id + ' + tr.related-goods')) {
						related_goods.remove();
					}
					cart_item.remove();
					cart_summary.text(text);
					cart_discount.text(discount);
					goods_discount_price.text(goods_discount);
					jQuery('.basket tr').removeClass('even');
					jQuery('tr[class^="cart_item_"]:odd').addClass('even');
					jQuery('tr[class^="cart_item_"]:odd + .related-goods').addClass('even');
				}
			}
			else {
				jQuery('.cart_item_price_' + id).text(item_total_price);
				jQuery('.cart_item_discount_' + id).text(item_discount);
				cart_summary.text(text);
				cart_discount.text(discount);
				goods_discount_price.text(goods_discount);
			}
			text = text || 0;
			text = e.summary.amount + i18n.basket_items_total + (e.summary.price.prefix||'') + ' ' + (text + 0) + ' ' + (e.summary.price.suffix||'');
		}
		else {
			text = i18n.basket_empty;
			if (basket = jQuery('.basket')) {
				basket.html(i18n.basket_empty_html);
			}
		}
		jQuery('.basket_info_summary').text(text);
		site.basket.modify.complete = true;
	};
};

site.basket.add = function(id, form, popup) {
	var e_name, options = {};
	if (form) {
		var elements = jQuery(':radio:checked', form);
		for (var i = 0; i < elements.length; i++) {
			e_name = elements[i].name.replace(/^options\[/, '').replace(/\]$/, '');
			options[e_name] = elements[i].value;
		}
	}
	basket.putElement(id, options, this.replace(id));
	if (popup) {
		site.message.close(jQuery('#add_options_' + id), jQuery('.overlay'))
	}
};

site.basket.list = function(link) {
	var oneClick = false;
	var id = (link.id.indexOf('add_basket') != -1) ? link.id.replace(/^add_basket_/, '') : false;
	if (!id) {
		oneClick = true;
		id = (link.id.indexOf('one_click') != -1) ? link.id.replace(/^one_click_/, '') : link;
	}
	if (!id) return false;
	if (jQuery(link).hasClass('options_true')) {
		var url = '/upage//' + id + '?transform=modules/catalog/popup-add-options.xsl';
		if (oneClick) {
			url = '/upage//' + id + '?transform=modules/catalog/popup-add-options-oneclick.xsl';
		}
		if (jQuery('#add_options_' + id).length == 0) {
			jQuery.ajax({
				url: url,
				dataType: 'html',
				success: function (data) {
					var isMessageCreated = site.message({
						id: 'add_options_' + id,
						header: i18n.basket_options,
						width: 400,
						content: data,
						async: false
					});
					if (isMessageCreated == true) {
						var form = jQuery('form.options');
						form.append('<input type="submit" class="button" value="'+ i18n.basket_add_short +'" />');
						form.submit(function() {
							if (!site.basket.is_cart && !oneClick) {
								site.basket.add(id, this, true);
							} else if(!site.basket.is_cart && oneClick) {
								site.basket.oneClick(id, this);
								site.message.close(jQuery('#add_options_' + id), jQuery('.overlay'))
							} if( site.basket.is_cart ) {
								return true;
							}
							return false;
						});
					}
				}
			});
		}
	}
	else if(!oneClick) {
		this.add(id);
	} else {
		site.basket.oneClick(id);
	}
};

site.basket.modify = function(id, amount_new, amount_old) {
	if (amount_new.replace(/[\d]+/) == 'undefined' && amount_new != amount_old) {
		basket.modifyItem(id, {amount:amount_new}, this.replace(id));
	}
	else this.modify.complete = true;
};

site.basket.modify.complete = true;

site.basket.remove = function(id) {
	if (id == 'all') basket.removeAll(this.replace(id));
	else basket.removeItem(id, this.replace(id));
};

site.basket.oneClick = function(id, form) {
	var option = $(form).find('input[type="radio"]:checked');
	var optional;
	if (option.length > 0) {
		optional = '?' + option.attr('name') + '=' + $(form).find('input[type="radio"]:checked').val()
	} else {
		optional = '';
	}

	var locale = location.pathname;
	var lang = locale.substring(1,locale.substring(1).indexOf('/')+1);

	jQuery.ajax({
		url: '/udata/emarket/createForm/emarket-purchase-oneclick?transform=modules/catalog/one-click.xsl&lang=' + lang,
		dataType: 'html',
		success: function (data) {
			var isMessageCreated = site.message({
				id: 'one_click_popup_' + id,
				header: i18n.oneclick_checkout,
				width: 400,
				content: data,
				async: false
			});
			if (isMessageCreated == true) {
				var form = jQuery('form.buyer_data');
				form.attr('action', form.attr('action') + 'element/' + id + '.xml' + optional)
				form.append('<div><input type="submit" class="button big" value="' + i18n.checkout + '" /></div>');
				form.submit(function() {
					var xml = site.basket.sendForm(form).responseXML;

					form.closest('.content').find('.error').remove();
					$(xml).find('error').each(
						function() {
							form.closest('div').prepend('<div class="error">' + $(this).text() + '</div>');
						}
					);

					form.closest('.content').find('.success').remove();
					if ($(xml).find('orderId').length > 0) {
						site.basket.replace('all');
						form.closest('div').prepend('<div class="success"><div><p>' + i18n.finish_message_prefix + '<strong>#' + $(xml).find('orderId').eq(0).text() + '</strong>' + i18n.finish_message_postfix + '</p></div><a class="button big close">' + i18n.continue + '</a></div>');
						form.remove();
					}

					return false;
				});
			}
		}
	});
}

site.basket.sendForm = function(form) {
	return jQuery.ajax({
		url: form.attr('action'),
		dataType: 'xml',
		method: form.attr('method'),
		data: form.serialize(),
		async: false,
		success: function (data) {
			return data;
		}
	});
}

site.basket.init = function() {
	this.is_cart = (!!jQuery('.basket table').length);
	jQuery('.basket_list').click(function(){
		if (!site.basket.is_cart || !jQuery(this).hasClass('options_false')) {
			site.basket.list(this);
			return false;
		}
	});
	jQuery('form.options').submit(function(){
		var id = (this.id.indexOf('add_basket') != -1) ? this.id.replace(/^add_basket_/, '') : this;
		site.basket.add(id, this);
		return false;
	});
	jQuery('div.basket a.del').click(function(){
		site.basket.remove(this.id.match(/\d+/).pop());
		return false;
	});
	jQuery('div.basket a.basket_remove_all').click(function(){
		site.basket.remove('all');
		return false;
	});
	jQuery('div.basket input.amount').bind('keyup', function() {
		if(0 > parseInt(this.value))
			this.value = Math.abs(this.value);
		if (site.basket.modify.complete) {
			site.basket.modify.complete = false;
			var amountThis = this;
			setTimeout(function() {
				var id = parseInt(amountThis.parentNode.parentNode.className.split('_').pop()),
				e = jQuery(amountThis).next('input'),
				old = e.val();
				e.val(amountThis.value);
				site.basket.modify(id, amountThis.value, old);
			}, 500)
		}
	});
	jQuery('.top, .bottom', '.change-amount').click(function(){
		if (site.basket.modify.complete) {
			site.basket.modify.complete = false;
			var id = parseInt(this.parentNode.parentNode.parentNode.className.split('_').pop()),
				e = jQuery(this).parent().prev(),
				old = e.val();
			if (this.className == 'top') {
				e.val(parseInt(old) + 1);
			} else {
				e.val(parseInt(old) - 1);
			}
			e.prev().val(e.val());
			site.basket.modify(id, e.val(), old);
		}
	});
};

jQuery(document).ready(function(){site.basket.init()});