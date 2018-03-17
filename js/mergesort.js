const DEFAULT_SPEED_MS = 100;
const DEFAULT_DATA_SIZE = 50;

var width = $("#content-card").width();
var height = 250;

var dataset = [];
var dataCopy = [];
var actions = [];
var items = [];

var dataSize = DEFAULT_DATA_SIZE;
var speedMs = DEFAULT_SPEED_MS;

var scale;
var svg;

$("#btn-sort").click(startMergeSort);

function startMergeSort() {
    getUserInput();

    actions = [];
    items = randomArray(dataSize);

    dataset = createDataset(items);
    dataCopy = dataset.slice(0);

    scale = d3.scaleLinear().domain([0, d3.max(items)]).range([0, height]);

    setRects(dataset);

    mergeSort(dataset);

    animateActions(actions)
}

function animateActions(actions) {
    actions.reverse();
    var oldLeft = -1;
    var oldRight = -1;
    var oldCopy = -1;

    var interval = setInterval(function() {
        var action = actions.pop();
        if (action) switch (action.type) {
            case "mark_boundary":
                dataCopy[action.low].state = STATES.current;
                dataCopy[action.mid].state = STATES.minimal;
                dataCopy[action.high].state = STATES.current;
                redrawRects(dataCopy);
                break;

            case "unmark_boundary":
                dataCopy[action.low].state = STATES.default;
                dataCopy[action.mid].state = STATES.default;
                dataCopy[action.high].state = STATES.default;
                redrawRects(dataCopy);
                break;

            case "compare":
                if (oldLeft !== -1) {
                    dataCopy[oldLeft].state = STATES.default;
                }
                if (oldRight !== -1) {
                    dataCopy[oldRight].state = STATES.default;
                }

                dataCopy[action.left].state = STATES.compare;
                dataCopy[action.right].state = STATES.compare;

                oldLeft = action.left;
                oldRight = action.right;

                redrawRects(dataCopy);
                break;

            case "copy":
                if (oldCopy !== -1) {
                    dataCopy[oldCopy].state = STATES.default;
                }

                dataCopy[action.ind].state = STATES.finished;
                dataCopy[action.ind].num = action.val;

                oldCopy = action.ind;
                redrawRects(dataCopy);
                break;
        }
    }, speedMs);
}

function mergeSort(dataset) {
    sort(dataset, 0, dataset.length);
}

function sort(dataset, low, high) {
    if (low  + 1 < high) {
        var mid = Math.floor((low + high) / 2);

        sort(dataset, low, mid);
        sort(dataset, mid, high);

        merge(dataset, low, mid, high);
    }
}

function merge(dataset, low, mid, high) {
    actions.push({
            type: "mark_boundary",
            low: low,
            mid: mid,
            high: high - 1,
    });

    var dest = [];

    var left = low;
    var right = mid;

    while (left < mid && right < high) {

        actions.push({
           type: "compare",
           left: left,
           right: right
        });

        if (dataset[left].num < dataset[right].num) {
            dest.push(dataset[left]);
            left++;
        }
        else {
            dest.push(dataset[right]);
            right++;
        }
    }

    while (left < mid) {
        dest.push(dataset[left]);
        left++;
    }

    while (right < high) {
        dest.push(dataset[right]);
        right++;
    }

    for (var j = 0; j < high - low; ++j) {

        actions.push({
           type: "copy",
           ind: low + j,
           val: dest[j].num
        });

        dataset[low + j] = dest[j];
    }

    actions.push({
        type: "unmark_boundary",
        low: low,
        mid: mid,
        high: high - 1,
    });
}

function getUserInput() {
    var userInput = $("#user-input").val();
    if (userInput !== "") {
        dataSize = userInput;
    }

    var userSpeed = $("#user-speed").val();
    if(userSpeed !== "") {
        speedMs = userSpeed;
    }
}