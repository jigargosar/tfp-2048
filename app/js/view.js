"use strict";

TFP.APP2048.GridView = (function (_, e, G) {

    var CellView = function (content) {
        return e(".cell", [e(".content", content)]);
    };

    var CellViewFromNum = _.compose(
        CellView,
        _.when(_.equals("0"), _.always("_")),
        _.toString
    );

    return function (grid) {
        return e("#game-grid", G.mapNum(CellViewFromNum, grid))
    };

})(TFP.Functional, G.DOM.createElement, TFP.APP2048.Grid);

TFP.APP2048.RootView = (function (_, e, GridView) {

    return function (grid) {
        return e("#main", [
            e("h1", "Functional 2048"),
            GridView(grid)
        ]);
    };

})(TFP.Functional, G.DOM.createElement, TFP.APP2048.GridView);
