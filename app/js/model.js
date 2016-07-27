"use strict";

TFP.APP2048 = {};

TFP.APP2048.Grid = (function (_, A) {
    var gridCellCount = 4 * 4;

    var createCell = function () {
        return Math.random() > 0.8 ? 2 : 0;
    };

    var createGrid = function (list) {
        if (_.type(list) === "Array") {
            A.true(_.length(list) === gridCellCount, "Grid cell count should be exactly:" + gridCellCount);
            return _.clone(list);
        }
        return _.times(createCell, gridCellCount);
    };

    var compressRows = _.map(function (row) {
        var newRow = _.reject(_.equals(0), row);
        return _.concat(newRow, _.repeat(0, 4 - _.length(newRow)));
    });

    var listLensPairs = _.compose(_.aperture(2), _.times(_.lensIndex), _.length);

    var mergeLensValuesWhenEqual = function (lens1, lens2, list) {
        var lensValueEquals = _.converge(_.equals, [_.view(lens1), _.view(lens2)]);
        var mergeLensValues = _.compose(_.set(lens2, 0), _.over(lens1, _.multiply(2)));
        return _.when(lensValueEquals, mergeLensValues)(list);
    };

    var mergeAdjacentValuesWhenEqual = function (list) {
        var reducer = function (list, lensPair) {
            return _.apply(mergeLensValuesWhenEqual, _.append(list, lensPair));
        };
        return _.reduce(reducer, list, listLensPairs(list));
    };

    var mapNum = _.map;

    var applyToRows = function (fnList) {
        var allFns = _.compose(_.prepend(_.unnest), _.append(_.splitEvery(4)))(fnList);
        return _.apply(_.compose, allFns);
    };
    var slideRowsLeft = _.compose(
        compressRows,
        _.map(mergeAdjacentValuesWhenEqual),
        compressRows);

    var rotateRows90 = function (times) {
        return _.apply(_.compose, _.repeat(_.transpose, times));
    };
    return {
        createGridFromList: createGrid,
        createRandomGrid: createGrid,
        mapNum: mapNum,
        toList: mapNum(_.identity),
        slideLeft: applyToRows([
            slideRowsLeft
        ]),
        slideTop: applyToRows([
            rotateRows90(1),
            slideRowsLeft,
            rotateRows90(3)
        ]),
        slideRight: applyToRows([
            rotateRows90(2),
            slideRowsLeft,
            rotateRows90(2)
        ]),
        slideBottom: applyToRows([
            rotateRows90(3),
            slideRowsLeft,
            rotateRows90(1)
        ])
    };
})(TFP.Functional, G.Assert);
