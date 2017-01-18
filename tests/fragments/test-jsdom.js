test("jsdom", function () {
	stop();
	require('jsdom').env("<div><div id='qunit-fixture'></div></div>", [], function (err, window) {
		global.window = window;
		global.navigator = window.navigator;
		global.document = window.document;
		window.BetaJS = global.BetaJS;
		ok(true);
		start();
	});		
});
