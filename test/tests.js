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


QUnit.test("Grid slideTop", function (a) {
    var initialGridValues = [
        2, 0, 2, 2,
        2, 4, 2, 4,
        2, 0, 0, 0,
        8, 8, 8, 8];


    var grid = createGridFromList(initialGridValues);
    a.deepEqual(G.slideTop(grid), [
        2, 0, 2, 2,
        2, 4, 2, 4,
        2, 0, 0, 0,
        8, 8, 8, 8]);
});



