init();

function init() {
    var vis = d3.select("#graph")
        .append("svg");

    var graph = $("#graph");
    var w = graph.width(),
        h = graph.height();
    vis.attr("width", w)
        .attr("height", h);

    vis.text("The Graph")
        .select("#graph");

    var nodesX = w - 20;
    var nodesY = h - 20;
    var nodes = [
        {x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)},
        {x: (Math.floor(Math.random() * nodesX) + 10), y: (Math.floor(Math.random() * nodesY) + 10)}
        ];

    vis.selectAll("circle .nodes")
        .data(nodes)
        .enter()
        .append("svg:circle")
        .attr("class", "nodes")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    vis.selectAll("circle .nodes")
        .data(nodes)
        .enter()
        .append("svg:circle")
        .attr("class", "nodes")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", "10px")
        .attr("fill", "black");

    var links = [
        {source: nodes[0], target: nodes[1], weight: Math.floor(Math.random() * 10)},
        {source: nodes[2], target: nodes[1], weight: Math.floor(Math.random() * 10)},
        {source: nodes[3], target: nodes[0], weight: Math.floor(Math.random() * 10)},
        {source: nodes[4], target: nodes[2], weight: Math.floor(Math.random() * 10)},
        {source: nodes[1], target: nodes[4], weight: Math.floor(Math.random() * 10)},
        {source: nodes[5], target: nodes[4], weight: Math.floor(Math.random() * 10)},
        {source: nodes[5], target: nodes[2], weight: Math.floor(Math.random() * 10)}
    ];

    var link = vis.selectAll(".link")
        .data(links)
        .enter()
        .append("g")
        .attr("class", "link");

    link.append("line")
        .attr("fill", "none")
        .attr("stroke", "#ff8888")
            .attr("x1", function(d) { return d.source.x })
            .attr("y1", function(d) { return d.source.y })
            .attr("x2", function(d) { return d.target.x })
            .attr("y2", function(d) { return d.target.y })
        .attr("stroke-width", "1.5px");

    link.append("text")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("fill", "Black")
        .style("font", "normal 12px Arial")
        .attr("transform", function(d) {
            return "translate(" +
                ((d.source.x + d.target.x)/2) + "," +
                ((d.source.y + d.target.y)/2) + ")";
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) {
            console.log("success");
            return d.weight;
        });

}



