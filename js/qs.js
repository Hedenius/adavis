var width = $("#content-card").width();
var height = 250;
var states = { "default": 0, "finished": 1, "current": 2, "compare": 3, "minimal": 4, "hide": 5 };
var colors = ["#B7C4CF", "#3565A1", "#D55511", "#74A82A", "#A42F11", "#fff"];
var color_default = "#6A6BCD";
var color_highlight = "#C24787";
var dataset;
var svg;
var speed = 100;
var actions = [];
var items = [];
var dataCopy;

/**
 * Will scale the passed values to always fit the element.
 */
var scale;

$("#btn-sort").click(initSort);

/**
 * Starts the sorting and animations.
 */
function initSort() {
    var userArray = $("#user-input").val();
    if(userArray === "") {
        items = randomArray();
    } else {
        items = userArray.split(",").map(Number);
        items = shuffle(items);
    }
    scale = d3.scaleLinear().domain([0, d3.max(items)]).range([0, height]);
    setDataset(items);
    setRects(dataset);
    dataCopy = dataset.slice(0);

    var userSpeed = $("#user-speed").val();
    if(userSpeed !== "") {
        speed = userSpeed;
    }
    var result = quickSort(dataset, 0, dataset.length - 1);
    runActions();
}

// Fisher–Yates shuffle
function shuffle(array) {
    var i = array.length, j, t;
    while (--i > 0) {
      j = ~~(Math.random() * (i + 1));
      t = array[j];
      array[j] = array[i];
      array[i] = t;
    }
    return array;
  }

/**
 * Returns an array of random numbers between 1 and 100.
 * For when the user has not entered anything on their own.
 */
function randomArray() {
    items = [];
    for(var i = 0; i < 50; i++) {
        items.push(Math.floor(Math.random() * (100 - 1)) + 1);
    }
    return items;
}

/**
 * Various actions are pushed onto the Action array during the
 * sorting procedure. Those actions are popped here in reversed order
 * and animated on page.
 * States, that is, colours for the bars, are set and removed.
 * Jepp, den är rörig.
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
                if(oldPivot !== null && dataCopy[oldPivot].state === states.compare) {
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
                if(dataCopy[action.i].state === states.compare) {
                    oldPivot = action.i;
                } else {
                    dataCopy[action.i].state = states.default;   
                }
                if(dataCopy[action.j].state === states.compare) {
                    oldPivot = action.j;
                } else {
                    dataCopy[action.j].state = states.default;
                }
                redrawRects(dataCopy);
                break;
            }
            case "left": {
                if (dataCopy[action.left].state !== states.compare) {
                    dataCopy[action.left].state = states.finished;
                }
                if(oldLeft !== null && dataCopy[oldLeft].state === states.finished) {
                    dataCopy[oldLeft].state = states.default;
                }
                oldLeft = action.left;
                redrawRects(dataCopy);
                break;
            }
            case "right": {
                if (action.right > 0 && dataCopy[action.right].state !== states.compare) {
                    dataCopy[action.right].state = states.minimal;
                }
                if(oldRight !== null && oldRight > 0 && dataCopy[oldRight].state === states.minimal) {
                    dataCopy[oldRight].state = states.default;
                }
                oldRight = action.right;
                redrawRects(dataCopy);
                break;
            }
            // case "index": {
            //     if(oldIndex !== null) {
            //         dataCopy[oldIndex].state = states.default;
            //     }
            //     dataCopy[action.index].state = states.current;
            //     oldIndex = action.index;
            //     break;
            // }
        }
        if (actions.length === 0) {
            for(var i = 0; i < dataCopy.length; i++) {
                dataCopy[i].state = states.default;
            }
            console.log(dataCopy);
            redrawRects(dataCopy);
            setSortedString();
            clearInterval(interval);
        }
    }, speed);
}

/**
 * Displays the sorted array as a string, for fun.
 */
function setSortedString() {
    var output = String(dataset[0].num);
    for(var i = 1; i < dataset.length; i++) {
        output = output.concat(",");
        output = output.concat(dataset[i].num);
    }
    $("#user-input").val(output);
}

/**
 * Partition bit of the QuickSort.
 */
function partition(items, left, right) {
    var pivot = items[Math.floor((right + left) / 2)].num;
    actions.push({ type: "partition", pivot: Math.floor((right + left) / 2) });
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
        return Math.round(($("#content-card").width() / set.length) - 2);
    });

    rects.attr("height", function (d, i) {
        return Math.round(scale(d.num));
    });

    rects.attr("fill", function (d, i) {
        return colors[d.state];
    });
    
    //Ändrar sig inte vid redraw på korrekt sätt, så det får vara
    //en TODO.
    // rects.append("title").text(function(d, i) {
    //     return d.num;
    // });
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
        return Math.round(($("#content-card").width() / data.length) - 2);
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
    var len = items.length;
    dataset = [];
    for (var i = 0; i < len; i++) {
        dataset[i] = {
            num: items[i],
            state: states.default
        };
    }
}

