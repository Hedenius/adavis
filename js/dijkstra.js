// http://bl.ocks.org/sathomas/11550728
// https://stackoverflow.com/questions/28847443/adding-text-labels-to-force-directed-graph-links-in-d3-js
// https://stackoverflow.com/questions/28050434/introducing-arrowdirected-in-force-directed-graph-d3
// https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04
// https://stackoverflow.com/questions/37640027/add-text-label-to-d3-node-in-force-layout

var graph = $("#graph");
var width = graph.width(),
    height = graph.height();

var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height);

var nodes = [
    {name: "A"},
    {name: "B"},
    {name: "C"},
    {name: "D"},
    {name: "E"},
    {name: "F"},
    {name: "G"},
    {name: "H"},
    {name: "I"},
    {name: "J"},
    {name: "K"}
];

var edges = [
    {source: nodes[0], target: nodes[1], weight: 85}, // A -- B
    {source: nodes[0], target: nodes[2], weight: 217}, // A -- C
    {source: nodes[0], target: nodes[4], weight: 173}, // A -- D
    {source: nodes[1], target: nodes[10], weight: 600}, // B
    {source: nodes[2], target: nodes[6], weight: 186}, // C -- G
    {source: nodes[2], target: nodes[7], weight: 103}, // C -- E
    {source: nodes[3], target: nodes[7], weight: 183}, // D
    {source: nodes[4], target: nodes[9], weight: 502}, // D
    {source: nodes[5], target: nodes[8], weight: 250}, // F
    {source: nodes[6], target: nodes[8], weight: 250},
    {source: nodes[7], target: nodes[9], weight: 167}, // H
    {source: nodes[9], target: nodes[0], weight: 40}, // J
    {source: nodes[9], target: nodes[5], weight: 70},
    {source: nodes[9], target: nodes[8], weight: 70},
    {source: nodes[10], target: nodes[2], weight: 870}
];

var force = d3.layout.force()
    .size([width, height])
    .nodes(nodes)
    .links(edges);

force.linkDistance(50);

force.charge(-2000);

svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter()
    .append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

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
    .attr("x", function(d) { return (d.source.x + (d.target.x - d.source.x) * 0.5); })
    .attr("y", function(d) { return (d.source.y + (d.target.y - d.source.y) * 0.5); })
    .attr("dy", ".25em")
    .attr("text-anchor", "middle");

var node = svg.selectAll('.node')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'node')
    .attr('id', function (d) { return 'node-'+d.name; });

var label = svg.selectAll(".label")
    .data(nodes)
    .enter()
    .append("text")
    .text(function (d) { return d.name; })
    .attr('class', 'label')
    .style("text-anchor", "middle")
    .style("fill", "#555")
    .style("font-family", "Arial")
    .style("font-size", 12);

force.on('tick', function() {
    node.attr('r', width/100)
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
        .attr("y", function (d) {return d.y - 10; });

});

force.start();
makeGraph();
doDijkstraMagic();

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

    const graph = makeGraph();

    var start = 1;
    var end = 2;

    // Initialise all the distances with infinity, except the start, the distance to which is 0;
    var distTo = [];
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

    var timerId = setInterval( function() {
        if (queueNodes.length !== 0) {
            relax( findMin() );
        } else {
            console.log("ANSWER: " + distTo[end]); // final answer yay
            clearInterval(timerId);
        }
    }, 1000);

    function relax(index) {
        console.log(index);

        var source = nodes[index].name;
        console.log("SOURCE: " + source);

        var sourceEleement = $("#node-"+source);
        sourceEleement.attr("class", "node active");

        var adjacencyList = graph[source];
        console.log("adjacencyList:  " + JSON.stringify(adjacencyList));
        if (adjacencyList === undefined) {
            sourceEleement.attr("class", "node visited");
            return;
        }

        var intervalId;
        var counter = 0;

        var keys = Object.keys(adjacencyList);

        intervalId = setInterval( function () {
            // TODO: doobiedoo
            if (counter < keys.length) {

                var target = keys[counter];
                console.log(target);

                console.log(JSON.stringify("TARGET: " + target));

                $("#node-"+target).attr("class", "node visited"); // visited
                $("#edge-"+source+target).css("stroke", "orange"); // active edge

                var indexOfLetter = findNode(target);
                console.log("index of letter: " + indexOfLetter);
                console.log("distTo[indexOfLetter] " + distTo[indexOfLetter]);
                console.log("distTo[index] " + distTo[index] + " edge.weight " + graph[source][target]);
                if (distTo[indexOfLetter] > distTo[index] + graph[source][target]) {
                    distTo[indexOfLetter] = distTo[index] + graph[source][target];
                    console.log("distTo[indexOfLetter] " + distTo[indexOfLetter]);
                    console.log("distTo[indexOfLetter] NEW " + distTo[indexOfLetter]);

                    if (queueNodes.includes(index)) {
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
                clearInterval(intervalId);
                sourceEleement.attr("class", "node visited");
            }
        }, 500);
    }

    function findNode(name) {
        var index = nodes.findIndex(function(node) {
            return node.name === name;
        });
        return index;
    }
}



