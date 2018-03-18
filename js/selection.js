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

var scale;

$(window).resize(function () {
    width = $("#content-card").width();

    if (dataCopy.length > 0) {
        setRects(dataCopy);
    }
});

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
    var result = selectionSort(dataset);
    runActions();
}

/**
 * Various actions are pushed onto the Action array during the
 * sorting procedure. Those actions are popped here in reversed order
 * and animated on page.
 * States, that is, colours for the bars, are set and removed.
 */
function runActions() {
    actions.reverse();
    var oldMin = 0;
    var oldCompare = 0;
    var oldCurrent = null;
    interval = setInterval(function step() {
        var action = actions.pop();
        if (action) switch (action.type) {
            case "swap": {
                var temp = dataCopy[action.i];
                dataCopy[action.i] = dataCopy[action.min];
                dataCopy[action.min] = temp;
                dataCopy[action.i].state = STATES.default;
                dataCopy[action.min].state = STATES.default;
                if(action.i > 0) {
                    dataCopy[action.i - 1].state = STATES.default;
                }
                // dataCopy[action.j].state = STATES.default;
                redrawRects(dataCopy);
                break;
            }
            case "min": {
                if(dataCopy[action.min].state !== STATES.finished) {
                    dataCopy[action.min].state = STATES.current;    
                }
                if(dataCopy[oldMin].state !== STATES.finished) {
                    dataCopy[oldMin].state = STATES.default;
                }
                oldMin = action.min;
                redrawRects(dataCopy);
                break;
            }
            case "compare": {
                if(dataCopy[action.compare].state !== STATES.finished) {
                    dataCopy[action.compare].state = STATES.compare;
                }
                if(dataCopy[oldCompare].state === STATES.compare) {
                    dataCopy[oldCompare].state = STATES.default;
                }
                oldCompare = action.compare;
                redrawRects(dataCopy);
                break;
            }
            case "current": {
                dataCopy[action.current].state = STATES.finished;
                if(oldCurrent !== null) {
                    dataCopy[oldCurrent].state = STATES.default;
                }
                oldCurrent = action.current;
                redrawRects(dataCopy);
            }
        }
        if (actions.length === 0) {
            if(dataCopy[dataCopy.length - 1].state !== STATES.default) {
                dataCopy[dataCopy.length - 1].state = STATES.default;
            }
            // for(var i = 0; i < dataCopy.length; i++) {
            //     dataCopy[i].state = STATES.finished;
            // }
            redrawRects(dataCopy);
            setSortedString();
            speed = defaultSpeed;
            $("#btn-sort").html("Sort");
            clearInterval(interval);
        }
    }, speed);
}

function selectionSort(items){
    var len = items.length;
    var min;
    for (var i = 0; i < len; i++) {
        //set minimum to this position
        actions.push({type: "current", current: i});
        min = i;
        actions.push({type: "min", min: i});
        //check the rest of the array to see if anything is smaller
        for (var j = i + 1; j < len; j++) {
            actions.push({type: "compare", compare: j});
            if (items[j].num < items[min].num) {
                min = j;
                actions.push({type: "min", min: j})
            }
        }
        //if the minimum isn't in the position, swap it
        if (i != min) {
            swap(items, i, min);
            actions.push({type: "swap", i:i, min:min});
        }
    }
    return items;
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

