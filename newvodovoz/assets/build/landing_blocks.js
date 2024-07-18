$( document ).ready(function() {
	if($('.beforeAfter').length > 0){
		$('.beforeAfter').beforeAfter({
      movable: true,
      clickMove: true,
      position: 60,
      separatorColor: '#fafafa',
      bulletColor: '#fafafa',
      onMoveStart: function(e) {
          console.log(event.target);
      },
      onMoving: function() {
          console.log(event.target);
      },
      onMoveEnd: function() {
          console.log(event.target);
      },
  });
	}
	

});