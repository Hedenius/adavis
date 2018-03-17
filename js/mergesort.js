const DEFAULT_SPEED_MS = 100;
const DEFAULT_DATA_SIZE = 20;

const COLOR = {
    gray:   "#B7C4CF",
    blue:   "#3565A1",
    orange: "#D55511",
    green:  "#74A82A",
    red:    "#A42F11",
    white:  "#FFF"
};

var width = 0;
var height = 0;

var dataset = [];
var actions = [];

var dataSize = DEFAULT_DATA_SIZE;
var speedMs = DEFAULT_SPEED_MS;

var scale;
var timer;
var svg;

function mergeSort(source) {
    var work = [];
    sort(source, work, 0, source.length - 1);
}

function sort(source, work, low, high) {
    // find mid without risk of overflow
    var mid = low +((high - low) / 2);

    // recursively sort left and right part
    sort(source, work, low, mid);
    sort(source, work, mid + 1, high);

    // merge result from work array to source array
    merge(source, work, mid, low, high);
}

function merge(source, work, low, mid, high) {
    for (var i = low; i < high; i++) {
        work[i] = source[i];
    }

    var left = low;
    var right = mid + 1;

    // copy (merge) values from positions in the left or right part of the work array
    // to position i in the source array.
    for (var i = low; i <= high; i++) {
        if (left > mid) {
            source[i] = work[right];
            right++;
        }
        else if (right > high) {
            source[i] = work[left];
            left++;
        }
        else if (work[left] < work[right]) {
            source[i] = work[left];
            left++;
        }
        else {
            source[i] = work[right];
            right++;
        }
    }
}

