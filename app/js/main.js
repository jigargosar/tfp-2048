"use strict";


TFP.APP2048.Main = (function (_, mount, Grid, RootView) {

    var grid = Grid();
    console.log("Grid created: ", grid);
    mount("root", RootView(grid));
})(TFP.Functional, G.DOM.mount, TFP.APP2048.Grid, TFP.APP2048.RootView);
