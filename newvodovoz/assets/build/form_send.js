$(document).ready(function () {
	var form_send = {
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
				}
			});
		},
    select_beautify: function select_beautify(select_wrap) {
      console.log('select');
      var x, i, j, l, ll, selElmnt, a, b, c;
      /*look for any elements with the class "custom-select":*/
      x = select_wrap.get(0).getElementsByClassName("custom-select");
      console.log(x);
      l = x.length;
      for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {
          /*for each option in the original select element,
          create a new DIV that will act as an option item:*/
          c = document.createElement("DIV");
          c.innerHTML = selElmnt.options[j].innerHTML;
          c.addEventListener("click", function(e) {
            /*when an item is clicked, update the original select box,
            and the selected item:*/
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

          console.log('click select');
          /*console.log(this);
          console.log($(this));
          console.log($(this.nextSibling));*/

          /*when the select box is clicked, close any other select boxes,
          and open/close the current select box:*/
          e.stopPropagation();
          closeAllSelect(this);

          if(_this.hasClass("select-arrow-active")){
            _this.removeClass("select-arrow-active");
            $(this.nextSibling).addClass("select-hide");
          }else{

            _this.addClass("select-arrow-active");
            $(this.nextSibling).removeClass("select-hide");
          }
          /*this.nextSibling.classList.toggle("select-hide");
          this.classList.toggle("select-arrow-active");*/
        });
      }
      function closeAllSelect(elmnt) {
        //console.log('jkkkk');
        /*a function that will close all select boxes in the document,
        except the current select box:*/
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
      /*if the user clicks anywhere outside the select box,
      then close all select boxes:*/
      //document.addEventListener("click", closeAllSelect);
      $(window).click(function(event) {
        if (!($(event.target).hasClass("js-select"))) {
          closeAllSelect(this);
        }
      });
    },
    purchase_return: function purchase_return() {
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
              if($('.b-leaflet .js-selectric_pre').length > 0){
                $('.b-leaflet .js-selectric_pre').removeClass('js-pure').addClass('js-selectric');
              }
              if($('.b-leaflet .js-datePicker_pre').length > 0){
                $('.b-leaflet .js-datePicker_pre').each(function(){
                  var minDatePicker = new Date(),
                    $datePicker = $(this);
                  //console.log('minDatePicker');
                  //console.log(minDatePicker.getDate());
                  //minDatePicker.setDate(minDatePicker.getDate() + 1);
                  $datePicker.datepicker({
                    maxDate: minDatePicker,
                    classes: 'purchase_return_datepicker',
                    autoClose: true,
                    /*onSelect: function onSelect(fd, date) {

                      $datePickerInput.val(fd).trigger('change').trigger('refresh.validate');
                      $datePicker.()
                    }*/
                  });
                });
              }

              $this.select_beautify($('.b-leaflet'));

              forms.init('.b-leaflet');


              if($('.b-leaflet .recaptcha').length > 0){
                  var captcha_el = $('.b-leaflet .recaptcha').get(0);
                  grecaptcha.render(captcha_el, {
                      'sitekey' : '6LeRTIIbAAAAAJP_h-gzt_Ueh5CEbNDZDaDJwjGA'
                  });
              }
            }
          };
        $this.init_popup(param);
      })
    },
    purchase_return_send: function purchase_return_send() {
      var $this = this;

      $(document).on('submit','.js_form_purchase_returns form',function(event){
        event.preventDefault();


        var _this = $(this),
          formData = _this.find('input, select, textarea').serializeObject(),
          data = $.extend({}, formData),
          $recaptcha = _this.find('textarea[name="g-recaptcha-response"]').val(),
          $preloader = $('.cart-preloader');

        console.log($recaptcha);
        console.log($('.recaptcha_wrap' , _this));
        if($recaptcha == ''){
          $('.recaptcha_wrap' , _this).addClass('m-error').append('<div class="b-form_box_error" style="text-align: center";>Пройдите проверку reCaptcha</div>');
          return false;
        }
        $preloader.addClass('is-shown');
        console.log(_this);

        helpers.delay.call(_this, function() {
          console.log(_this);

          $.ajax({
            url: _this.attr('action') || window.location,
            dataType: 'json',
            data: data,
            success: function(response) {
              console.log(_this);
              if (!!response.msg && response.msg != '') {

                var _this_popup = _this.closest('.js_form_purchase_returns');
                console.log(_this_popup);
                console.log('success feedback');
                console.log($('form' , _this_popup));
                console.log($('.b-form_message' , _this_popup));
                $('.custom-select .select-selected, .custom-select .select-items' ,_this).remove();
                $this.select_beautify(_this);
                _this.trigger("reset");

                $('form' , _this_popup).addClass('hidden');
                $('.b-form_message' , _this_popup).removeClass('hidden');
              }else{
                console.log('fail feedback');
                //TODO неизвестная ошибка
              }
              $preloader.removeClass('is-shown');
            },
            error: function() {
              console.log('unknown fail feedback');
              $preloader.removeClass('is-shown');

            }
          });
        });

      });
    },
		init: function init() {
			var $this = this;

			$this.purchase_return();
			$this.purchase_return_send();

		}
	}

  form_send.init();
});

