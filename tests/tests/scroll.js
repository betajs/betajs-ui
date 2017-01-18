test("test loop scroll", function() {
	stop();
	var element = document.getElementById("qunit-fixture");
	element.style.height = "400px";

	for (var i = 0; i < 20; ++i)
		element.appendChild(BetaJS.Browser.Dom.elementByTemplate("<div style='height:40px'>Item " + i + "</div>"));
	
	var scroll = new BetaJS.UI.Interactions.Loopscroll(element, {
		enabled: true,
		currentTop: true,
		discrete: true,
		scrollEndTimeout: 200,
		currentCenter: true
	});
	
	
	setTimeout(function () {
		var ele = element.children[1];
		scroll.scrollToElement(ele, {
			animate: true
		});
	}, 0);
	var first = false;
    scroll.on("scrolltoend", function () {
       if (first)
    	   return;
       first = true;
       try {
    	   scroll.destroy();
       } catch (e) {
    	   ok(false);
       }
       ok(true);
       start();
    });
});
