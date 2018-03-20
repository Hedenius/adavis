var width = $("#content-card").width();
var height = 250;
var dataset;
var svg;
var speed = DEFAULT_SPEED_MS;
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
        if (validateUserInput()) {
            $("#btn-sort").html("Abort");
            initSort();
        }
    } else if($("#btn-sort").html() === "Abort") {
        $("#btn-sort").html("Sort");
        speed = DEFAULT_SPEED_MS;
        clearInterval(interval)
    }
}

/**
 * Starts the sorting and animations.
 */
function initSort() {
    actions = [];

    dataset = createDataset(items);
    dataCopy = dataset.slice(0);

    scale = d3.scaleLinear().domain([0, d3.max(items)]).range([0, height]);

    setRects(dataset);

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
            speed = DEFAULT_SPEED_MS;
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


