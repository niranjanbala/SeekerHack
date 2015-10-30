$(document).ready(function(){

	$('#myCarousel').carousel({
    pause: true,
    interval: false
})

$('.carousel .item').each(function(){
  var next = $(this).next();
  if (!next.length) {
    next = $(this).siblings(':first');
  }
  next.children(':first-child').clone().appendTo($(this));
  
  for (var i=0;i<6;i++) {
    next=next.next();
    if (!next.length) {
    	next = $(this).siblings(':first');
  	}
    
    next.children(':first-child').clone().appendTo($(this));
  }
});



  $('#myCarousel .col-xs-125').click(function(){
    $('#myCarousel .col-xs-125').removeClass('b');
    $(this).addClass('b');

  });

});