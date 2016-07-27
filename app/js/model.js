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


    var mergeLensValuesWhenEqual = function (lens1, lens2) {
        var lensValueEquals = _.converge(_.equals, [_.view(lens1), _.view(lens2)]);
        var mergeLensValues = _.compose(_.set(lens2, 0), _.over(lens1, _.multiply(2)));
        return _.when(lensValueEquals, mergeLensValues);
    };
    var lensPairs = _.compose(_.aperture(2), _.times(_.lensIndex), _.length);

    var addAdjacentNums = function (list) {
        var updateListReducer = function (list, lensPair) {
            return _.apply(mergeLensValuesWhenEqual, lensPair)(list);
        };
        return _.reduce(updateListReducer, list, lensPairs(list));
    };

    var mapNum = _.map;
    return {
        createGridFromList: createGrid,
        createRandomGrid: createGrid,
        mapNum: mapNum,
        toList: mapNum(_.identity),
        slideLeft: _.compose(
            _.unnest,
            compressRows,
            _.map(addAdjacentNums),
            compressRows,
            _.splitEvery(4))
    };
})(TFP.Functional, G.Assert);
