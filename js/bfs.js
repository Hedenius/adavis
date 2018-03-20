const DEFAULT_SPEED = 2000;
const DEFAULT_END = "Z";

const nodes = [
    {name: "A", index: 0}, // 0
    {name: "B", index: 1}, // 1
    {name: "C", index: 2}, //2
    {name: "D", index: 3}, //3
    {name: "E", index: 4}, // 4
    {name: "F", index: 5}, // 5
    {name: "G", index: 6}, // 6
    {name: "H", index: 7}, // 7
    {name: "I", index: 8}, // 8
    {name: "J", index: 9}, // 9
    {name: "K", index: 10}, // 10
    {name: "L", index: 11}, // 11
    {name: "M", index: 12}, // 12
    {name: "N", index: 13}, // 13
    {name: "O", index: 14}, // 14
    {name: "P", index: 15}, // 15
    {name: "Q", index: 16}, // 16
    {name: "R", index: 17}, // 17
    {name: "S", index: 18}, // 18
    {name: "T", index: 19}, // 19
    {name: "U", index: 20}, // 20
    {name: "V", index: 21}, // 21
    {name: "W", index: 22}, // 22
    {name: "X", index: 23}, // 23
    {name: "Y", index: 24}, // 24
    {name: "Z", index: 25}, // 25
];

const edges = [
    {source: nodes[0], target: nodes[1]},
    {source: nodes[0], target: nodes[17]},
    {source: nodes[0], target: nodes[4]},
    {source: nodes[1], target: nodes[10]},
    {source: nodes[1], target: nodes[20]},
    {source: nodes[2], target: nodes[3]},
    {source: nodes[2], target: nodes[7]},
    {source: nodes[3], target: nodes[13]},
    {source: nodes[4], target: nodes[5]},
    {source: nodes[5], target: nodes[15]},
    {source: nodes[5], target: nodes[11]},
    {source: nodes[6], target: nodes[8]},
    {source: nodes[6], target: nodes[23]},
    {source: nodes[7], target: nodes[9]},
    {source: nodes[7], target: nodes[6]},
    {source: nodes[9], target: nodes[22]},
    {source: nodes[9], target: nodes[5]},
    {source: nodes[9], target: nodes[8]},
    {source: nodes[10], target: nodes[2]},
    {source: nodes[10], target: nodes[3]},
    {source: nodes[10], target: nodes[11]},
    {source: nodes[11], target: nodes[25]},
    {source: nodes[12], target: nodes[4]},
    {source: nodes[12], target: nodes[1]},
    {source: nodes[12], target: nodes[5]},
    {source: nodes[13], target: nodes[24]},
    {source: nodes[13], target: nodes[0]},
    {source: nodes[14], target: nodes[17]},
    {source: nodes[15], target: nodes[8]},
    {source: nodes[15], target: nodes[25]},
    {source: nodes[15], target: nodes[9]},
    {source: nodes[16], target: nodes[13]},
    {source: nodes[16], target: nodes[17]},
    {source: nodes[17], target: nodes[11]},
    {source: nodes[18], target: nodes[4]},
    {source: nodes[18], target: nodes[2]},
    {source: nodes[19], target: nodes[14]},
    {source: nodes[19], target: nodes[16]},
    {source: nodes[19], target: nodes[10]},
    {source: nodes[19], target: nodes[0]},
    {source: nodes[19], target: nodes[12]},
    {source: nodes[20], target: nodes[23]},
    {source: nodes[20], target: nodes[17]},
    {source: nodes[21], target: nodes[5]},
    {source: nodes[21], target: nodes[9]},
    {source: nodes[22], target: nodes[2]},
    {source: nodes[22], target: nodes[1]},
    {source: nodes[23], target: nodes[16]},
    {source: nodes[23], target: nodes[18]},
    {source: nodes[24], target: nodes[20]},
    {source: nodes[24], target: nodes[2]},
    {source: nodes[25], target: nodes[19]},
    {source: nodes[25], target: nodes[21]},
];

var speed; // user-defined
var start; // user-defined
var end; // user-defined

// algo-specific
var graph;
var edgeTo = new Array(nodes.length);
var marked = new Array(nodes.length).fill(false);

var enterSpeedField = $("#enter-speed-form");
var dropdownStart = $("#dropdown-start");
var dropdownEnd = $("#dropdown-end");
var controlsCard = $("#controls-card");

initControls();
initSVG();

window.addEventListener("resize", function() {
    reset();
});

function reset() {
    edgeTo = new Array(nodes.length);
    marked = new Array(26).fill(false);
    graph = null;

    cleanControls();
    initSVG();
}

function cleanControls() {
    $(".alert").remove();
    enableFindPaths();
    disableShowPaths();
}

function initControls() {

    enableFindPaths();
    disableShowPaths();

    for (var i in nodes) {
        dropdownStart.append(
            "<option>" + nodes[i].name +"</option>"
        );
        dropdownEnd.append(
            "<option>" + nodes[i].name +"</option>"
        );
    }
    dropdownEnd.val(DEFAULT_END);

    $("#prepare-graph").submit(function(e) {
        e.preventDefault();
        speed = enterSpeedField.val();
        if (speed === "") {
            speed = DEFAULT_SPEED;
        }
        enterSpeedField.val(speed);
        start = findI(dropdownStart.val());

        disableFindPaths();
        doBFS();
    });

    $("#reset-button").click(reset);

    $("#show-shortest-path").submit(function(e) {
        e.preventDefault();
        end = findI(dropdownEnd.val());
        showPath();
    });

    function findI(letter) {
        for (let i in nodes) {
            if (nodes[i].name === letter) {
                return i;
            }
        }
    }
}

function disableFindPaths() {
    enterSpeedField.prop("disabled", "disabled");
    dropdownStart.prop("disabled", "disabled");
    $("#find-paths-button").prop("disabled", true);
}

function enableFindPaths() {
    enterSpeedField.removeAttr("disabled");
    dropdownStart.removeAttr('disabled');
    $("#find-paths-button").prop("disabled", false);
}

function disableShowPaths() {
    dropdownEnd.prop("disabled", "disabled");
    $("#show-path-button").prop("disabled", true);
}

function enableShowPaths() {
    dropdownEnd.removeAttr('disabled');
    $("#show-path-button").removeAttr("disabled");
}

function initSVG() {

    var graph = $("#graph");
    graph.empty();
    var width = graph.width();
    graph.height(width); // make it square
    var height = graph.width(); // make it square

    var svg = d3.select('#graph').append('svg')
        .attr('width', width)
        .attr('height', height);

    var force = d3.layout.force()
        .size([width, height])
        .nodes(nodes)
        .links(edges);

    force.linkDistance(height/10);
    force.charge(-(height * 1.5));

    var link = svg.selectAll('.link')
        .data(edges)
        .enter()
        .append("g")
        .attr("class", "link-group")
        .append('line')
        .attr('class', 'link')
        .attr("id", function(d) { return "edge-"+d.source.name+d.target.name})
        .attr("marker-end", "url(#end)");

    var nodeDrag = d3.behavior.drag()
        .on("dragstart", dragStart)
        .on("drag", dragMove)
        .on("dragend", dragEnd);

    function dragMove(d) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragEnd(d) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
    }

    function dragStart() {
        force.stop() // stops the force auto positioning before you start dragging
    }

    var node = svg.selectAll('.node')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('id', function (d) { return 'node-'+d.name; })
        .call(nodeDrag);;

    var label = svg.selectAll(".label")
        .data(nodes)
        .enter()
        .append("text")
        .text(function (d) { return d.name; })
        .attr('class', 'label')
        .style("text-anchor", "middle")
        .style("font-family", "Arial")
        .style("font-size", 10);

    force.on('tick', tick);

    function tick() {
        node.attr('r', width/40)
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });

        link.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        label.attr("x", function(d){ return d.x; })
            .attr("y", function (d) {return d.y+4; });

    }
    force.start();
}

function makeGraph() {
    const graph = {};
    for (var i=0; i < edges.length; i++) {
        var node = edges[i].source.index;
        var target = edges[i].target.index;

        if (node in graph) {
            var temp = graph[ node ];
            temp.push(target);
            graph[node] = temp;
        } else {
            graph[node] = [];
            graph[node].push(target);
        }
    }
    console.log(JSON.stringify(graph));
    return graph;
}

function doBFS() {
    graph = makeGraph();
    var queue = [];
    queue.push(start);
    marked[start] = true;

    console.log("#node-"+nodes[start].name);
    $("#node-"+ nodes[start].name)
        .css("stroke", "#ff4c4c")
        .css("stroke-width", "4px")
        .attr("class", "node visited");

    var graphBuildTimerId = setInterval( function() {
        if (graph === null) { // resetting the timer
            clearInterval(graphBuildTimerId);
        } else if (queue.length !== 0) {
            findPath();
        } else {
            clearInterval(graphBuildTimerId);
            enableShowPaths();
        }
    }, speed);


    function findPath() {

        var current = queue.shift();
        var adjacentNodes = graph[current];
        var counter = 0;

        console.log(JSON.stringify("Current: " + current));
        console.log(JSON.stringify("graph[current]: " + graph[current]));
        console.log(JSON.stringify("Queue before loop:" + queue));

        var pathFindTimedId = setInterval( function () {
            if (graph != null && adjacentNodes !== undefined
                && counter < adjacentNodes.length) {

                var adjNode = graph[current][counter];
                $("#node-"+nodes[adjNode].name).attr("class", "node visited"); // visited
                $("#edge-"+nodes[current].name+nodes[adjNode].name).attr("class", "covered"); // active edge
                if (!marked[adjNode]) {
                    edgeTo[adjNode] = current;
                    marked[adjNode] = true;
                    queue.push(adjNode);
                    console.log(JSON.stringify("Queue after loop:" + queue));
                }
                counter++;
            } else {
                clearInterval(pathFindTimedId);
            }
        }, speed / 4 );
    }
}

function showPath() {
    $(".path-edge").removeClass("shortest").attr("class", "edge-path"); // make all black again
    $(".node").css("stroke", "white").css("stroke-width", "2px");
    $("#node-"+nodes[start].name).css("stroke", "#ff6666").css("stroke-width", "4px"); // visited
    $("#node-"+nodes[end].name).css("stroke", "#ffa500").css("stroke-width", "4px");
    $(".alert").remove();

    if (marked[end]) {
        var path = extractPath();
        controlsCard.append(
            "<div class=\"alert alert-success m-2 mt-4\" role=\"alert\">" +
            "Path from " + nodes[start].name + " to " + nodes[end].name + ": "  +  path +
             "</div>"
        );

    } else {
        controlsCard.append(
            "<div class=\"alert alert-danger m-2 mt-4\" role=\"alert\">" +
            "Oops, there is no path from " + nodes[start].name + " to " + nodes[end].name +"</div>"
        );
    }
}

function extractPath() {
    var string = "";

    for (var i=end; i !== start; i = edgeTo[i]) {
        var nodeName = nodes[i].name;
        var previous = nodes[edgeTo[i]].name;
        console.log(nodeName);
        string += nodeName + ", ";
        if (i !== start) {
            $("#edge-" + previous + nodeName).attr("class", "path-edge");
            console.log("#edge-" + previous + nodeName);
        } else {
            $("#edge-"+ nodes[start].name + nodeName).attr("class", "path-edge");
        }
    }
    string += nodes[start].name;
    console.log("Path: " + string);
    return string;
}
