var width = $("#content-card").width();
var height = 250;

var dataset = [];
var dataCopy = [];
var actions = [];
var items = [];

var dataSize = DEFAULT_DATA_SIZE;
var speed = DEFAULT_SPEED_MS;

var interval;

var scale;
var svg;

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
    if ($("#btn-sort").html() === "Sort") {
        if (validateUserInput()) {
            $("#btn-sort").html("Abort");
            startBubbleSort();
        }
    } else if ($("#btn-sort").html() === "Abort") {
        $("#btn-sort").html("Sort");
        speed = DEFAULT_SPEED_MS;
        clearInterval(interval)
    }
}

function startBubbleSort() {
    actions = [];

    dataset = createDataset(items);
    dataCopy = dataset.slice(0);

    scale = d3.scaleLinear().domain([0, d3.max(items)]).range([0, height]);

    setRects(dataset);

    bubbleSort(dataset);

    animateActions(actions);
}

function animateActions(actions) {
    actions.reverse();
    var oldCompare = -1;
    interval = setInterval(function() {
        var action = actions.pop();
        if (action) switch (action.type) {
            case "compare":
                if (oldCompare !== -1) {
                    dataCopy[oldCompare].state = STATES.default;
                    dataCopy[oldCompare].state = STATES.default;
                }
                dataCopy[action.ind].state = STATES.current;
                dataCopy[action.ind + 1].state = STATES.compare;

                oldCompare = action.ind;
                redrawRects(dataCopy);
                break;

            case "swap":
                console.log("swap");
                swap(dataCopy, action.ind, action.ind + 1);

                dataCopy[action.ind].state = STATES.default;
                dataCopy[action.ind + 1].state = STATES.default;

                if(action.ind > 0) {
                    dataCopy[action.ind - 1].state = STATES.default;
                }

                redrawRects(dataCopy);
                break;

            case "finished":
                console.log("finished");
                dataCopy[action.ind].state = STATES.default;
                redrawRects(dataCopy);
                break;

        }

        if (actions.length === 0) {
            setSortedString();
            speed = DEFAULT_SPEED_MS;
            clearInterval(interval);
            $("#btn-sort").html("Sort");
        }
    }, speed);
}

function bubbleSort(items) {
    var j;
    var length = items.length;
    for (var i = 0; i < length; i++) {
        for (j = 0; j < (length - i - 1); j++) {
            actions.push({type: "compare", ind: j});
            if (items[j].num > items[j + 1].num) {
                swap(items, j, j + 1);
                actions.push({type: "swap", ind: j});
            }
        }
        actions.push({type: "finished", ind: j});
    }
}
