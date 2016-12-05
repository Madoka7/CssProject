$(document).ready(function(){
	var $simgs = $(".panel-software .software-item .item-img");
	$simgs.each(function(){
		$(this).css("color","red");
		var src = $(this).data("image");
		$(this).css("background-image","url('" + src + "')").css("background-position","0px 0px");
	});
});