// http://bl.ocks.org/sathomas/11550728
// https://stackoverflow.com/questions/28847443/adding-text-labels-to-force-directed-graph-links-in-d3-js
// https://stackoverflow.com/questions/28050434/introducing-arrowdirected-in-force-directed-graph-d3
// https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04
// https://stackoverflow.com/questions/37640027/add-text-label-to-d3-node-in-force-layout
// http://bl.ocks.org/norrs/2883411

var speed = 2000; // user-defined
var start = 1; // user-defined
var end = 11; // user-defined

var graph = $("#graph");
var width = graph.width(),
    height = graph.height();

var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height);

var nodes = [
    {name: "A"}, // 0
    {name: "B"}, // 1
    {name: "C"}, // 2
    {name: "D"}, // 3
    {name: "E"}, // 4
    {name: "F"}, // 5
    {name: "G"}, // 6
    {name: "H"}, // 7
    {name: "I"}, // 8
    {name: "J"}, // 9
    {name: "K"}, // 10
    {name: "L"} // 11
];

var edges = [
    {source: nodes[0], target: nodes[1], weight: 85}, // A -- B
    {source: nodes[0], target: nodes[2], weight: 217}, // A -- C
    {source: nodes[0], target: nodes[4], weight: 173}, // A -- D
    {source: nodes[1], target: nodes[10], weight: 73}, // B
    {source: nodes[1], target: nodes[4], weight: 2}, // B
    {source: nodes[2], target: nodes[3], weight: 186}, // C -- G
    {source: nodes[2], target: nodes[7], weight: 103}, // C -- E
    {source: nodes[3], target: nodes[7], weight: 183}, // D
    {source: nodes[4], target: nodes[5], weight: 502}, // D
    {source: nodes[5], target: nodes[8], weight: 250}, // F
    {source: nodes[5], target: nodes[11], weight: 217}, // F
    {source: nodes[6], target: nodes[8], weight: 29},
    {source: nodes[6], target: nodes[9], weight: 5},
    {source: nodes[7], target: nodes[9], weight: 167}, // H
    {source: nodes[7], target: nodes[6], weight: 73},
    {source: nodes[9], target: nodes[0], weight: 40}, // J
    {source: nodes[9], target: nodes[5], weight: 70},
    {source: nodes[9], target: nodes[8], weight: 18},
    {source: nodes[10], target: nodes[2], weight: 870},
    {source: nodes[10], target: nodes[3], weight: 93},
    {source: nodes[10], target: nodes[11], weight: 1370},
    {source: nodes[11], target: nodes[7], weight: 38}
];

var force = d3.layout.force()
    .size([width, height])
    .nodes(nodes)
    .links(edges);

force.linkDistance(50);

force.charge(-1500);

svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter()
    .append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
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

    $("#node-"+nodes[start].name).css("stroke", "#006400").css("stroke-width", "3px"); // start
    console.log("#node-"+nodes[start].name);
    $("#node-"+nodes[end].name).css("stroke", "#8b0000").css("stroke-width", "3px"); // end

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
    }, speed);

    function relax(index) {
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

        var intervalId;
        var counter = 0;

        intervalId = setInterval( function () {
            if (keys !== undefined && counter < keys.length) {

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
                clearInterval(intervalId);
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



