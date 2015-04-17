define(function(require, exports, module) {
    var MathUtilities = {};

    MathUtilities.interpolate = function(start, end, value) {
        if (start.isArray) return this.interpolateArray(start, end, value);
        return (end - start) * value + start;
    };

    MathUtilities.interpolateArray = function(start, end, value) {
        var array = [];
        for (var i = 0; i < start.length; i++) {
            array.push(this.interpolate(start[i], end[i], value));
        }
        return array;
    };

    MathUtilities.transpose = function(array) {
        var transpose = [];
        for (var i = 0; i < array[0].length; i++) {
            var row = [];
            for (var j = 0; j < array.length; j++) {
                row.push(array[j][i]);
            }
            transpose.push(row);
        }
        return transpose;
    };

    module.exports = MathUtilities;
});
