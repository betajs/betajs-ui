test("test drop", function() {
    stop();
    var element = document.createElement("div");
    document.body.appendChild(element);
    var innerHTML = '<div class="doodads" id="drag">';
    for (var i = 1; i <= 5; ++i)
        innerHTML += '<div class="doodad"><div class="inner">Doodad ' + i + '</div></div>';
    innerHTML += '</div><div class="doodads" id="drop">';
    for (var j = 6; j <= 10; ++j)
        innerHTML += '<div class="doodad"><div class="inner">Doodad ' + j + '</div></div>';
    innerHTML += '</div>';
    element.innerHTML = innerHTML;
    BetaJS.UI.Interactions.Drag.multiple(document.querySelectorAll("#drag .doodad"), {
        droppable: true,
        enabled: true,
        clone_element: true,
        remove_element_on_drop: true
    }, function (drag) {
        drag.on("move", function (event) {
            event.actionable_modifier.csscls("focus", true);
            event.modifier.csscls("unfocus", true);
        });
    });
    var drop = new BetaJS.UI.Interactions.Drop(document.querySelector("#drop"), {
        enabled: true
    });
    drop.on("hover", function (dr) {
        dr.modifier.css("border", "4px solid green");
    });
    drop.on("dropped", function (event) {
        var dropped = document.createElement("div");
        dropped.className = "doodad";
        dropped.innerHTML = event.source.element.innerHTML;
        document.querySelector("#drop").appendChild(dropped);
    });

    var interactor = new BetaJS.UI.Helpers.Interactor({ delay: 1 });

    interactor.mousedown("#drag .doodad").success(function () {
        interactor.mousemoveToElement("#drop .doodad").success(function () {
            interactor.mouseup().success(function () {
                QUnit.equal(document.querySelectorAll("#drag .doodad").length, 4);
                QUnit.equal(document.querySelectorAll("#drop .doodad").length, 6);
                start();
                document.body.removeChild(element);
            });
        });
    });
});