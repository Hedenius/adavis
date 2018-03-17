const COLOR = {
    gray:   "#B7C4CF",
    blue:   "#3565A1",
    orange: "#D55511",
    green:  "#74A82A",
    red:    "#A42F11",
    white:  "#FFF"
};

const STATES = {"default": 0, "finished": 1, "current": 2, "compare": 3, "minimal": 4, "hide": 5};
const COLORS = [COLOR.gray, COLOR.blue, COLOR.orange, COLOR.green, COLOR.red, COLOR.white];

/**
 * Displays the passed dataset as a barchart on the page.
 */
function setRects(dataset) {
    document.getElementById("chart").innerHTML = "";

    svg = d3.select("#chart")
        .append("svg")
        .attr("width", $("#content-card").width())
        .attr("height", height);

    var rects = svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect");

    rects.attr("x", function (d, i) {
        return i * (width / dataset.length);
    });

    rects.attr("y", function (d, i) {
        return Math.round(height - scale(d.num));
    });

    rects.attr("width", function (d, i) {
        return Math.round(($("#content-card").width() / dataset.length) - 2);
    });

    rects.attr("height", function (d, i) {
        return Math.round(scale(d.num));
    });

    rects.attr("fill", function (d, i) {
        return COLORS[d.state];
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
function redrawRects(dataset) {
    var rects = svg.selectAll("rect")
        .data(dataset)
        .transition()
        .duration(50 / 2 | 0);

    rects.attr("y", function (d, i) {
        return Math.round(height - scale(d.num));
    });

    rects.attr("width", function (d, i) {
        return Math.round(($("#content-card").width() / dataset.length) - 2);
    });

    rects.attr("height", function (d, i) {
        return Math.round(scale(d.num));
    });

    rects.attr("fill", function (d, i) {
        return COLORS[d.state];
    });
}

/**
 * Transforms the passed array of numbers into
 * an array of objects used to make sense of displayment.
 */
function createDataset(items) {
    var len = items.length;
    var dataset = [];
    for (var i = 0; i < len; i++) {
        dataset[i] = {
            num: items[i],
            state: STATES.default
        };
    }

    return dataset;
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
function randomArray(size) {
    var items = [];
    for(var i = 0; i < size; i++) {
        items.push(Math.floor(Math.random() * (100 - 1)) + 1);
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
}

