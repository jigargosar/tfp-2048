"use strict";


TFP.APP2048.Main = (function (_, mount, G, RootView) {

    var grid = G.createRandomGrid();
    console.log("Grid created: ", grid);
    function render() {
        mount("root", RootView(grid));
    }

    render();

    var slideGridForKeyCode = function (keyCode, grid) {
        const ArrowUp = 38;
        const ArrowDown = 40;
        const ArrowLeft = 37;
        const ArrowRight = 39;

        var keyCodes = [ArrowUp, ArrowDown, ArrowLeft, ArrowRight];
        var slideFns = [G.slideUp, G.slideDown, G.slideLeft, G.slideRight];
        var mapping = _.zipObj(keyCodes, slideFns);

        var safeSlide = _.propOr(_.identity, keyCode, mapping);
        return safeSlide(grid);
    };

    window.addEventListener("keyup", function (event) {
        // console.log(event.key, event.keyCode);
        grid = slideGridForKeyCode(event.keyCode, grid);
        render();
    });
})(TFP.Functional, G.DOM.mount, TFP.APP2048.Grid, TFP.APP2048.RootView);
