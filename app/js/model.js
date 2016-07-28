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

    const applyN = _.compose(_.reduceRight(_.compose, _.identity), _.repeat);

    var rotateMatrixLeftN = function (n) {
        var reverseRows = _.map(_.reverse);
        var rotateLeft = _.compose(_.transpose, reverseRows);
        return applyN(rotateLeft, n)
    };

    var slideLeftWithPreSlideRotateLeftCount = (function () {

        var slideRowLeft = (function () {

            var moveNonZerosToLeft = function (list) {
                var nonZeroList = _.reject(_.equals(0), list);
                return _.concat(nonZeroList, _.repeat(0, _.length(list) - _.length(nonZeroList)));
            };

            var mergeAdjacentValuesToLeftWhenEqual = _.reduce(function (list, num) {
                return _.ifElse(
                    _.converge(_.equals, [_.always(num), _.last]),
                    _.converge(_.concat, [_.init, _.always([num * 2, 0])]),
                    _.append(num)
                )(list);
            }, []);

            return _.compose(
                moveNonZerosToLeft,
                mergeAdjacentValuesToLeftWhenEqual,
                moveNonZerosToLeft)
        })();

        return function slideLeftWithPreSlideRotateLeftCount(preSlideRotateLeftCount) {
            var postSlideRotateLeftCount = (4 - preSlideRotateLeftCount) % 4;
            return _.compose(
                _.unnest,
                rotateMatrixLeftN(postSlideRotateLeftCount),
                _.map(slideRowLeft),
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
