site.message = function(params) {
	if (site.message.shown == true) {
		return false;
	}

	site.message.shown = true;
	var params	= typeof(params) == 'object' ? params : {};
	var id		= params.id || new Date().getTime();
	var header	= params.header || 'Информация';
	var content	= params.content || '';
	var width	= params.width ? params.width + 'px' : 'auto';
	var height	= params.height ? params.height + 'px' : 'auto';

	jQuery("<div/>", {
		"id": id,
		"class": "infoblock front_popup",
		html: "<div class=\"title\" onmousedown=\"jQuery('#" + id + "').draggable({containment: 'document'})\">\
			<img src=\"/images/cms/eip/close.png\" alt=\"Закрыть\" title=\"Закрыть\" />\
			<h2>" + header + "</h2></div><div class=\"body\" onmousedown=\"jQuery('#" + id + "').draggable().draggable('destroy')\">\
			<div class=\"in\">" + content + "</div></div>"
	}).appendTo("body").parent().append("<div class='overlay'></div>");

	var popup = jQuery('#' + id);
	jQuery(popup).draggable();
	popup.css({'width':width, 'height':height});

	var leftPosition = (window.document.documentElement.offsetWidth - popup.width()) / 2;
	var windowHeight = window.innerHeight || window.document.documentElement.offsetHeight;
	var topPosition = jQuery(window.document.documentElement).scrollTop() || jQuery(window.document).scrollTop();
	topPosition = topPosition + (windowHeight - popup.height()) / 2;
	popup.css({'left':leftPosition  + 'px', 'top':topPosition + 'px'});

	jQuery('div.title img', popup).add(('.overlay')).click(function() {
		site.message.close(popup, jQuery('.overlay'))
	});
	jQuery(popup).on('click', 'a.close', function() {
		site.message.close(popup, jQuery('.overlay'))
	});
	var close;
	if (close = jQuery('.close', popup)) {
		close.click(function() {popup.remove();});
	}

	return true;
};

site.message.shown = false;

site.message.close = function(popup, overlay) {
	site.message.shown = false;
	overlay.remove();
	popup.remove();
}
