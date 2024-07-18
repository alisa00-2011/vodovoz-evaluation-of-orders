$(document).ready(function () {
	var cabinet = {
		smsCountDownTimer: null,
		init_popup: function init_popup(param) {
			param.trigger_link.leafLetPopUp({
				closeBtnLocation: 'box',
				//selector: _this,
				content: param.content_callback,
				boxWidth: function() {
					return param.boxWidth || 600
				},
				beforeLoad: function(scroll, leaflet) {
					var $leaflet = $('.b-leaflet');

					$leaflet.data('triggerElement', param.trigger_link);

					if (param.leafletMod) {
						$('body').addClass(param.leafletMod);
						$leaflet.addClass(param.leafletMod);
					}
				},
				beforeClose: function(leaflet) {
					if (param.leafletMod) {
						$('body').removeClass(param.leafletMod);
					}
				},
				afterLoad: param.afterLoad_callback || function() {
					forms.init('.b-leaflet');

          if($('.b-leaflet .recaptcha').length > 0){
            var captcha_el = $('.b-leaflet .recaptcha').get(0);
            grecaptcha.render(captcha_el, {
              'sitekey' : '6LeRTIIbAAAAAJP_h-gzt_Ueh5CEbNDZDaDJwjGA'
            });
          }

				}
			});
		},
		show_popup: function show_popup(param) {
			param.trigger_link.leafLetPopUp('show',{
				closeBtnLocation: 'box',
				content: param.content_callback,
				boxWidth: function() {
					return param.boxWidth || 600
				},
				beforeLoad: function(scroll, leaflet) {
					var $leaflet = $('.b-leaflet');

					$leaflet.data('triggerElement', param.trigger_link);

					if (param.leafletMod) {
						$('body').addClass(param.leafletMod);
						$leaflet.addClass(param.leafletMod);
					}
				},
				beforeClose: function(leaflet) {
					if (param.leafletMod) {
						$('body').removeClass(param.leafletMod);
					}
				},
				afterLoad: param.afterLoad_callback || function() {
					forms.init('.b-leaflet');

          if($('.b-leaflet .recaptcha').length > 0){
            var captcha_el = $('.b-leaflet .recaptcha').get(0);
            grecaptcha.render(captcha_el, {
              'sitekey' : '6LeRTIIbAAAAAJP_h-gzt_Ueh5CEbNDZDaDJwjGA'
            });
          }

				}
			});
		},
		auth: function auth() {
			var $this = this;

			$('.user_popup').each(function(){
        var _this = $(this),
						popup_div = $('#' + _this.data('html_id')),
						popup_html = (popup_div.length > 0) ? popup_div.html() : '',
						param={
							'trigger_link' : _this,
							'boxWidth' : _this.data('boxWidth'),
							'leafletMod' : _this.data('leafletMod'),
							'content_callback' : function() {

								return popup_html;
							}
						};
				$this.init_popup(param);
			})
		},
		smsCountDown: function smsCountDown(callback, el) {
			var $this = this;

			el[0].innerHTML--;
			if (Number(el[0].innerHTML) === 0) {
				clearTimeout($this.smsCountDownTimer);
				if (!!callback)
					callback();
			} else {
				$this.smsCountDownTimer = setTimeout(function() {
					$this.smsCountDown(callback, el);
				}, 1000);
			}
		},
		auth_phone_submit: function auth_phone_submit() {
			var $this = this;

			$this.smsCountDownTimer = null;



			$(document).on('submit','.js_user_phone form',function(event){
				event.preventDefault();

				var _this = $(this),
						formData = _this.find('input, select, textarea').serializeObject(),
						data = $.extend({}, formData);

				//console.log(_this.data('url'));
				// TODO add disable submit button
				helpers.delay.call(_this, function() {
					$.ajax({
            //url: _this.data('url') || window.location,
            url: '/udata/users/user_phone/.json',
						dataType: 'json',
						data: data,
            method: 'GET',
						success: function(response) {
              if (!!response.code){
                switch(response.code) {
                  case 10: // пользователь найден, подтверждаем его по sms и открываем ЛК
                  case 60: // новый пользователь, подтверждаем его по sms и открываем всплывашку регистрации
                    var _this = $(this),
                      popup_div = $('#user_check_sms'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            if(!!response.phone){
                              popup_div.find('.js_user_check_sms_phone').val(response.phone);
                            }
                            if(!!response.new_user){
                              popup_div.find('.js_user_check_sms_phone_new_user').val(response.new_user);
                            }
                            if(!!response.phone_text){
                              popup_div.find('.js-user_check_sms_for_phone').text(response.phone_text);
                            }
                            return popup_div.html();
                          }
                          return '';
                        },
                        'afterLoad_callback' : function() {
                          forms.init('.b-leaflet');

                          // обнулить таймер смс
                          var $form = $('.b-leaflet').find('.js_user_check_sms form'),
                            $repeat_sms_btn = $form.find('.js_user_repeat_sms_btn'),
                            $timer = $form.find('.js_user_check_sms-timer');

                          $repeat_sms_btn.removeClass('hidden');
                          $timer.addClass('hidden');
                          clearTimeout($this.smsCountDownTimer);

                          if($('.b-leaflet .recaptcha').length > 0){
                            var captcha_el = $('.b-leaflet .recaptcha').get(0);
                            grecaptcha.render(captcha_el, {
                              'sitekey' : '6LeRTIIbAAAAAJP_h-gzt_Ueh5CEbNDZDaDJwjGA'
                            });
                          }
                        }
                      };

                    $this.show_popup(param);
                    break;
                  case 15: // "Необходимо зарегистрироваться" - Пользователя нет, пройдите регистрацию
                    var popup_div = $('#user_registrate'),
                      param={
                        'trigger_link' : $(this),
                        'boxWidth' : 384,
                        'leafletMod' : 'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            var $phone = (!!response.phone) ? response.phone : '',
                                $phone_format = (!!response.phone_formatted) ? response.phone_formatted : $phone;

                            $('.js_user_registrate_phone' , popup_div).val($phone);
                            $('.js_user_registrate_phone_text' , popup_div).html($phone_format);
                            /*console.log($phone);
                            console.log( $('.js_user_registrate_phone' , popup_div));
                            console.log( $('.js_user_registrate_phone_text' , popup_div).val());
                            console.log( popup_div.html());*/

                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);

                    break;
                  case 50:
                    // несколько пользователей с таким телефоном
                    var _this = $(this),
                      popup_div = $('#user_auth_several_users'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;

                  case 80:
                    // Слишком частая отправка sms
                    var _this = $(this),
                      popup_div = $('#user_auth_too_often_sms_send'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;
                  case 90:
                    // Не заполнили капчу
                    var _this = $(this),
                      popup_div = $('#user_check_captcha'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;

                  default:
                    // Ошибка sms
                    var _this = $(this),
                      popup_div = $('#user_auth_sms_send_error'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;
                  // code to be executed if n is different from case 1 and 2
                }
              }else{
                //TODO неизвестная ошибка
              }

						},
						error: function() {
							self.handleError({
								message: 'Произошла ошибка'
							});
						}
					});
				});

			})
		},
		auth_change_phone: function auth_change_phone() {
			var $this = this;

			$(document).on('click','.js_user_change_phone',function(event){
				event.preventDefault();

				var popup_div = $('#' + $(this).data('html_id')),
						param={
							'trigger_link' : $(this),
							'boxWidth' : $(this).data('boxWidth'),
							'leafletMod' : $(this).data('leafletMod'),
							'content_callback' : function() {
								if(popup_div.length > 0){
									return popup_div.html();
								}
								return '';
							}
						};

				$this.show_popup(param);
			});
		},
		auth_repeat_sms: function auth_repeat_sms() {
			var $this = this;

			$(document).on('click','.js_user_repeat_sms_btn',function(event){
				event.preventDefault();

				var $form = $(this).closest('form'),
					$phone = $form.find('.js_user_check_sms_phone').val(),
					$recaptcha = $form.find('textarea[name="g-recaptcha-response"]').val(),
					$url = $form.data('repeat-url');

				helpers.delay.call($(this), function() {
					$.ajax({
						url: $url || window.location,
						dataType: 'json',
						data: {phone:$phone , 'g-recaptcha-response': $recaptcha},
						success: function(response) {
              // Слишком частая отправка sms
              if(!!response.code && response.code == 80 ){
                var _this = $(this),
                  popup_div = $('#user_auth_too_often_sms_send'),
                  param={
                    'trigger_link' : _this,
                    'boxWidth' : 384,
                    'leafletMod' :'b-leaflet__thin b-leaflet__user',
                    'content_callback' : function() {
                      if(popup_div.length > 0){
                        return popup_div.html();
                      }
                      return '';
                    }
                  };

                $this.show_popup(param);
              }else if(!!response.code && response.code == 90){
                var _this = $(this),
                  popup_div = $('#user_check_captcha'),
                  param={
                    'trigger_link' : _this,
                    'boxWidth' : 384,
                    'leafletMod' :'b-leaflet__thin b-leaflet__user',
                    'content_callback' : function() {
                      if(popup_div.length > 0){
                        return popup_div.html();
                      }
                      return '';
                    }
                  };

                $this.show_popup(param);
              }else{
                // пользователь найден sms код отправлен
                if (!!response.code && response.code == 10) {
                  console.log('js_user_repeat_sms_btn - YES');

                  var $repeat_sms_btn = $form.find('.js_user_repeat_sms_btn'),
                    $timer = $form.find('.js_user_check_sms-timer');

                  /* timer */
                  var repeat_count = (!!$repeat_sms_btn.data('repeat_count') && $repeat_sms_btn.data('repeat_count') > 0) ? $repeat_sms_btn.data('repeat_count') + 1 : 1;

                  console.log('js_user_repeat_sms_btn - repeat_count = ' + repeat_count);

                  $repeat_sms_btn.data('repeat_count', repeat_count);
                  if(repeat_count < 3){
                    $repeat_sms_btn.addClass('hidden');
                    $timer
                      .removeClass('hidden')
                      .find('[data-timer]')
                      .html($form.data('repeatTimer') ? $form.data('repeatTimer') + 1 : 31);

                    console.log('js_user_repeat_sms_btn - data-timer = ' + $timer.find('[data-timer]'));

                    $this.smsCountDown(function() {
                      isSent = false;
                      $timer.addClass('hidden');
                      $repeat_sms_btn.removeClass('hidden');
                    }, $timer.find('[data-timer]'))
                  }else{
                    // TODO show recaptcha
                    //$btn.closest('form').find('.g-recaptcha').removeClass('hidden');
                  }
                }else {
                  // TODO неизвестная ошибка вывод всплывашки
                }
              }
						},
						error: function() {
							self.handleError({
								message: 'Произошла ошибка'
							});
						}
					});
				});
			});
		},
		auth_check_sms: function auth_check_sms() {
			var $this = this;

			$(document).on('keyup', '.js-user_check_sms_input', function(e) {
				var $field = $(this),
					$value = $field.val(),
					$field_wrap = $field.closest('.b-form_box'),
					$form = $field.closest('.js_user_check_sms form'),
					$phone = $('.js_user_check_sms_phone', $form).val(),
					$error_message = $form.find('.b-form_box_error'),
					isComplete = $value.replace(/\D/g, '').length === 4;

				helpers.delay.call($field, function() {
					if (isComplete) {
						var formData = $form.find('input, select, textarea').serializeObject(),
							data = $.extend({}, formData);

						$.ajax({
							//url: $form.data('url') || window.location,
							url: '/udata/users/user_chech_sms/.json',
							dataType: 'json',
							data: data,
							success: function(response) {
                var msg = (!!response.msg) ? response.msg : 'Неизвестная ошибка',
                    phone_format = (!!response.phone_format) ? response.phone_format : $phone;

                switch(response.code) {
                  case 10: // sms код верный, доступ в ЛК
                    var popup_div = $('#user_auth_success'),
                      param={
                        'trigger_link' : $(this),
                        'boxWidth' : 384,
                        'leafletMod' : 'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            $('.user_cabinet').removeClass('hidden');
                            $('.user_auth').addClass('hidden');

                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);

                    break;
                  case 50: // sms код верный,новый пользователь, открываем всплывашку регистрации
                    var popup_div = $('#user_registrate'),
                      param={
                        'trigger_link' : $(this),
                        'boxWidth' : 384,
                        'leafletMod' : 'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){

                            $('.js_user_registrate_phone' , popup_div).val($phone);
                            $('.js_user_registrate_phone_text' , popup_div).html(phone_format);
                            /*console.log($phone);
                            console.log( $('.js_user_registrate_phone' , popup_div));
                            console.log( $('.js_user_registrate_phone_text' , popup_div).val());
                            console.log( popup_div.html());*/

                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);

                    break;
                  case 20: // sms код неверный
                    $field_wrap.addClass('m-error');

                    break;

                  case 100: // Пользователь не найден, показываем окно ошибки
                    var _this = $(this),
                      popup_div = $('#user_unknown_error'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            $('.popup_form_under' , popup_div).html(msg);
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;

                  default:
                  // code to be executed if n is different from case 1 and 2
                }

							  //else if(!!response.code && response.code == 20){


								//}
							},
							error: function() {
								self.handleError({
									message: 'Произошла ошибка'
								});
							}
						});
					}else{
						$error_message.addClass('hidden');
					}
				});
			});
		},
    registrate: function registrate() {
			var $this = this;

      $(document).on('submit','.js_user_registrate form',function(event){
        event.preventDefault();

        var _this = $(this),
          formData = _this.find('input, select, textarea').serializeObject(),
          data = $.extend({}, formData);

        //console.log(_this.data('url'));
        // TODO add disable submit button
        helpers.delay.call(_this, function() {
          $.ajax({
            url: '/udata/users/registrate_by_phone_do/.json',
            dataType: 'json',
            data: data,
            success: function(response) {
              if (!!response.code){
                var msg = (!!response.msg) ? response.msg : 'Неизвестная ошибка';

                switch(response.code) {
                  /* 10 - "Пользователь успешно зарегистрирован."

                  * 15 - "SMS Сообщение отправлено зарегистрированному пользователю."
                  * 20 - "SMS Сообщение не отправлено. Код ошибки: " . $sms->status_code . "."
                  * 80 - "Слишком частая отправка sms." для IP или для данного номера телефона

                  * 30 - "Пользователь уже авторизован"
                  * 40 - "Неверный формат номера телефона"
                  * 50 - "Пользователь с таким телефоном уже есть на сайте"*/
                  case 10: // Пользователь успешно зарегистрирован
                    var popup_div = $('#user_reg_success'),
                      param={
                        'trigger_link' : $(this),
                        'boxWidth' : 384,
                        'leafletMod' : 'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            $('.user_cabinet').removeClass('hidden');
                            $('.user_auth').addClass('hidden');

                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;
                  case 15: // SMS Сообщение отправлено зарегистрированному пользователю.
                    var _this = $(this),
                      popup_div = $('#user_check_sms'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            if(!!response.phone){
                              popup_div.find('.js_user_check_sms_phone').val(response.phone);
                            }
                            if(!!response.new_user){
                              popup_div.find('.js_user_check_sms_phone_new_user').val(response.new_user);
                            }
                            if(!!response.phone_text){
                              popup_div.find('.js-user_check_sms_for_phone').text(response.phone_text);
                            }
                            return popup_div.html();
                          }
                          return '';
                        },
                        'afterLoad_callback' : function() {
                          forms.init('.b-leaflet');

                          // обнулить таймер смс
                          var $form = $('.b-leaflet').find('.js_user_check_sms form'),
                            $repeat_sms_btn = $form.find('.js_user_repeat_sms_btn'),
                            $timer = $form.find('.js_user_check_sms-timer');

                          $repeat_sms_btn.removeClass('hidden');
                          $timer.addClass('hidden');
                          clearTimeout($this.smsCountDownTimer);

                          if($('.b-leaflet .recaptcha').length > 0){
                            var captcha_el = $('.b-leaflet .recaptcha').get(0);
                            grecaptcha.render(captcha_el, {
                              'sitekey' : '6LeRTIIbAAAAAJP_h-gzt_Ueh5CEbNDZDaDJwjGA' // vodovoz

                            });
                          }
                        }
                      };

                    $this.show_popup(param);
                    break;

                  case 30: // Пользователь уже авторизован
                    var popup_div = $('#user_already_auth'),
                      param={
                        'trigger_link' : $(this),
                        'boxWidth' : 384,
                        'leafletMod' : 'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            $('.user_cabinet').removeClass('hidden');
                            $('.user_auth').addClass('hidden');

                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;
                  case 40: // "Неверный формат номера телефона"
                  case 50: // "Пользователь с таким телефоном уже есть на сайте"
                    var _this = $(this),
                      popup_div = $('#user_unknown_error'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            $('.popup_form_under' , popup_div).html(msg);
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;

                  case 80:
                    // Слишком частая отправка sms
                    var _this = $(this),
                      popup_div = $('#user_auth_too_often_sms_send'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;

                  default:
                    // Ошибка sms
                    var _this = $(this),
                      popup_div = $('#user_auth_sms_send_error'),
                      param={
                        'trigger_link' : _this,
                        'boxWidth' : 384,
                        'leafletMod' :'b-leaflet__thin b-leaflet__user',
                        'content_callback' : function() {
                          if(popup_div.length > 0){
                            return popup_div.html();
                          }
                          return '';
                        }
                      };

                    $this.show_popup(param);
                    break;
                  // code to be executed if n is different from case 1 and 2
                }
              }else{
                //TODO неизвестная ошибка
              }

            },
            error: function() {
              self.handleError({
                message: 'Произошла ошибка'
              });
            }
          });
        });

      })
		},
    show_order_full_info: function show_order_full_info() {
      var $this = this;

      $('.js_show_order_full_info').each(function(){
        var _this = $(this),
          popup_div = $('#' + _this.data('html_id')),
          popup_html = (popup_div.length > 0) ? popup_div.html() : '',
          param={
            'trigger_link' : _this,
            'leafletMod' : _this.data('leafletMod'),
            'content_callback' : function() {
              return popup_html;
            }
          };

        $this.init_popup(param);
      })
    },
    repeat_order: function repeat_order() {
      var $this = this;

      $(document).on('click','.js_repeat_order',function(event){
        event.preventDefault();

        var $this = $(this),
            $this_text = $('span', $this),
            order_popup = $this.closest('.js_popup_order'),
            order_id = $this.data('order_id'),
            $preloader = $('.cart-preloader');

        $preloader.addClass('preloader');

        $.ajax({
          url: '/udata/emarket/repeatOrder/.json?o_id=' + order_id,
          dataType: 'json',
          success: function(response) {
            if (!!response.status && response.status == 'successful') {

              $('.cart-notice', order_popup).remove();

              if (!!response.items){
                $.each(response.items, function(i, item) {

                  var old_item_id = !!(item.old_item_id) ? item.old_item_id : 0,
                      item_status = !!(item.status) ? item.status : 0;

                  if(item_status == 'error'){
                    $('.cabinet_popup_order_item[data-cart-item-id = "' + old_item_id + '"]', order_popup).addClass('not_available').after( "<div class=\"cart-notice \"><div class=\"cart-notice__inner\">Товара нет в наличии</div></div>" );
                  }
                });

                $this.text('Перейти в корзину').attr('href','/emarket/cart/').removeClass('js_repeat_order');
                $this.after("<span>Товар у вас в корзине</span>");
              }

            }else{
              //TODO неизвестная ошибка
            }
            $preloader.removeClass('preloader');
          },
          error: function() {
            $preloader.removeClass('preloader');
            self.handleError({
              message: 'Произошла ошибка'
            });
          }
        });

      });
    },
    lk_feedback: function lk_feedback() {
		  //console.log('lk_feedback');
      var $this = this;

      $(document).on('submit','.lk_feedback_form form',function(event){
        event.preventDefault();

        console.log('lk_content_feedback form submit');

        var _this = $(this),
            formData = _this.find('input, select, textarea').serializeObject(),
            data = $.extend({}, formData),
            $preloader = $('.cart-preloader');


        $preloader.addClass('preloader');
        console.log(_this);

        helpers.delay.call(_this, function() {
          console.log(_this);

          $.ajax({
            url: _this.data('url') || window.location,
            dataType: 'json',
            data: data,
            success: function(response) {
              console.log(_this);
              if (!!response.msg && response.msg != '') {

                var _this = $('.lk_feedback_form form');
                console.log(_this);
                console.log('success feedback');

                _this.trigger("reset");

                var
                  popup_div = $('#' + _this.data('html_id')),
                  popup_html = (popup_div.length > 0) ? popup_div.html() : '',
                  param={
                    'trigger_link' : _this,
                    'boxWidth' : _this.data('boxWidth'),
                    'leafletMod' : _this.data('leafletMod'),
                    'content_callback' : function() {
                      return popup_html;
                    }
                  };

                $this.show_popup(param);

                console.log(param);

              }else{
                console.log('fail feedback');
                //TODO неизвестная ошибка
              }
              $preloader.removeClass('preloader');
            },
            error: function() {
              console.log('unknown fail feedback');
              $preloader.removeClass('preloader');
              self.handleError({
                message: 'Произошла ошибка'
              });
            }
          });
        });

      });
    },

    show_bottle_count: function show_bottle_count() {
      var $this = this;

      if($('.cabinet-user-bottle-count').length > 0){
        var bottleCountWrap = $('.cabinet-user-bottle-count').eq(0),
            bottleCountPopupWrap = $('.cabinet-user-bottle-count-popup'),
            bottleCountWrapParent = bottleCountWrap.parent();

        bottleCountWrapParent.addClass('is-loading');

        $.ajax({
          url: '/udata/users/getUserBottleCount/.json?',
          dataType: 'json',
          success: function(response) {
            if (!!response.status && response.status == 'successful' && response.hasOwnProperty('count')) {
              bottleCountWrap.text(response.count);
              bottleCountPopupWrap.text(response.count);
            }else{
              //неизвестная ошибка
              bottleCountWrap.text('-');
              bottleCountPopupWrap.text('-');
            }
            bottleCountWrapParent.removeClass('is-loading');
          },
          error: function() {
            bottleCountWrap.text('-');
            bottleCountPopupWrap.text('-');
            bottleCountWrapParent.removeClass('is-loading');
          }
        });
      }
    },

    /*purchase_return: function purchase_return() {
      var $this = this;

      $('.purchase_return').each(function(){
        var _this = $(this),
          popup_div = $('#' + _this.data('html_id')),
          popup_html = (popup_div.length > 0) ? popup_div.html() : '',
          param={
            'trigger_link' : _this,
            'boxWidth' : _this.data('boxWidth'),
            'leafletMod' : _this.data('leafletMod'),
            'content_callback' : function() {

              return popup_html;
            },
            'afterLoad_callback' : function() {
              /!*console.log('afterLoad_callback_event');
              if($('.b-leaflet .js-selectric_pre').length > 0){
                $('.b-leaflet .js-selectric_pre').removeClass('js-pure').addClass('js-selectric');
              }*!/
              if($('.b-leaflet .js-datePicker_pre').length > 0){
                $('.b-leaflet .js-datePicker_pre').each(function(){
                  var minDatePicker = new Date(),
                    $datePicker = $(this);

                  minDatePicker.setDate(minDatePicker.getDate() + 1);

                  $datePicker.datepicker({
                    maxDate: minDatePicker,
                    classes: 'purchase_return_datepicker',
                    onSelect: function(fd){
                      console.log('datePickerInput2');
                      $datePicker.val(fd).trigger('input').trigger('change').trigger('refresh.validate');
                    }
                  });
                });
              }

              var x, i, j, l, ll, selElmnt, a, b, c;
              /!*look for any elements with the class "custom-select":*!/
              x = document.getElementsByClassName("custom-select");
              console.log(x);
              l = x.length;
              for (i = 0; i < l; i++) {
                selElmnt = x[i].getElementsByTagName("select")[0];
                ll = selElmnt.length;
                /!*for each element, create a new DIV that will act as the selected item:*!/
                a = document.createElement("DIV");
                a.setAttribute("class", "select-selected");
                a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
                x[i].appendChild(a);
                /!*for each element, create a new DIV that will contain the option list:*!/
                b = document.createElement("DIV");
                b.setAttribute("class", "select-items select-hide");
                for (j = 1; j < ll; j++) {
                  /!*for each option in the original select element,
                  create a new DIV that will act as an option item:*!/
                  c = document.createElement("DIV");
                  c.innerHTML = selElmnt.options[j].innerHTML;
                  c.addEventListener("click", function(e) {
                    /!*when an item is clicked, update the original select box,
                    and the selected item:*!/
                    var y, i, k, s, h, sl, yl;
                    s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                    sl = s.length;
                    h = this.parentNode.previousSibling;
                    for (i = 0; i < sl; i++) {
                      if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        yl = y.length;
                        for (k = 0; k < yl; k++) {
                          y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                      }
                    }
                    h.click();

                    $(this).closest('.custom-select').addClass('selected');
                  });
                  b.appendChild(c);
                }
                x[i].appendChild(b);

                a.addEventListener("click", function(e) {
                  var _this = $(this);

                  /!*when the select box is clicked, close any other select boxes,
                  and open/close the current select box:*!/
                  e.stopPropagation();
                  closeAllSelect(this);

                  if(_this.hasClass("select-arrow-active")){
                    _this.removeClass("select-arrow-active");
                    $(this.nextSibling).addClass("select-hide");
                  }else{
                    _this.addClass("select-arrow-active");
                    $(this.nextSibling).removeClass("select-hide");
                  }
                });
              }
              function closeAllSelect(elmnt) {
                /!*a function that will close all select boxes in the document,
                except the current select box:*!/
                var x, y, i, xl, yl, arrNo = [];
                x = document.getElementsByClassName("select-items");
                y = document.getElementsByClassName("select-selected");
                xl = x.length;
                yl = y.length;
                for (i = 0; i < yl; i++) {
                  if (elmnt == y[i]) {
                    arrNo.push(i)
                  } else {
                    y[i].classList.remove("select-arrow-active");
                  }
                }
                for (i = 0; i < xl; i++) {
                  if (arrNo.indexOf(i)) {
                    x[i].classList.add("select-hide");
                  }
                }
              }
              /!*if the user clicks anywhere outside the select box,
              then close all select boxes:*!/
              //document.addEventListener("click", closeAllSelect);
              $(window).click(function(event) {
                if (!($(event.target).hasClass("js-select"))) {
                  closeAllSelect(this);
                }
              });

              forms.init('.b-leaflet');
            }
          };
        $this.init_popup(param);
      })
    },*/
    
    addErpDeliveryPoints: function addErpDeliveryPoints() {
      var $this = this;
  
      $(document).on('click','.js_return_delivery_point_step1',function(event){
        event.preventDefault();
        
        $('.js-delivery-address_fake', $(this).parents('form')).val('');
        $('.js_delivery_point_floor', $(this).parents('form')).val('');
        $('.js_delivery_point_entrance', $(this).parents('form')).val('');
        $('.js_delivery_point_flat', $(this).parents('form')).val('');
        $('.js_delivery_point_flat_code', $(this).parents('form')).val('');
        $('.js_delivery_point_comment', $(this).parents('form')).val('');
        $('.js-delivery-point_house', $(this).parents('form')).prop('checked',false);
        
        $('.delivery_point_step2', $(this).parents('form')).addClass('hidden');
        $('.delivery_point_step1', $(this).parents('form')).removeClass('hidden');
      });
      
      $(document).on('change','.js-delivery-point_house',function(event){
        event.preventDefault();
  
        if(this.checked) {
          $('.dop_input', $(this).parents('form')).fadeOut();
          $('.js-delivery-address_fake, .js_delivery_point_floor, .js_delivery_point_entrance, .js_delivery_point_flat, .js_delivery_point_flat_code', $(this).parents('form'))
            .attr('data-required', false)
            .data('required', false);
        }else{
          $('.dop_input', $(this).parents('form')).fadeIn();
          $('.js-delivery-address_fake, .js_delivery_point_floor, .js_delivery_point_entrance, .js_delivery_point_flat, .js_delivery_point_flat_code', $(this).parents('form'))
            .attr('data-required', true)
            .data('required', true);
        }
      });
      
      $(document).on('change','.js_add_delivery_point_on_map',function(event){
        event.preventDefault();
  
        if(this.checked) {
          $('.dop_input', $(this).parents('form')).fadeOut();
          $('.js-delivery-address_fake, .js_delivery_point_floor, .js_delivery_point_entrance, .js_delivery_point_flat, .js_delivery_point_flat_code', $(this).parents('form'))
            .attr('data-required', false)
            .data('required', false);
        }else{
          $('.dop_input', $(this).parents('form')).fadeIn();
          $('.js-delivery-address_fake, .js_delivery_point_floor, .js_delivery_point_entrance, .js_delivery_point_flat, .js_delivery_point_flat_code', $(this).parents('form'))
            .attr('data-required', true)
            .data('required', true);
        }
      });
      
      $(document).on('click','.add-new-address',function(event){
        event.preventDefault();
  
        // открываем модальное окно выбора периода доставки
        var vModalLogin = {
          compact: true,//компактный интерфейс
          autoFocus: true,//автофокусировка в первом инпуте
          closeButton: true,//отображение кнопки закрытия в углу
          defaultDisplay: "flex",
          dragToClose: true,//возможность закрыть модалку, потянув вверх/вниз
          wheel: false,//прокручивание колесом мыши (нужно для галерей)
          id: "add_delivery_point",
          on: {
            done: (fancybox, slide) => {
        
              // чтобы обратиться к активной форме, выведенной в текущий момент в модальном окне, можно использовать селектор #fancybox-vModalBlock
        
              // recaptcha
              /*document.querySelectorAll(".vModal form .recaptcha").forEach(captcha_el => {
                if(captcha_el.innerHTML == ""){
                  grecaptcha.render(captcha_el, {
                    //'sitekey' : '6LeRTIIbAAAAAJP_h-gzt_Ueh5CEbNDZDaDJwjGA' // vodovoz
                    'sitekey' : '6LefP3omAAAAABpMiOJL0ZA3YXop8xSF_1P7Rc_P' // vodovoz DEV
                  });
                }
              });*/
        
              // очищаем поле с текстом ошибки предыдущего ajax запроса
              document.querySelectorAll(".vModal form").forEach((formElement) => {
                const formResponseErrorStr = formElement.querySelector(".form-error-str.response");
                formResponseErrorStr.innerHTML = '';
              });
        
              // сбрасываем таймер
              resetSmsCodeTimer();
  
              YandexMaps.deliveryPoint();
        
            },
            shouldClose: (fancybox, slide) => {
              // hide recaptcha
              /*document.querySelectorAll(".vModal form .recaptcha").forEach(captcha_el => {
                grecaptcha.reset();
              });*/
            }
          }
        };
        
        Fancybox.close();
        Fancybox.show([
          {
            src: "#vModal--add_delivery_point",
            type: "inline",
          },
        ],vModalLogin);
      });
    },
    cartSelectErpDeliveryPoints: function cartSelectErpDeliveryPoints() {
      var $this = this;
  
      $(document).on('focus','[data-suggest]',function(event){
        event.preventDefault();
        var $thisInput = $(this);
        
        console.log('open delivery point');
        
        $.ajax({
          url: '/udata/users/getCartErpDeliveryPoints/.json?',
          dataType: 'json',
          success: function(Response) {
            // формирование списка
            if(Response.hasOwnProperty('item')) {
              console.log("Response.hasOwnProperty('item')");
              console.log(Response.item);
              var mainContainer = $thisInput.parents('.delivery_points-container'),
                deliveryPointsListContainer = $('.delivery_points_list', mainContainer);
  
              mainContainer.addClass('openCartDeliveryPointsList');
  
              $(document).on("click", function(e) {
                if ($(e.target) !== $('[role="listbox"]', deliveryPointsListContainer)) {
                  $('[role="listbox"]', deliveryPointsListContainer).remove();
                  mainContainer.removeClass('openCartDeliveryPointsList');
                }
              });
  
              deliveryPointsListContainer.html('<div role="listbox"></div>');
              //deliveryPointsListContainer.empty();
              
              for (var i = 0; i < Response.item.length; ++i) {
                var deliveryItem = Response.item[i];
                
                  console.log(deliveryItem);
                  var shortAddress = ((deliveryItem.streetType != null) ? deliveryItem.streetType + ' ' : '') + deliveryItem.street +
                      ', ' + deliveryItem.building ,
                      localityTypeShort = (deliveryItem.localityTypeShort != null) ? deliveryItem.localityTypeShort + '. ' : '';
        
                  //console.log('<div role="option" id="'+ i +'" data-delivery_point_id = "' + deliveryItem.deliveryPointErpId + '">'+ shortAddress +'<span>' + localityTypeShort + deliveryItem.city + '</span></div>');
                  $('[role="listbox"]', deliveryPointsListContainer).append(
                    '<div role="option" id="'+ i +'" data-fulladress = "'+ shortAddress +'" data-lat = "' + deliveryItem.latitude + '" data-lon = "' + deliveryItem.longitude + '" data-delivery_point_id = "' + deliveryItem.deliveryPointErpId + '">'+ shortAddress +'<span>' + localityTypeShort + deliveryItem.city + '</span></div>'
                  );
                
              }
  
              $('[role="listbox"]', deliveryPointsListContainer).append(
                '<div class="add-new-address"><span>Добавить новый адрес доставки</span></div>'
              );
  
              $('[role="listbox"]', deliveryPointsListContainer).on('blur', function() {
                $(this).children().remove();
                mainContainer.removeClass('openCartDeliveryPointsList');
              });
  
              $('[role="option"]', deliveryPointsListContainer).on('click', function() {
                var full_adress = $(this).data('fulladress');
                var lat = $(this).data('lat');
                var lon = $(this).data('lon');
  
                mainContainer.closest('.b-form_box').addClass('transition').addClass('active').removeClass('empty');
                $('.js-delivery-address_fake, .js-delivery-address', mainContainer).val(full_adress);
                $('.js-delivery-address-lat').val(lat);
                  $('.js-delivery-address-lon').val(lon);
                
    
    
                $('[role="listbox"]', deliveryPointsListContainer).remove();
                mainContainer.removeClass('openCartDeliveryPointsList');
  
  
                var apiUrl = '/udata/emarket/isAllowAdressForDelivery/'+lat+'/'+lon+'.json';
                if($('.js-calculate-info').length > 0){
                  apiUrl = '/udata/emarket/isAllowAdressForDelivery/'+lat+'/'+lon+'/1.json';
                }
                $.ajax({
                  url: apiUrl,
                  // method: $form.attr('method') || 'post',
                  dataType: 'json',
                  // data: data,
                  success: function(response) {
                    if (response.result === 'no') {
                      $.dispatch({
                        type: 'cart-address-for-delivery',
                        payload: response,
                        allow: false
                      });
        
                      var $address = $('.js-delivery-address');
        
                      $('.js-delivery-address-text').html('<span style="color: #FC372A !important;">Ошибка определения доставки по данному адресу</span>');
                      //$('.js-delivery-address').val('');
                      $address.val('');
                      $('.js-delivery-price-wrap').hide();
        
                      //$addressInput.val('');
                      $address.val('');
                      //formNotifications.showErrorLabel.call($addressInput, 'Ошибка определения доставки по данному адресу', 0);
                      formNotifications.showErrorLabel.call( $address, 'Ошибка определения доставки по данному адресу', 0);
        
                      // для калькулятора
                      $('.js-calculate-info').hide();
                    }
                    else {
        
                      // clear calendar selected day, error,  time period
                      console.log('clear calendar and time period');
                      var $selectorInner = $('.cart-checkout-datetime__time-inner');
                      $selectorInner.html('');
                      $('.cart-checkout-datetime .js-datePicker .datepicker--cell-day.-selected-').removeClass('-selected-');
        
                      $('.cart-checkout-datetime__time ').addClass('hidden');
                      $('.cart-checkout-datetime__notice').removeClass('hidden');
                      $.dispatch({
                        id: 'delivery-time',
                        type: 'error-message-hide',
                      });
                      $.dispatch({
                        id: 'delivery-time-modal',
                        type: 'error-message-hide',
                      });
                      $.dispatch({
                        id: 'delivery-calendar-modal',
                        type: 'error-message-hide',
                      });
                      //\ clear calendar and time period
        
                      $.dispatch({
                        type: 'cart-address-for-delivery',
                        payload: response,
                        allow: true
                      });
        
                      if (typeof response.price !== 'undefined' && (response.price === 0 || response.price > 0)) {
                        var delivery_price = (response.price === 0) ? 'бесплатно' : response.price;
                        $('.js-delivery-price-text').text(delivery_price);
                        $('.js-delivery-price-wrap').show();
                      }
        
        
        
                      // сразу попробовать выбрать дату доставки
                      var curr_form = $('.js-tabs-page.opened form');
                      if(curr_form.length > 0){
                        if(curr_form.find('.datepicker--cell-day.-current-').length > 0){
            
                          console.log('curr_day_click');
                          curr_form.find('.datepicker--cell-day.-current-').trigger('click');
                          curr_form.find('#checkout-time').prop('selectedIndex', 0).selectric('refresh');
                          curr_form.find('#checkout-time').trigger('change');
                        }
                      }
                      //form.find('.datepicker--cell-day.-current-').trigger('click');
                      // if(form.find('#checkout-time select option[text = "Выберите другую дату"]').length > 0 ){
                      // form.find('.datepicker--cell-day.-current-').next().trigger('click');
                      // }
        
                      //form.find('#checkout-time').prop('selectedIndex', 0).selectric('refresh');
                      //form.find('#checkout-time').trigger('change');
        
                      // для калькулятора
                      if (typeof response.forFreeDeliveryHtml !== 'undefined') {
                        $('.js-min-19l-amount-for-free-delivery').html(response.forFreeDeliveryHtml);
                      }
                      if (typeof response.closestTimePeriodHtml !== 'undefined') {
                        $('.js-calculate-closest-delivery-period').html(response.closestTimePeriodHtml);
                      }
                      if (typeof response.closestDeliveryDayAllPeriodsHtml !== 'undefined') {
                        $('.js-calculate-all-delivery-period').html(response.closestDeliveryDayAllPeriodsHtml);
                      }
                      if (typeof response.deliveryPriceHtml !== 'undefined') {
                        $('.js-delivery-price-html').html(response.deliveryPriceHtml);
                      }
        
                      $('.js-calculate-info').show();
        
                    }
                  }
    
                });
                return;
              });
              
              
            }
            /*if (!!response.status && response.status == 'successful' && response.hasOwnProperty('count')) {
              bottleCountWrap.text(response.count);
              bottleCountPopupWrap.text(response.count);
            }else{
              //неизвестная ошибка
              bottleCountWrap.text('-');
              bottleCountPopupWrap.text('-');
            }
            bottleCountWrapParent.removeClass('is-loading');*/
          },
          error: function() {
            /*bottleCountWrap.text('-');
            bottleCountPopupWrap.text('-');
            bottleCountWrapParent.removeClass('is-loading');*/
          }
        });
      });
      
      
    },
		init: function init() {
			var $this = this;

			/*$this.auth();
			$this.test_erp();
			$this.auth_phone_submit();
			$this.auth_change_phone();
			$this.auth_repeat_sms();
			$this.auth_check_sms();
			$this.registrate();*/
			$this.show_order_full_info();
			$this.repeat_order();

			$this.lk_feedback();

      $this.show_bottle_count();
      
      //$this.addErpDeliveryPoints();
      //$this.cartSelectErpDeliveryPoints();
		}
	}

	cabinet.init();
  


  /**
   * Вывод всплывашки для авторизации в корзине
   */
  console.log('try_guest');
  if($('.js-cart_guest').length > 0) {
    console.log('guest');


    // открываем модальное окно выбора периода доставки
    var vModalLogin = {
      compact: true,//компактный интерфейс
      autoFocus: true,//автофокусировка в первом инпуте
      closeButton: true,//отображение кнопки закрытия в углу
      defaultDisplay: "flex",
      dragToClose: true,//возможность закрыть модалку, потянув вверх/вниз
      wheel: false,//прокручивание колесом мыши (нужно для галерей)
      id: "userLogin",
      on: {
        done: (fancybox, slide) => {

          // чтобы обратиться к активной форме, выведенной в текущий момент в модальном окне, можно использовать селектор #fancybox-vModalBlock

          // recaptcha
          document.querySelectorAll(".vModal form .recaptcha").forEach(captcha_el => {
            if(captcha_el.innerHTML == ""){
              grecaptcha.render(captcha_el, {
                'sitekey' : '6LeRTIIbAAAAAJP_h-gzt_Ueh5CEbNDZDaDJwjGA' // vodovoz
                //'sitekey' : '6LefP3omAAAAABpMiOJL0ZA3YXop8xSF_1P7Rc_P' // vodovoz DEV
              });
            }
          });

          // очищаем поле с текстом ошибки предыдущего ajax запроса
          document.querySelectorAll(".vModal form").forEach((formElement) => {
            const formResponseErrorStr = formElement.querySelector(".form-error-str.response");
            formResponseErrorStr.innerHTML = '';
          });

          // сбрасываем таймер
          resetSmsCodeTimer();

        },
        shouldClose: (fancybox, slide) => {
          // hide recaptcha
          document.querySelectorAll(".vModal form .recaptcha").forEach(captcha_el => {
            grecaptcha.reset();
          });
        }
      }
    };
    Fancybox.close();
    Fancybox.show([
      {
        src: "#vModal--userLogin",
        type: "inline",
      },
    ],vModalLogin);
  }

  /**
   * Подгрузить баннер со временем
   */
  console.log('time-wrap-dummy');
  if($('.time-wrap-dummy').length > 0) {
    console.log('time-wrap-dummy-----');
    $.ajax({
      //url: _this.data('url') || window.location,
      url: '/udata://catalog/banner//1/.json',
      dataType: 'json',
      success: function(response) {
        console.log('time-wrap-dummy-YES');
        if (response.hasOwnProperty('delivery_time')) {
          if (response.delivery_time.hasOwnProperty('intervalMessage')) {
            let link = response.delivery_time.hasOwnProperty('link') ? response.delivery_time.link : '';
            let open_in_new_tab = (response.delivery_time.hasOwnProperty('open_in_new_tab') &&  response.delivery_time.open_in_new_tab == 1 )? ' target="_blank' : '';
            let intervalMessage = response.delivery_time.intervalMessage;
            let timeBannerWrap = $('.time-wrap-dummy:first');
            let timeBannerWrapText = timeBannerWrap.data('btn-text');
            let template = '<div class="time-wrap">\n' +
              '                <a class="d-time" href="' + link + '" title="Доставка и оплата" ' + open_in_new_tab + '>\n' +
              '                  <span>\n' +
              '                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">\n' +
              '                      <path fill-rule="evenodd" clip-rule="evenodd" d="M33.5 18C33.5 26.5604 26.5604 33.5 18 33.5C9.43959 33.5 2.5 26.5604 2.5 18C2.5 9.43959 9.43959 2.5 18 2.5C26.5604 2.5 33.5 9.43959 33.5 18ZM36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0C27.9411 0 36 8.05887 36 18ZM19.25 6.00006C19.25 5.30971 18.6904 4.75006 18 4.75006C17.3096 4.75006 16.75 5.30971 16.75 6.00006V18.7501C16.75 19.5785 17.4216 20.2501 18.25 20.2501H27C27.6904 20.2501 28.25 19.6904 28.25 19.0001C28.25 18.3097 27.6904 17.7501 27 17.7501H19.25V6.00006Z" fill="#072D76"/>\n' +
              '                    </svg>\n' +
              '                  </span>\n' +
              '                  <div class="text">Ближайшее время доставки: ' + intervalMessage + ' или</div>\n' +
              '                </a>\n' +
              '                <a class="d-hour" target="_blank" href="/akcii/akciya-dostavka-za-chas/">\n' +
              '                  <span>\n' +
              '                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">\n' +
              '                      <path fill-rule="evenodd" clip-rule="evenodd" d="M33.5 18C33.5 26.5604 26.5604 33.5 18 33.5C9.43959 33.5 2.5 26.5604 2.5 18C2.5 9.43959 9.43959 2.5 18 2.5C26.5604 2.5 33.5 9.43959 33.5 18ZM36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0C27.9411 0 36 8.05887 36 18ZM19.25 6.00006C19.25 5.30971 18.6904 4.75006 18 4.75006C17.3096 4.75006 16.75 5.30971 16.75 6.00006V18.8965C16.75 19.2943 16.908 19.6759 17.1893 19.9572L23.1161 25.8839C23.6043 26.3721 24.3957 26.3721 24.8839 25.8839C25.372 25.3958 25.372 24.6043 24.8839 24.1162L19.25 18.4823V6.00006Z" fill="white"/>\n' +
              '                    </svg>\n' +
              '                  </span>\n' +
              '                  <div class="text">' + timeBannerWrapText + ' </div>\n' +
              '                </a>\n' +
              '              </div>'
            
            timeBannerWrap.html(template);
          }
        }
        
      },
      error: function() {
      
      }
    });
  }
});

