var legendwidth = 2000;
var legendheight = 150;
var itemWidth = legendwidth /5;
var leftmargin = 260

// Load the CSV file
d3.csv("../data/logos.csv").then(function(data) {
    var legendData = data.map(function(d) {
    return { model: d.model, path: d.path, saying: d.saying };
    });

    // svg container
    var legendContainer = d3.select("#legend")
    .append("svg")
    .attr('viewBox', `0 0 ${legendwidth + (leftmargin)} ${legendheight}`);

    // Create the legend elements
    var legend = legendContainer.selectAll(".legend")
    .data(legendData)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { 
        var x = i * itemWidth + itemWidth / 2;
        return "translate(" + x + ")"; });

    // chatbot logo
    legend.append("image")
    .attr("x", -15)
    .attr("y", 50)
    .attr("width", 30)
    .attr("height", 30)
    
    .attr("xlink:href", function(d) {
        return d.path;
    });

    // name of model
    legend.append("text")
    .attr("class", "model")
    .attr("x", 20)
    .attr("y", 75)
    .attr("text-anchor", "start")
    .text(function(d) { return d.model; });

    //saying of chatbot
    legend.append("text")
    .attr("class", "saying")
    .attr("x", -50)
    .attr("y", 105)
    .attr("text-anchor", "start")
    .text(function(d) { return d.saying; });
});