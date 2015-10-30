$(document).ready(function(){

	$('.multiseelctUl').on('click','li',function(){
    $(this).remove();
  });

  function appendTags(value){
    $('.multiseelctUl').append('<li>'+value+'</li>');
  }
  appendTags('mains');

});