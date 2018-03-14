var width = 500;
var height = 190;
var states = { "default": 0, "finished": 1, "current": 2, "compare": 3, "minimal": 4, "hide": 5 };
var colors = ["#B7C4CF", "#3565A1", "#D55511", "#74A82A", "#A42F11", "#fff"];
var color_default = "#6A6BCD";
var color_highlight = "#C24787";
var dataset;
var svg;
var speed = 200;
var actions = [];

var items = [24, 1, 23, 56, 7, 85, 35, 123, 2, 46, 35, 28, 39, 12, 15, 65,32,89,100];

/**
 * Will scale the passed values to always fit the element.
 */
var scale = d3.scaleLinear().domain([0, d3.max(items)]).range([9, height]);

setDataset(items);

//Copy of dataset, that is necessary to keep references apart.
var dataCopy = dataset.slice(0);

setRects(dataset);

var result = quickSort(dataset, 0, dataset.length - 1);
runActions();


/**
 * Various actions are pushed onto the Action array during the
 * sorting procedure. Those actions are popped here in reversed order
 * and animated on page.
 * States, that is, colours for the bars, are set and removed.
 */
function runActions() {
    actions.reverse();
    var oldPivot = null;
    var oldIndex = null;
    var oldLeft = null;
    var oldRight = null;
    var interval = setInterval(function step() {
        var action = actions.pop();
        if (action) switch (action.type) {
            case "partition": {
                console.log("old: " + oldPivot + " new: " + action.pivot);
                if(oldPivot != null && dataCopy[oldPivot].state === states.compare) {
                    dataCopy[oldPivot].state = states.default;
                }
                dataCopy[action.pivot].state = states.compare;
                oldPivot = action.pivot;
                redrawRects(dataCopy);
                break;
            }
            case "swap": {
                var temp = dataCopy[action.i];
                dataCopy[action.i] = dataCopy[action.j];
                dataCopy[action.j] = temp;
                dataCopy[action.i].state = states.default;
                dataCopy[action.j].state = states.default;
                redrawRects(dataCopy);
                break;
            }
            case "left": {
                if (dataCopy[action.left].state != states.compare) {
                    dataCopy[action.left].state = states.finished;
                }
                if(oldLeft != null && dataCopy[oldLeft].state === states.finished) {
                    dataCopy[oldLeft].state = states.default;
                }
                oldLeft = action.left;
                redrawRects(dataCopy);
                break;
            }
            case "right": {
                if (dataCopy[action.right].state != states.compare) {
                    dataCopy[action.right].state = states.minimal;
                }

                if(oldRight != null && dataCopy[oldRight].state === states.minimal) {
                    dataCopy[oldRight].state = states.default;
                }
                oldRight = action.right;
                redrawRects(dataCopy);
                break;
            }
            case "index": {
                if(oldIndex != null) {
                    dataCopy[oldIndex].state = states.default;
                }
                dataCopy[action.index].state = states.current;
                oldIndex = action.index;
                break;
            }
        }
        if (actions.length == 0) {
            clearInterval(interval);
        }
    }, speed);
}

/**
 * Partition bit of the QuickSort.
 */
function partition(items, left, right) {
    var pivot = items[Math.floor((right + left) / 2)].num;
    actions.push({ type: "partition", pivot: Math.floor((right + left) / 2) });
    var wait = false;
    var i = left;
    actions.push({type: "left", left: i});
    var j = right;
    actions.push({type: "right", right: j});
    while (i <= j) {
        while (items[i].num < pivot) {
            i++;
            actions.push({ type: "left", left: i });
        }
        while (items[j].num > pivot) {
            j--;
            actions.push({ type: "right", right: j });
        }
        if (i <= j) {
            swap(items, i, j);
            i++;
            actions.push({ type: "left", left: i });
            j--;
            actions.push({ type: "right", right: j });
        }
    }
    return i;
}

/**
 * Standard recursive QuickSort.
 */
function quickSort(items, left, right) {
    var index;
    if (items.length > 1) {
        index = partition(items, left, right);
        actions.push({type: "index", index: index});
        if (left < index - 1) {
            quickSort(items, left, index - 1);
        }
        if (index < right) {
            quickSort(items, index, right);
        }
    }
    return items;
}

/**
 * Standard swap function.
 */
function swap(items, firstIndex, secondIndex) {
    var temp = items[firstIndex];
    items[firstIndex] = items[secondIndex];
    items[secondIndex] = temp;
    actions.push({ type: "swap", i: firstIndex, j: secondIndex });
}

/**
 * Displays the passed dataset as a barchart on the page.
 */
function setRects(set) {
    document.getElementById("chart").innerHTML = "";

    svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var rects = svg.selectAll("rect")
        .data(set)
        .enter()
        .append("rect");

    rects.attr("x", function (d, i) {
        return i * (width / set.length);
    });

    rects.attr("y", function (d, i) {
        return Math.round(height - scale(d.num));
    });

    rects.attr("width", function (d, i) {
        return Math.round((width / set.length) - 2);
    });

    rects.attr("height", function (d, i) {
        return Math.round(scale(d.num));
    });

    rects.attr("fill", function (d, i) {
        return colors[d.state];
    });
}

/**
 * Redraws the passed set of data as new bar charts.
 * Updates their length and color, basically.
 */
function redrawRects(data) {
    var rects = svg.selectAll("rect")
        .data(data)
        .transition()
        .duration(50 / 2 | 0);

    rects.attr("y", function (d, i) {
        return Math.round(height - scale(d.num));
    });

    rects.attr("width", function (d, i) {
        return Math.round((width / data.length) - 2);
    });

    rects.attr("height", function (d, i) {
        return Math.round(scale(d.num));
    });

    rects.attr("fill", function (d, i) {
        return colors[d.state];
    });
}

/**
 * Transforms the passed array of numbers into
 * an array of objects used to make sense of displayment.
 */
function setDataset(items) {
    len = items.length;
    var i = 0;
    dataset = [];
    for (; i < len; i++) {
        dataset[i] = {
            num: items[i],
            state: states.default
        };
    }
}

