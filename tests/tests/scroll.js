test("test loop scroll", function() {
	stop();stop();
	var element = $("#qunit-fixture");
	$("#qunit-fixture").css("height", "400px");

	for (var i = 0; i < 20; ++i)
		element.append("<div style='height:40px'>Item " + i + "</div>");

	var scroll = new BetaJS.UI.Interactions.LoopScroll(element, {
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
    scroll.on("scrolltoend", function () {
       ok(true);
       start();
    });
});
