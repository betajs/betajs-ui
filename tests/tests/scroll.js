test("test loop scroll", function() {
	stop();
	var element = $("#qunit-fixture");
	$("#qunit-fixture").css("height", "400px");

	for (var i = 0; i < 20; ++i)
		element.append("<div style='height:40px'>Item " + i + "</div>");
	
	var scroll = new BetaJS.UI.Interactions.Loopscroll(element, {
		enabled: true,
		currentTop: true,
		discrete: true,
		scrollEndTimeout: 200,
		currentCenter: true
	});
	
	
	setTimeout(function () {
		var ele = $(element.children().get(1));
		scroll.scrollToElement(ele, {
			animate: true
		});
	}, 0);
	var first = false;
    scroll.on("scrolltoend", function () {
       if (first)
    	   return;
       first = true;
       ok(true);
       start();
    });
});
