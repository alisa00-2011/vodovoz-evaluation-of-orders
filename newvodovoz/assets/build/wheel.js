let wheel_wrap = $('.wheel_integration');
let wheel_self = $('.wheel_self');
let digits = $('.wheel_digits');
let spinBtn = $('.spin_btn');
let wheelBtnId = '#wheel_button';
let wheelBtn = $(wheelBtnId);
let wheelBtnApplyGift = $('#wheel_good')
let variant = 1;
let prev_variant = 0;
let variants = [];
let wh_w = 208;
let whp_w = "0.75rem";

function show_wheel(make) {
  console.log('show_wheel');

  let wdth = $(window).width();
  if (wdth < 1280) {
    wh_w = 117;
    whp_w = "0.375rem";
  }
  

  //отрисовка секторов при загрузке страницы
  if(typeof wheel_list !== 'undefined'){
    draw_wheel(wheel_list, true);
  }else{
    //если при загрузке не было переменной с секторами, отрисовываем через ajax
    $.ajax({
      "url": "/udata/emarket/wheel_list/1/.json",
      "method": "POST",
      "timeout": 5000,
      "dataType": "json",
      "data": "data=wheel",
    }).done((response) => {
      draw_wheel(response, true);
    }).fail(function(jqXHR, textStatus) {
      alert("Ошибка обращения к сервису: " + textStatus);
    });
  }
}
/*функция создание*/
function draw_wheel(wheel_obj_tmp, is_first_creating) {
  console.log('draw_wheel');
  if(typeof wheel_obj_tmp !== 'undefined'){
    let wheel_obj_tmp2 = typeof wheel_obj_tmp !== "string" ? JSON.stringify(wheel_obj_tmp) : wheel_obj_tmp;
    try {
      var wheel_obj = JSON.parse(wheel_obj_tmp2);
    
      console.log('draw_wheel 22');
      $("#wheel_digits").html("");
      let html = '';
      wheel_obj.map(function(sector, i){
        if(is_first_creating === true){
          console.log('draw_wheel 33');
          variants.push(sector);
        
          html += '<div class="wheel_number" data-id="' + sector.id + '" style="--i:' + (i  + 1) + ';--clr:' + (i%2 == 0?'transparent':'#FFFFFF') + ';--fclr:' + (i%2 == 0?'#FFFFFF':'#0C24FF') + ';"><span>' + sector.name + '</span></div>';
        }
        
        let digit = document.createElement("div");
        digit.classList.add("wheel_digit");
        if (i == 0)
          digit.classList.add("active");
        digit.style.width = whp_w;
        digit.style.height = whp_w;
        let angleEachDigitRadians =
          (2 / wheel_obj.length) * i * Math.PI;
        let left = (wh_w * Math.sin(angleEachDigitRadians) + wh_w) + "px";
        let top = (wh_w * Math.cos(angleEachDigitRadians) + wh_w) + "px";
        digit.style.left = left;
        digit.style.top = top;
        $("#wheel_digits").append(digit);
      })
    
      if(is_first_creating === true){
        console.log('draw_wheel 44');
        wheelBtn.data('status', 'open');
        wheel_self.html(html);
      }
      wheel_wrap.removeClass('hidden');
      
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

let value = 0;
let dvalue = 0;

function spin_wheel(){
  let html = '';
  wheelBtn.attr("disabled", "disabled");
  $.ajax({
    "url": "/udata/emarket/get_wheel_spin_result/.json",
    "method": "POST",
    "timeout": 5000,
    "dataType": "json",
    "data": "data=wheel",
  }).done((response) => {
    if(!!response.spin_result_id && !!response.total){
      /*console.log('spin');
      console.log(prev_variant);
      console.log(variant);
      console.log(variants);*/
      
      var result_id = response.spin_result_id;
      //console.log(result_id);
      
      for (let i = 0; i < variants.length; i++) {
        if (variants[i].id == result_id){
          variant = i;
          break;
        }
      };
      /*console.log('spin after');
      console.log(prev_variant);
      console.log(variant);*/
      
      /*value += 720 - (variant - prev_variant) * (360/variants.length);
      dvalue += 720;
      
      wheel_self[0].style.transform = "rotate(" + (value + 108.8) + "deg)";
      digits[0].style.transform = "translate(-50%, -50%) rotate(" + (dvalue + 629.8) + "deg)";*/
      
      value += 2 - (variant - prev_variant) * (1/variants.length);
      dvalue += 2 - (variant - prev_variant) * (1/variants.length);
  
      var digit_count = digits.find('div').length,
        digit_pos = digit_count - variant;
      if(digit_pos == digit_count) digit_pos = 0;
      console.log('digit_pos');
      console.log(digit_pos);
      console.log(digits.find('div').eq(digit_pos));
      digits.find('div').removeClass('active');
      
      
      wheel_self[0].style.transform = "rotate(" + (value + 0.304) + "turn)";
      digits[0].style.transform = "translate(-50%, -50%) rotate(" + (dvalue + 0.75) + "turn)";
      setTimeout(function() {
        digits.find('div').eq(digit_pos).addClass('active');
        wheelBtnApplyGift.removeClass('inCart').data('redirectAllowed', false).data('id', result_id).attr('href', '/emarket/basketCust/put/element/' + result_id + '/?amount=1')
        wheelBtn.removeAttr("disabled");
      }, 2000);
      prev_variant = variant;
    }else{
      alert("Ошибка обращения к сервису");
    }
  }).fail(function(jqXHR, textStatus) {
    alert("Ошибка обращения к сервису: " + textStatus);
  });
}

$('body').on('click', wheelBtnId, function (){
  console.log('wheelBtn.onclick');
  var wheel_status = wheelBtn.data('status');
  
  console.log(wheel_status);
  switch (wheel_status){
    case 'open':
      wheel_wrap.addClass('wide');
      wheelBtn.data('status', 'spin');
      wheelBtn.text('Крутить');
      break;
      
    case 'spin':
      wheelBtn.data('status', 'get_gift');
      wheelBtn.text('Получить подарок');
      spin_wheel();
      break;
      
    case 'get_gift':
      console.log(wheelBtnApplyGift.data('id'));
      console.log(wheelBtnApplyGift.attr('href'));
      wheelBtnApplyGift.trigger('click');
      setTimeout(function() {
        wheel_wrap.addClass('hidden');
      }, 2000);
      break;
  }
});

$(document).ready(() => {
  show_wheel();
});


