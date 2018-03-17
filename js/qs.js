var width = $("#content-card").width();
var height = 250;
var color_default = "#6A6BCD";
var color_highlight = "#C24787";
var dataset;
var svg;
const defaultSpeed = 100;
var speed = defaultSpeed;
var actions = [];
var items = [];
var dataCopy;
var interval;

/**
 * Will scale the passed values to always fit the element.
 */
var scale;
// $(window).resize(setRects(dataCopy));
$("#btn-sort").click(actionButton);

/**
 * Will either start or abort the animation, based
 * on the current state of the button.
 */
function actionButton() {
    if($("#btn-sort").html() === "Sort") {
        $("#btn-sort").html("Abort");
        initSort();
    } else if($("#btn-sort").html() === "Abort") {
        $("#btn-sort").html("Sort");
        speed = defaultSpeed;
        clearInterval(interval)
    }
}

/**
 * Starts the sorting and animations.
 */
function initSort() {
    actions = [];

    var userArray = $("#user-input").val();
    if(userArray === "") {
        items = randomArray(50);
    } else {
        items = userArray.split(",").map(Number);
        items = shuffle(items);
    }
    scale = d3.scaleLinear().domain([0, d3.max(items)]).range([0, height]);
    dataset = createDataset(items);
    setRects(dataset);
    dataCopy = dataset.slice(0);

    var userSpeed = $("#user-speed").val();
    if(userSpeed !== "") {
        speed = userSpeed;
    }
    var result = quickSort(dataset, 0, dataset.length - 1);
    runActions();
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
    interval = setInterval(function step() {
        var action = actions.pop();
        if (action) switch (action.type) {
            case "partition": {
                if(oldPivot !== null && dataCopy[oldPivot].state === STATES.compare) {
                    dataCopy[oldPivot].state = STATES.default;
                }
                dataCopy[action.pivot].state = STATES.compare;
                oldPivot = action.pivot;
                redrawRects(dataCopy);
                break;
            }
            case "swap": {
                var temp = dataCopy[action.i];
                dataCopy[action.i] = dataCopy[action.j];
                dataCopy[action.j] = temp;
                if(dataCopy[action.i].state === STATES.compare) {
                    oldPivot = action.i;
                } else {
                    dataCopy[action.i].state = STATES.default;
                }
                if(dataCopy[action.j].state === STATES.compare) {
                    oldPivot = action.j;
                } else {
                    dataCopy[action.j].state = STATES.default;
                }
                redrawRects(dataCopy);
                break;
            }
            case "left": {
                if (dataCopy[action.left].state !== STATES.compare) {
                    dataCopy[action.left].state = STATES.finished;
                }
                if(oldLeft !== null && dataCopy[oldLeft].state === STATES.finished) {
                    dataCopy[oldLeft].state = STATES.default;
                }
                oldLeft = action.left;
                redrawRects(dataCopy);
                break;
            }
            case "right": {
                if (action.right > 0 && dataCopy[action.right].state !== STATES.compare) {
                    dataCopy[action.right].state = STATES.minimal;
                }
                if(oldRight !== null && oldRight > 0 && dataCopy[oldRight].state === STATES.minimal) {
                    dataCopy[oldRight].state = STATES.default;
                }
                oldRight = action.right;
                redrawRects(dataCopy);
                break;
            }
        }
        if (actions.length === 0) {
            for(var i = 0; i < dataCopy.length; i++) {
                dataCopy[i].state = STATES.default;
            }
            console.log(dataCopy);
            redrawRects(dataCopy);
            setSortedString();
            speed = defaultSpeed;   
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
            actions.push({ type: "swap", i: i, j: j});
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


