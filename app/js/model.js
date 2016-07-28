"use strict";

TFP.APP2048 = {};

TFP.APP2048.Grid = (function (_, A) {
    var gridCellCount = 4 * 4;

    var createGrid = (function () {
        var createCell = function () {
            return Math.random() > 0.8 ? 2 : 0;
        };
        return function (list) {
            if (_.type(list) === "Array") {
                A.true(_.length(list) === gridCellCount, "Grid cell count should be exactly:" + gridCellCount);
                return _.clone(list);
            }
            return _.times(createCell, gridCellCount);
        }
    })();

    var rotateMatrixLeftN = (function () {
        var reverseRows = _.map(_.reverse);
        var rotateLeft = _.compose(_.transpose, reverseRows);
        return function rotateLeftN(n) {
            if (n === 0) {
                return _.identity;
            }
            return _.apply(_.compose, _.repeat(rotateLeft, n))
        }
    })();


    var viewEq = _.curry(function (lens1, lens2, object) {
        return _.converge(_.equals, [_.view(lens1), _.view(lens2)])(object)
    });

    function mapToLensIndex(list) {
        return _.times(_.lensIndex, _.length(list));
    }

    var slideLeftWithPreSlideRotateLeftCount = (function () {

        var slideRowsLeft = (function () {

            var moveZerosToRight = _.map(function (list) {
                var nonZeroList = _.reject(_.equals(0), list);
                return _.concat(nonZeroList, _.repeat(0, _.length(list) - _.length(nonZeroList)));
            });

            var mergeAdjacentValuesWhenEqual = (function () {

                var mergeLensValuesWhenEqual = function (list, lensPair) {
                    var mergeLensValues = _.curry(function (lens1, lens2, list) {
                        return _.compose(
                            _.set(lens2, 0),
                            _.over(lens1, _.multiply(2))
                        )(list)
                    });
                    var withLensPair = _.apply(_.__, lensPair);
                    return _.when(
                        withLensPair(viewEq),
                        withLensPair(mergeLensValues)
                    )(list);
                };

                return function (list) {
                    return _.reduce(
                        mergeLensValuesWhenEqual,
                        list,
                        _.aperture(2, mapToLensIndex(list))
                    );
                }
            })();

            return _.compose(
                moveZerosToRight,
                _.map(mergeAdjacentValuesWhenEqual),
                moveZerosToRight);
        })();

        return function slideLeftWithPreSlideRotateLeftCount(preSlideRotateLeftCount) {
            var postSlideRotateLeftCount = (4 - preSlideRotateLeftCount) % 4;
            return _.compose(
                _.unnest,
                rotateMatrixLeftN(postSlideRotateLeftCount),
                slideRowsLeft,
                rotateMatrixLeftN(preSlideRotateLeftCount),
                _.splitEvery(4));
        }
    })();


    // var log = _.bind(console.log, console);
    // var prettyPrint = function (rows) {
    //     _.forEach(log, rows)
    // };

    var mapNum = _.map;

    return {
        createGridFromList: createGrid,
        createRandomGrid: createGrid,
        mapNum: mapNum,
        toList: mapNum(_.identity),
        slideLeft: slideLeftWithPreSlideRotateLeftCount(0),
        slideUp: slideLeftWithPreSlideRotateLeftCount(1),
        slideRight: slideLeftWithPreSlideRotateLeftCount(2),
        slideDown: slideLeftWithPreSlideRotateLeftCount(3),
        addRandomNumber: function (grid) {

        }
    };
})(TFP.Functional, G.Assert);
