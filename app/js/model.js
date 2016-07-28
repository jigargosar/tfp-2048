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

    var createRandomCellValue = function () {
        return Math.random() > 0.8 ? 2 : 0;
    };

    var createRandomFillValue = function () {
        return Math.random() > 0.8 ? 2 : 4;
    };


    var createGrid = (function () {
        return function (list) {
            if (_.type(list) === "Array") {
                A.true(_.length(list) === totalCells, "list size should be exactly:" + totalCells);
                return _.clone(list);
            }
            return _.times(createRandomCellValue, totalCells);
        }
    })();

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


    var mapNum = _.map;

    return {
        createGridFromList: createGrid,
        createRandomGrid: createGrid,
        mapNum: mapNum,
        toList: mapNum(_.identity),
        slideLeft: slideLeft({rotateLeftCount: 0}),
        slideUp: slideLeft({rotateLeftCount: 1}),
        slideRight: slideLeft({rotateLeftCount: 2}),
        slideDown: slideLeft({rotateLeftCount: 3}),
        addRandomNumber: function (grid) {
            var randomValue = createRandomFillValue();
            var randomIndex = function () {
                return (Math.random() * 16) | 0;
            };
            return _.reduce(function (grid) {
                var ri = randomIndex();
                console.log(ri, randomValue);
                if (grid[ri] === 0) {
                    return _.reduced(_.update(ri, randomValue, grid));
                }
                return grid;
            }, grid, _.range(0, 16 * 16 * 100))
        }
    };
})(TFP.Functional, G.Assert);
