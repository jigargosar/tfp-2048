"use strict";


TFP.APP2048.Main = (function (_, mount, G, RootView) {

    var grid = G.createRandomGrid();
    console.log("Grid created: ", grid);
    function render() {
        mount("root", RootView(grid));
    }

    render();

    const ArrowUp = 38;
    const ArrowDown = 40;
    const ArrowLeft = 37;
    const ArrowRight = 39;
    window.addEventListener("keyup", function (event) {
        console.log(event.key, event.keyCode);
        var gridFn = _.cond([
            [_.equals(ArrowUp), _.always(G.slideUp)],
            [_.equals(ArrowDown), _.always(G.slideDown)],
            [_.equals(ArrowLeft), _.always(G.slideLeft)],
            [_.equals(ArrowRight), _.always(G.slideRight)],
            [_.T, _.identity]
        ])(event.keyCode);

        grid = gridFn(grid);
        render();
    });
})(TFP.Functional, G.DOM.mount, TFP.APP2048.Grid, TFP.APP2048.RootView);
