var site = {};

site.utils = {};
site.utils.getObjectType = function(obj) {
	var toString = Object.prototype.toString,
		obj_type = false;
	switch (toString.call(obj)) {
		case "[object Array]": obj_type = 'array'; break;
		case "[object Object]": obj_type = 'object'; break;
		case "[object String]": obj_type = 'string'; break;
		case "[object Number]": obj_type = 'number'; break;
		case "[object Boolean]": obj_type = 'boolean'; break;
		case "[object Function]": obj_type = 'function'; break;
	}
	return obj_type;
};

site.utils.js = {};
site.utils.js.init = function(src) {
	switch (site.utils.getObjectType(src)) {
		case "array": for (i in src) this.init(src[i]); break;
		case "string": this.include(src); break;
	}
	return true;
};

site.utils.js.include = function(src) {
	jQuery("<script/>", {
		"charset" : 'utf-8',
		"type"    : 'text/javascript',
		"src"     : src
	}).appendTo("head");
};

site.utils.js.init([
	'/templates/demodizzy/js/underscore-min.js',
	'/js/client/basket.js',
	'/templates/demodizzy/js/basket.js',
	//'/templates/demodizzy/js/forms.js',
	//'/templates/demodizzy/js/message.js',
	//'/templates/demodizzy/js/captcha.js',
	//'/templates/demodizzy/js/filters.js',
	//'/templates/demodizzy/js/search.js'
]);

jQuery(document).ready(function(){
	
	jQuery('#on_edit_in_place').click(function() {
		uAdmin.eip.swapEditor();
		return false;
	});
	
	jQuery('.slab, .list', '.catalog .change').click(function() {
		if (!jQuery(this).hasClass('act')) {
			jQuery('div', this.parentNode).removeClass('act');
			jQuery(this).addClass('act');
			if (jQuery(this).hasClass('list')) {
				jQuery('.catalog').addClass('list_view');
				jQuery.cookie('catalog', 'list_view', {path: '/'});
			}
			else {
				jQuery('.catalog').removeClass('list_view');
				jQuery.cookie('catalog', null, {path: '/'});
			}
		}
	});

	jQuery('a', '.catalog .change .sort').click(function() {
		var reactive = jQuery(this).hasClass('reactive');
		if(jQuery('.content .numpages').get(0)) {
			if(jQuery(this).hasClass('sort-price')) {
				jQuery.cookie('sort_field', 'Price', {path: '/'});
			} else if( jQuery(this).hasClass('sort-name') ) {
				jQuery.cookie('sort_field', 'Name', {path: '/'});
			} else if( jQuery(this).hasClass('sort-stock') ) {
				jQuery.cookie('sort_field', 'Stock', {path: '/'});
			}
			if(reactive) {
				jQuery.cookie('sort_direction', '0', {path: '/'});
			} else {
				jQuery.cookie('sort_direction', '1', {path: '/'});
			}
			location.reload(true);

		} else {
			var contain = jQuery('.catalog .objects'),
				objects = jQuery('.object', contain),
				targets = [], sorted = [], i = 0,
				find = function(array, value) {
					for(var i=0; i<array.length; i++) {
						if (array[i] == value) return i;
					}
					return -1;
				},
				getRandomFloat = function(min, max) {
					return Math.random() * (max - min) + min;
				},
				sorting = function(turn, sortFunc, targetType) {
					objects.each(function() {
						var _self = jQuery(this).removeClass('center').detach();
						
						var avail = 1000;
						if( jQuery('.notInStock', _self).length == 1 ) {
							var avail = 1;
						}
						
						if( targetType == 'price' ) {
							target =  +jQuery('div.price span', _self).text().match(/[-+]?[0-9]*\.?[0-9]+/);
						} else if ( targetType == 'name') {
							target = jQuery('a.title', _self).text().toLowerCase().trim();
						} else {
							target = avail;
						}
						_rand = find(targets, target) != -1 ? getRandomFloat(0.01, 0.001) : 0;
						sorted[target + _rand] = _self;
						targets[targets.length] = target + _rand;
					});
					
					if( typeof( sortFunc ) == 'function' ) {
						targets.sort(sortFunc);
					} else {
						targets.sort();
					}
					
					contain.html('');
					if(turn) targets.reverse();

					for(; i < targets.length; i++) {
						contain.append(sorted[targets[i]]);
						if(i % 3 == 1)
							sorted[targets[i]].addClass('center');
						else if (i % 3 == 2 && i != targets.length - 1)
							contain.append('<hr />');
					}
				};
			if (jQuery(this).hasClass('sort-price')) {
				sorting(reactive, function(a,b){return a-b}, 'price');
				jQuery.cookie('sort_field', 'Price', {path: '/'});
			} else if (jQuery(this).hasClass('sort-name')) {
				sorting(reactive, null, 'name');
				jQuery.cookie('sort_field', 'Name', {path: '/'});
			} else {
				sorting(reactive);
				jQuery.cookie('sort_field', 'Stock', {path: '/'});
			}

			jQuery('a', this.parentNode).removeClass('active').removeClass('reactive');
			if (reactive) {
				jQuery(this).addClass('active');
				jQuery.cookie('sort_direction', '0', {path: '/'});
			} else {
				jQuery(this).addClass('reactive');
				jQuery.cookie('sort_direction', '1', {path: '/'});
			}
		}
	});
	
	jQuery('.votes div a').click(function(){
		var block = jQuery(this).parents('.votes');
		if(block.hasClass('vote')) {
			var element_id = block.get(0).className.split(' ').pop().split('_').pop();
			var params = this.parentNode.className.split(' ');
			jQuery.ajax({
				url: "/udata://vote/setElementRating//" + element_id + "/" + params[0].split('_').pop() + ".json",
				type: "GET",
				dataType : 'json',
				success: function(result){
					jQuery('div', block).each(function() {
						jQuery(this).removeClass(params[1]).addClass('current_' + result.ceil_rate);
					});
					block.removeClass('vote').attr('title', i18n.vote_already_voted);
					jQuery('span', block).text(i18n.vote_rating);
				}
			});
		}
		return false;
	});
	
	jQuery('tr[class^="cart_item_"]:odd').addClass('even');
	jQuery('tr[class^="cart_item_"]:odd + .related-goods').addClass('even');


	jQuery('a[href="#callback_form"]').click(function() {
		var url = '/udata//webforms/add/Заказать%20звонок/?transform=modules/webforms/add_popup.xsl';
		jQuery.ajax({
			url: url,
			dataType: 'html',
			success: function (data) {
				var isMessageCreated = site.message({
					id: 'callback_form',
					header: 'Заказать звонок',//i18n.basket_options,
					width: 500,
					content: data,
					async: false
				});
				if (isMessageCreated == true) {
					jQuery('.i18n').each(function() {
						var label = jQuery(this).text();
						jQuery(this).text(i18n[label]);
					});
					jQuery('#captcha_reset').click(function(){
						var d = new Date();
						jQuery('#captcha_img').attr('src', '/captcha.php?reset&' + d.getTime());
					});
					jQuery('input, textarea, select', '#callback_form label.required').focusout(function() {
						site.forms.errors.check(this);
					});
				}
			}
		});

		return false;
	});

});