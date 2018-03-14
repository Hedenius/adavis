forceLayout();

function forceLayout() {

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

    var nodesX = width - 20;
    var nodesY = height - 20;
    var nodes = [
        {name: "A", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "B", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "C", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "D", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "E", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "F", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "G", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "H", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "I", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "J", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {name: "K", x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)}
    ];

    // var links = [
    //     {source: nodes[0], target: nodes[1], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[2], target: nodes[1], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[3], target: nodes[0], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[4], target: nodes[2], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[1], target: nodes[4], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[5], target: nodes[4], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[5], target: nodes[2], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[5], target: nodes[0], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[1], target: nodes[0], weight: Math.floor(Math.random() * 10)},
    //     {source: nodes[2], target: nodes[3], weight: Math.floor(Math.random() * 10)}
    // ];

    var links = [
        {source: nodes[0], target: nodes[1], weight: 85},
        {source: nodes[0], target: nodes[2], weight: 217},
        {source: nodes[0], target: nodes[4], weight: 173},
        {source: nodes[2], target: nodes[6], weight: 186},
        {source: nodes[2], target: nodes[7], weight: 103},
        {source: nodes[3], target: nodes[7], weight: 183},
        {source: nodes[5], target: nodes[8], weight: 250},
        {source: nodes[8], target: nodes[9], weight: 85},
        {source: nodes[7], target: nodes[9], weight: 167},
        {source: nodes[4], target: nodes[9], weight: 502},
        {source: nodes[9], target: nodes[10], weight: 40},
        {source: nodes[1], target: nodes[10], weight: 600}
    ];

    var force = d3.layout.force()
        .size([width, height])
        .nodes(nodes)
        .links(links);

    force.linkDistance(function(d) {
        return Math.floor(Math.random() * (width/1.5));
    });

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
        .data(links)
        .enter()
        .append("g")
        .attr("class", "link-group")
        .append('line')
        .attr('class', 'link')
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
        .attr('class', 'node');

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
}

function dijkstra() {
    //TODO: doobiedoo
}



