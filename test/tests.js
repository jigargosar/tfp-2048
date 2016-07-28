var Grid = TFP.APP2048.Grid;
var _ = TFP.Functional;

var G = Grid;
var createGridFromList = Grid.createGridFromList;

QUnit.test("Create Grid with specified values", function (a) {
    var initialGridValues = [
        2, 0, 0, 0,
        0, 0, 0, 0,
        2, 0, 0, 0,
        0, 0, 0, 0];

    var grid = createGridFromList(initialGridValues);
    a.deepEqual(G.toList(grid), initialGridValues);
});

QUnit.test("Grid slideLeft", function (a) {
    var initialGridValues = [
        2, 0, 2, 2,
        2, 4, 2, 4,
        2, 0, 0, 0,
        8, 8, 8, 8];


    var grid = createGridFromList(initialGridValues);
    a.deepEqual(G.slideLeft(grid), [
        4, 2, 0, 0,
        2, 4, 2, 4,
        2, 0, 0, 0,
        16, 16, 0, 0]);
});


QUnit.test("Grid slideUp", function (a) {
    var initialGridValues = [
        2, 0, 2, 2,
        2, 4, 2, 4,
        2, 0, 0, 0,
        8, 8, 8, 8];


    var grid = createGridFromList(initialGridValues);
    a.deepEqual(G.slideUp(grid), [
        4, 4, 4, 2,
        2, 8, 8, 4,
        8, 0, 0, 8,
        0, 0, 0, 0]);
});


QUnit.test("rotate right", function (a) {
    var initialGridValues = [
        [1, 2],
        [3, 4]
    ];

    var reverseRows = _.map(_.reverse);

    var zip2 = _.apply(_.zip);
    a.deepEqual(_.compose(reverseRows, _.transpose)(initialGridValues),
        [
            [3, 1],
            [4, 2]
        ]
    );
});


QUnit.test("rotate left", function (a) {
    var initialGridValues = [
        [1, 2],
        [3, 4]
    ];

    var reverseRows = _.map(_.reverse);

    var zip2 = _.apply(_.zip);
    a.deepEqual(_.compose(_.transpose, reverseRows)(initialGridValues),
        [
            [2, 4],
            [1, 3]
        ]
    );
});


