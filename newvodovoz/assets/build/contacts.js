$(function() {
	console.log('hhh');
	if($('.contact-map').length > 0){
		//var ymaps = window.ymaps;
		console.log('hh222h');
		$('.contact-map').html('');
		
		ymaps = window.ymaps;
    ymaps.ready(function () {
    	console.log('hh4444h');
        var $contact_map = $(this).empty(),

            myMap = new ymaps.Map('contact-map', {
                center: [59.973131, 30.315868],
                zoom: 10,
                controls: ['fullscreenControl']
            });
        var officePlacemark = new ymaps.Placemark([59.902975, 30.398280], {
        				
								iconCaption: "Адрес офиса",
								balloonContentBody: "Россия, Санкт-Петербург, ул. Седова д. 12 офис 307",
						}, {
						    preset: 'islands#darkOrangeIcon'
						}),
						self1_Placemark = new ymaps.Placemark([60.073369, 30.402673], {
								iconCaption: "Адрес самовывоза",
								balloonContentBody: "Россия, Ленинградская область, Всеволожский район, посёлок Бугры, 2-й Гаражный проезд, 10",
						}),
						self2_Placemark = new ymaps.Placemark([59.853058, 30.427636], {
								iconCaption: "Адрес самовывоза",
								balloonContentBody: "Россия, Санкт-Петербург, Софийская улица, 62 корпус 6",
						});
						
						
				myMap.geoObjects.add(officePlacemark);
				myMap.geoObjects.add(self1_Placemark);
				myMap.geoObjects.add(self2_Placemark);
				
				$('.js_contact_item').on('click',function(){
					
					if ($(this).data('address-id')) {
						var adress_id = $(this).data('address-id');
						
						switch(adress_id) {
						  case 1:
						    //officePlacemark.balloon.open();
						    officePlacemark.options.set('preset', 'islands#darkOrangeIcon');
						    self1_Placemark.options.set('preset', 'islands#blueIcon');
						    self2_Placemark.options.set('preset', 'islands#blueIcon');
						    break;
						  case 2:
						    //self1_Placemark.balloon.open();
						    officePlacemark.options.set('preset', 'islands#blueIcon');
						    self1_Placemark.options.set('preset', 'islands#darkOrangeIcon');
						    self2_Placemark.options.set('preset', 'islands#blueIcon');
						    break;
						  case 3:
						    //self2_Placemark.balloon.open();
						    officePlacemark.options.set('preset', 'islands#blueIcon');
						    self1_Placemark.options.set('preset', 'islands#blueIcon');
						    self2_Placemark.options.set('preset', 'islands#darkOrangeIcon');
						    break;  
						}
						
						$('.js_contact_item').removeClass('active');
						$(this).addClass('active');
						
					}
					//point1.balloon.open();
				})
				
				officePlacemark.events.add(['click'],  function (e) {
				    $('.js_contact_item').removeClass('active');
						$('.js_contact_item[data-address-id = 1]').addClass('active');
						
						
				})
				self1_Placemark.events.add(['click'],  function (e) {
				    $('.js_contact_item').removeClass('active');
						$('.js_contact_item[data-address-id = 2]').addClass('active');
				})
				self2_Placemark.events.add(['click'],  function (e) {
				    $('.js_contact_item').removeClass('active');
						$('.js_contact_item[data-address-id = 3]').addClass('active');
				})
    });
                            
                        
		/*
		var myMap;
				// js_contact_item
				// Дождёмся загрузки API и готовности DOM.
				ymaps.ready(init);
				
				function init () {
						// Создание экземпляра карты и его привязка к контейнеру с
						// заданным id ("map").
						myMap = new ymaps.Map('contact-map', {
								// При инициализации карты обязательно нужно указать
								// её центр и коэффициент масштабирования.
								center:[59.902975, 30.398280], // Спб
								zoom:10
						});
													var myPlacemark = new ymaps.Placemark([30.398280, 59.902975], {
								// Чтобы балун и хинт открывались на метке, необходимо задать ей определенные свойства.
								iconCaption: "Адрес офиса",
								balloonContentBody: "Россия, Ленинградская область, Всеволожский район, посёлок Бугры, 2-й Гаражный проезд, 10",
						});
											myMap.geoObjects.add(myPlacemark);
				
				}*/
		
	}

});