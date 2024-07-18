site.forms = {};

/** Добавляет события формам */
site.forms.init = function () {
	var context = jQuery('label.required').closest("form");
	jQuery('input, textarea, select', context).focusout(function() {
		site.forms.errors.check(this);
	});
	
	
	site.forms.data.restore();
	site.forms.comments.init();
	if (location.href.indexOf('forget') != -1) {
		jQuery('#forget input:radio').click(function() {
			jQuery('#forget input:text').attr('name', jQuery(this).attr('id'));
		});
	}
	else if (location.href.indexOf('purchasing_one_step') != -1) {
		var blocks = [
			'.customer.onestep', '.delivery_address.onestep', 
			'.dychoose.onestep', '.payment.onestep', 
		],
			form = jQuery('.without-steps'),
			options = {blocks: blocks, form: form};
	
		site.forms.emarket.purchasingOneStep.init(options);
	} else if (location.href.indexOf('purchase') != -1) {
		site.forms.emarket.purchase();
	}
};

site.forms.data = {};

site.forms.data.save = function (form) {
	if (!form && !form.id) return false;
	var str = "", input, inputName, i, opt_str = "", o;
	for (i = 0; i < form.elements.length; i++) {
		input = form.elements[i];
		if (input.name) {
			inputName = input.name.replace(/([)\\])/g, "\\$1");
			switch (input.type) {
				case "password":break;
				case "text":
				case "textarea": str += 'TX,' + inputName + ',' + input.value; break;
				case "checkbox":
				case "radio": str += 'CH,' + input.id + ',' + (input.checked ? 1 : 0); break;
				case "select-one": str += 'SO,' + inputName + ',' + input.selectedIndex; break;
				case "select-multiple": {
					for (o = 0; o < input.options.length; o++) {
						if (input.options[o].selected) {
							opt_str += input.options[o].value;
							if (o < (input.options.length - 1)) opt_str += ":";
						}
					}
					str += 'SM,' + inputName + ',' + opt_str; break;
				}
			}
			if (i < (form.elements.length - 1)) str += "+";
		}
	}
	jQuery.cookie("frm" + form.id, str.replace(/([|\\])/g, "\\$1"));
	return true;
};

site.forms.data.restore = function () {
	var forms = jQuery('form'), i, j, element, data;
	for (i = 0; i < forms.length; i++) {
		if (forms[i].id && (data = jQuery.cookie("frm" + forms[i].id))) {
			data = data.split('+');
			for (j = 0; j < data.length; j++) {
				element = data[j].split(',');
				if (!element) continue;
				switch (element[0]) {
					case "PW": break;
					case "TX": forms[i].elements[element[1]].value = element[2]; break;
					case "CH": document.getElementById(element[1]).checked = (element[2] == 1) ? true : false; break;
					case "SO": forms[i].elements[element[1]].selectedIndex = element[2]; break;
					case "SM":
						var options = forms[i].elements[element[1]].options;
						var opt_arr = element[2].split(":"), op, o;
						for (op = 0; op < options.length; op++)
							for (o = 0; o < opt_arr.length; o++)
								if (opt_arr[o] && (options[op].value == opt_arr[o]))
									options[op].selected = true;
						break;
				}
			}
		}
	}
	return true;
};

site.forms.comments = {};

site.forms.comments.init = function() {
	var blog_comm = jQuery('#comments');
	var blog_comm_arr, i;
	if (typeof blog_comm[0] == 'object') {
		blog_comm_arr = jQuery('a.comment_add_link', blog_comm[0]);
		for (i = 0; blog_comm_arr.length > i; i++) {
			blog_comm_arr[i].onclick = site.forms.comments.add(blog_comm_arr[i]);
		}
	}
};

site.forms.comments.add = function(element) {
	return (function() {site.forms.comments.setAction(element.id);});
};

site.forms.comments.setAction = function(comm_id) {
	var comment_add_form;
	if ((comment_add_form = jQuery('#comment_add_form'))) {
		comment_add_form[0].action = '/blogs20/commentAdd/' + comm_id;
		return true;
	}
	return false;
};

site.forms.vote = function(form, vote_id) {
	var res = false;
	for (var i = 0; form.elements.length > i; i++)
		if (form.elements[i].checked)
			res = form.elements[i].value;
	if (res) {
		jQuery.ajax({
			url : '/vote/post/' + res + '/?m=' + new Date().getTime(),
			dataType: 'html',
			success: function(data){eval(data)}
		});
		jQuery.ajax({
			url: '/udata://vote/results/' + vote_id + '/?transform=modules/vote/results.xsl&m=' + new Date().getTime(),
			dataType: 'html',
			success: function(data){
				var block = jQuery(form.parentNode).html(data);
				jQuery('.total', block).text(i18n.vote_total_votes);
			}
		});
	}
	else alert(i18n.vote_no_element);
};

site.forms.errors = {};

/**
 * Генерация ошибок
 *
 * @param {Object} element Проверяемый элемент формы
 * @param {Number} num Позиция элемента формы
 * @param {Boolean} bool Сообщение об ошибке
 * @return {Boolean} Результат корректности заполнения
 */
site.forms.errors.check = function(element, bool) {
	var _err, empty_err = i18n.forms_empty_field; 
	if(element.parentNode.className != 'required') return false;
	switch (element.name) {
		case "login": {
			switch (element.value.length) {
				case 0: _err = empty_err; break;
				case 1:
				case 2: _err = i18n.forms_short_login; break;
				default: {
					if (element.value.length > 40) _err = i18n.forms_long_login;
				}
			}
			break;
		}
		case "password": {
			switch (element.value.length) {
				case 0: _err = empty_err; break;
				case 1:
				case 2: _err = i18n.forms_short_pass; break;
				default: {
					if (element.form.elements['login'].value == element.value)
						_err = i18n.forms_same_pass;
				}
			}
			break;
		}
		case "password_confirm": {
			if (element.value.length == 0) _err = empty_err;
			else if (element.form.elements['password'].value !== element.value) {
				_err = i18n.forms_confirm_pass;
			}
			break;
		}
		case "email": {
			if (element.value.length == 0) _err = empty_err;
			else if (!element.value.match(/.+@.+\..+/)) _err = i18n.forms_invalid_email;
			//else if (typeof num != 'undefined'); //checkUserEmail callback
			break;
		}
		default: {
			if (element.value.length == 0) _err = empty_err;
			if (element.name.match(/^.*e.*mail.*$/) && element.name != 'email_to' && element.name != 'system_email_to')
				if (!element.value.match(/.+@.+\..+/)) _err = i18n.forms_invalid_email;
		}
	}
	if (bool) {
		return !_err;
	} else {
		return site.forms.errors.write(_err, element);
	}
};

site.forms.errors.write = function (_err, element) {
	var cont = element.parentNode.parentNode;
	jQuery('div.formErr', cont).remove();
	if (_err) {
		var err_block = document.createElement('div');
		err_block.className = "formErr";
		err_block.innerHTML = _err;
		cont.style.backgroundColor = '#ff9999';
		cont.appendChild(err_block);
		if (element.name == "password_confirm") element.value = "";
		//element.focus();
		return false;
	}
	cont.style.backgroundColor = '';
	return true;
};

site.forms.emarket = {
	
	checkFields : function(block, hideError) {
		var fields = jQuery('label.required input, label.required textarea, label.required select', block).filter(":visible"),
			correct = true;
		if (!block) {
			return;
		}
		for (var i = fields.length; i; i--) {
			if (!site.forms.errors.check(fields[i - 1], hideError) && correct) {
				correct = false;
				if (hideError) {
					return false;
				}
			}
		}
		return correct;
	},
	
	toggleNewObjectForm : function (container, newObjectBlock) {
		var block = jQuery(newObjectBlock);

		if (block.length === 0) {
			return;
		}

		if (jQuery('input[type=radio][value!=new]', container).length > 0) {
			if (jQuery('input[type=radio]:checked', container).val() !== 'new') {
				block.hide();
			}
		}

		jQuery('input[type=radio]', container).click(function () {
			if (jQuery(this).val() !== 'new') {
				block.hide();
			} else {
				block.show();
			}
		});
	},
	
	purchase : function() {
		var emarket = this;
		jQuery('input[type=submit]').click(function(e){
			e.preventDefault();
			var form = jQuery(this).closest('form');
			if (emarket.checkFields(form)) {
				form.submit();
			};
		});
	}
};



site.forms.emarket.purchasingOneStep = {
	init : function(options) {
		var blocks = options.blocks,
			form = options.form,
			actualBlocks = [],
			currentBlock = 0,
			blocksCount = blocks.length,
			deliveryAddrChooseBlock = '.delivery_address.onestep',
			deliveryChooseBlock = '.dychoose.onestep',
			anim = options.animate || 300;
			
		// Записываем только существующие блоки	
		for (var i = 0; i < blocks.length; i++) {
			if (jQuery(blocks[i]).length) {
				actualBlocks.push(blocks[i]);
			}
		}
		
		blocksCount = actualBlocks.length;
		
		// Скрываем все блоки, кроме первого
		for (var i = 0; i < actualBlocks.length; i++) {
			if (i !== 0) {
				jQuery(actualBlocks[i], form).hide();
			}
		}
		
		// Обработчик события выбора адреса доставки или Самовывоза
		jQuery('input[type=radio]', deliveryAddrChooseBlock).click(function() {
			if (jQuery(this).data('type') === 'self') {
				jQuery(deliveryChooseBlock, form).hide(anim);
			} else {
				jQuery(deliveryChooseBlock, form).show(anim);
			}
		});
		
		
		jQuery('input[type=submit]', form).click(function(event) {
			event.preventDefault();
			
			// Если блок последний, то отправляем форму
			if (currentBlock === blocksCount - 1) {
				if (site.forms.emarket.checkFields(form, false)) {
					jQuery(form).submit();
				}
				
			}
			// Показываем следующий блок, если нужно
			if (typeof(actualBlocks[currentBlock + 1]) !== 'undefined' && site.forms.emarket.checkFields(form, false)) {
				var selfDeliveryIsChecked = jQuery('input[type=radio][data-type=self]:checked', deliveryAddrChooseBlock).length;
				
				if (actualBlocks[currentBlock] === deliveryAddrChooseBlock && selfDeliveryIsChecked) {
					currentBlock++;
				}
				
				jQuery(actualBlocks[currentBlock + 1], form).show(anim);
				currentBlock++;
			}
			
		});
	}
	
};

jQuery(document).ready(function(){site.forms.init()});
