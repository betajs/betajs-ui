QUnit.test("jsdom", function (assert) {
    var done = assert.async();
    require('jsdom').env("<div><div id='qunit-fixture'></div></div>", [], function (err, window) {
        global.window = window;
        global.navigator = window.navigator;
        global.document = window.document;
        assert.ok(true);
        done();
    });
});

require("betajs");
require("betajs-browser");
require(__dirname + "/../dist/betajs-ui-noscoped.js");
require(__dirname + "/tests/scroll.js");
require(__dirname + "/tests/scoped.js");
