const nodes = [
    {name: "A"}, // 0
    {name: "B"}, // 1
    {name: "C"}, //2
    {name: "D"}, //3
    {name: "E"}, // 4
    {name: "F"}, // 5
    {name: "G"}, // 6
    {name: "H"}, // 7
    {name: "I"}, // 8
    {name: "J"}, // 9
    {name: "K"}, // 10
    {name: "L"}, // 11
    {name: "M"} // 12
];

const edges = [
    {source: nodes[0], target: nodes[1], weight: 85},
    {source: nodes[0], target: nodes[2], weight: 217},
    {source: nodes[0], target: nodes[4], weight: 173},
    {source: nodes[1], target: nodes[10], weight: 73},
    {source: nodes[1], target: nodes[4], weight: 2},
    {source: nodes[2], target: nodes[3], weight: 186},
    {source: nodes[2], target: nodes[7], weight: 103},
    {source: nodes[3], target: nodes[7], weight: 183},
    {source: nodes[4], target: nodes[5], weight: 502},
    {source: nodes[5], target: nodes[8], weight: 250},
    {source: nodes[5], target: nodes[11], weight: 217},
    {source: nodes[6], target: nodes[8], weight: 29},
    {source: nodes[6], target: nodes[9], weight: 5},
    {source: nodes[7], target: nodes[9], weight: 167},
    {source: nodes[7], target: nodes[6], weight: 73},
    {source: nodes[9], target: nodes[0], weight: 40},
    {source: nodes[9], target: nodes[5], weight: 70},
    {source: nodes[9], target: nodes[8], weight: 18},
    {source: nodes[10], target: nodes[2], weight: 870},
    {source: nodes[10], target: nodes[3], weight: 93},
    {source: nodes[10], target: nodes[11], weight: 1370},
    {source: nodes[11], target: nodes[7], weight: 38},
    {source: nodes[12], target: nodes[4], weight: 47},
    {source: nodes[12], target: nodes[1], weight: 201},
    {source: nodes[12], target: nodes[5], weight: 192}
];

var speed; // user-defined
var start; // user-defined
var end; // user-defined
var graph;
var distTo = [];
var edgeTo = new Array(nodes.length);
var edgeToIndexes = new Array(nodes.length);

var enterSpeedField = $("#enter-speed-form");
var dropdownStart = $("#dropdown-start");
var dropdownEnd = $("#dropdown-end");


initControls();
initSVG();

window.addEventListener("resize", function() {
    reset();
});

function reset() {
    distTo = [];
    edgeTo = new Array(nodes.length);
    edgeToIndexes = new Array(nodes.length);
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
    dropdownEnd.val("M");

    $("#prepare-graph").submit(function(e) {
        e.preventDefault();
        speed = enterSpeedField.val();
        if (speed === "") {
            speed = 2000;
        }
        enterSpeedField.val(speed);
        start = findI(dropdownStart.val());
        disableFindPaths();
        doDijkstraMagic();
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
    graph.height(width);
    var height = graph.width(); // make it square
    console.log("Width: "  + width + ", height: " + height);

    var svg = d3.select('#graph').append('svg')
        .attr('width', width)
        .attr('height', height);

    var force = d3.layout.force()
        .size([width, height])
        .nodes(nodes)
        .links(edges);

    force.linkDistance(height/10);
    force.charge(-(height * 3));

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter()
        .append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", width/40 + 3)
        .attr("refY", 0)
        .attr("markerWidth", 15)
        .attr("markerHeight", 15)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M 0,0 m -5,-5 L 5,0 L -5,5 Z");

    var link = svg.selectAll('.link')
        .data(edges)
        .enter()
        .append("g")
        .attr("class", "link-group")
        .append('line')
        .attr('class', 'link')
        .attr("id", function(d) { return "edge-"+d.source.name+d.target.name})
        .attr("marker-end", "url(#end)");

    var linkText = svg.selectAll(".link-group")
        .append("text")
        .data(force.links())
        .text(function(d) { return d.weight; })
        .attr("x", function(d) { return (d.source.x + (d.target.x - d.source.x)); })
        .attr("y", function(d) { return (d.source.y + (d.target.y - d.source.y)); })
        .attr("dy", ".25em")
        .attr("text-anchor", "middle");

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

        linkText
            .attr("x", function(d) { return (d.source.x + (d.target.x - d.source.x) * 0.5); })
            .attr("y", function(d) { return (d.source.y + (d.target.y - d.source.y) * 0.5); });

        label.attr("x", function(d){ return d.x; })
            .attr("y", function (d) {return d.y+4; });

    }
    force.start();
}

function makeGraph() {
    const graph = {};
    for (var i=0; i < edges.length; i++) {
        var node = edges[i].source.name;
        var edge = edges[i].target.name;
        var weight = edges[i].weight;
        if (node in graph) {
            var temp = graph[ node ];
            temp[ edge ] = weight;
            graph[ node ] = temp;
        } else {
            graph[ node ]= {};
            graph[ node ][ edge ] = weight;
        }
    }
    console.log(JSON.stringify(graph));
    return graph;
}

function doDijkstraMagic() {

    graph = makeGraph();

    console.log("#node-"+nodes[start].name);
    $("#node-"+nodes[start].name).css("stroke", "#006400").css("stroke-width", "4px");

    // Initialise all the distances with infinity, except the start, the distance to which is 0;
    for (var i=0; i < nodes.length; i++) {
        distTo[i] = Infinity;
    }
    distTo[start] = 0; // index as in nodes

    var queueNodes = [];
    queueNodes.push(start);
    var queueWeights = [];
    queueWeights.push(0);

    console.log(JSON.stringify(queueNodes));
    console.log(JSON.stringify(queueWeights));

    function findMin() {
        var min = Math.min(...queueWeights); // why the hell doesn't Math.min.apply() work?..

        var index = queueWeights.indexOf(min);
        var nodeIndex = queueNodes[ index ];

        queueNodes.splice(index, 1);
        queueWeights.splice(index, 1);
        return nodeIndex; // node index from nodes
    }

    var graphBuildTimerId = setInterval( function() {
        if (graph === null) {
            clearInterval(graphBuildTimerId);
        } else if (queueNodes.length !== 0) {
            relax( findMin() );
        } else {
            clearInterval(graphBuildTimerId);
            enableShowPaths();
        }
    }, speed);

    function relax(index) {
        if (graph == null) {
            return;
        }
        console.log(index);

        var source = nodes[index].name;
        console.log("SOURCE: " + source);

        var sourceEleement = $("#node-"+source);
        sourceEleement.attr("class", "node active");

        var adjacencyList = graph[source];
        console.log("adjacencyList:  " + JSON.stringify(adjacencyList));
        if (adjacencyList !== undefined) {
            var keys = Object.keys(adjacencyList);
            var values = Object.values(adjacencyList);
        }

        var counter = 0;
        var pathFindTimedId = setInterval( function () {
            if (graph !== null &&
                keys !== undefined && counter < keys.length) {

                var target = keys[counter];
                console.log(JSON.stringify("TARGET: " + target));

                $("#node-"+target).attr("class", "node visited"); // visited
                $("#edge-"+source+target).attr("class", "covered"); // active edge

                var indexOfLetter = findNode(target);
                console.log("index of letter: " + indexOfLetter);
                console.log("distTo[indexOfLetter] " + distTo[indexOfLetter]);
                console.log("distTo[index] " + distTo[index] + " edge.weight " + graph[source][target]);
                if (distTo[indexOfLetter] > distTo[index] + values[counter]) {

                    distTo[indexOfLetter] = distTo[index] + values[counter];
                    edgeTo[indexOfLetter] = source;
                    edgeToIndexes[indexOfLetter] = index;

                    console.log("distTo[indexOfLetter] " + distTo[indexOfLetter]);
                    console.log("distTo[indexOfLetter] NEW " + distTo[indexOfLetter]);

                    if (queueNodes.includes(indexOfLetter)) {
                        queueWeights[queueNodes.indexOf(indexOfLetter)] = distTo[indexOfLetter];
                        console.log("Updating weight");
                    } else {
                        queueNodes.push(indexOfLetter);
                        queueWeights.push( distTo[ indexOfLetter] );
                        console.log("Pushing to queue");
                    }
                }
                console.log(JSON.stringify("Queue nodes: " + queueNodes));
                console.log(JSON.stringify("Queue wights: " + queueWeights));
                console.log(JSON.stringify("Dist to array: " + distTo));
                counter++;
            } else {
                clearInterval(pathFindTimedId);
                sourceEleement.attr("class", "node visited");
            }
        }, speed / 4 );
    }

    function findNode(name) {
        var index = nodes.findIndex(function(node) {
            return node.name === name;
        });
        return index;
    }
}

function showPath() {
    $(".shortest").removeClass("shortest").attr("class", "covered"); // make all black again
    $(".node").css("stroke", "white").css("stroke-width", "2px");
    $("#node-"+nodes[start].name).css("stroke", "#006400").css("stroke-width", "4px");
    $("#node-"+nodes[end].name).css("stroke", "#8b0000").css("stroke-width", "4px");
    var controlsCard = $("#controls-card");

    $(".alert").remove();

    if (distTo[end] !== Infinity) {

        controlsCard.append(
            "<div class=\"alert alert-success m-2 mt-4\" role=\"alert\">" +
            "Weight from " + nodes[start].name + " to " + nodes[end].name + ": " + distTo[end] +
            "</div>"
        );

        console.log("PATH: " + JSON.stringify(edgeTo)); // final answer yay
        console.log("PATH: " + JSON.stringify(edgeToIndexes)); // final answer yay
        var iter = end;
        while (iter !== undefined) {
            var to = nodes[iter].name;
            var from = edgeTo[iter];
            console.log(from);
            iter = edgeToIndexes[iter];
            console.log("From " + from + " to " + to );
            if (from === undefined) {
                $("#edge-"+nodes[start].name+to).attr("class", "shortest"); // shortest edge
            } else {
                $("#edge-"+from+to).attr("class", "shortest"); // shortest edge
            }
        }
    } else {
        controlsCard.append(
            "<div class=\"alert alert-danger m-2 mt-4\" role=\"alert\">" +
            "Oops, there is no path from " + nodes[start].name + " to " + nodes[end].name +"</div>"
        );
    }
}



