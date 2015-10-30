$(document).ready(function(){

	$('.multiseelctUl').on('click','li',function(){
    $(this).remove();
  });
  //appendTags('mains');
  google.maps.event.addDomListener(window, 'load', initialize);
});