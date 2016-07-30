"use strict";

TFP.APP2048 = {};

TFP.APP2048.Grid = (function (_, A) {

    var composeN = _.curry(function composeN(fn, n) {
        return _.reduce(_.compose, _.compose(_.identity), _.repeat(fn, n));
    });

    var rotateMatrixLeftN = (function () {
        var reverseRows = _.map(_.reverse);
        var rotateLeft = _.compose(_.transpose, reverseRows);
        return composeN(rotateLeft);
    })();

    // var log = _.bind(console.log, console);
    // var prettyPrint = function (rows) {
    //     _.forEach(log, rows)
    // };

// todo: move above code to tfp.Functional

    var totalCells = 4 * 4;

    var randomCellValueForGrid = function () {
        return Math.random() > 0.8 ? 2 : 0;
    };

    var randomCellValue = function () {
        return Math.random() > 0.8 ? 2 : 4;
    };

    var createRandomGrid = function () {
        return _.times(randomCellValueForGrid, totalCells);
    };

    var createGridFromList = function (list) {
        return _.clone(list);
    };

    var slideLeft = (function () {

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

        return function (options) {
            var preSlideRotateLeftCount = options.rotateLeftCount;
            var postSlideRotateLeftCount = (4 - preSlideRotateLeftCount) % 4;
            return _.compose(
                _.unnest,
                rotateMatrixLeftN(postSlideRotateLeftCount),
                _.map(slideRowLeft),
                rotateMatrixLeftN(preSlideRotateLeftCount),
                _.splitEvery(4));
        }
    })();


    var reduceWithIndex = _.addIndex(_.reduce);
    var mapNum = _.map;

    function indicesWithZero(grid) {
        return reduceWithIndex(function (zeroIndices, value, idx) {
            return value === 0 ? _.append(idx, zeroIndices) : zeroIndices;
        }, [], grid);
    }

    return {
        createGridFromList: createGridFromList,
        createRandomGrid: createRandomGrid,
        mapNum: mapNum,
        toList: mapNum(_.identity),
        slideLeft: slideLeft({rotateLeftCount: 0}),
        slideUp: slideLeft({rotateLeftCount: 1}),
        slideRight: slideLeft({rotateLeftCount: 2}),
        slideDown: slideLeft({rotateLeftCount: 3}),
        addRandomNumber: function (grid) {
            var zeroIndices = indicesWithZero(grid);
            if (_.isEmpty(zeroIndices)) {
                console.log("Game over");
                return grid;
            } else {
                var randomIndex = (Math.random() * _.length(zeroIndices)) | 0;
                return _.update(zeroIndices[randomIndex], randomCellValue(), grid)
            }
        }
    };
})(TFP.Functional, G.Assert);
