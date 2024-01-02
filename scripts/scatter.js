var scattermargin = {top: 30, right: 50, bottom: 30, left: 50},
  scatterwidth = 400 - scattermargin.left - scattermargin.right,
  scatterheight = 400 - scattermargin.top - scattermargin.bottom;

const icons = {
    'Bard': '../favicons/bard.svg',
    'OpenAssistant': '../favicons/openassistant.png',
    'ChatGPT': '../favicons/chatgpt.png',
    'GIPPR': '../favicons/gippr.png',
    'Bing Chat': '../favicons/bing.png'
};

function parallel(data, type) {
    var svg = d3
    .select(`.${type}`)
    .append('svg')
    .attr('class', 'parallel')
    .attr('viewBox', `0 0 ${scatterwidth + (scattermargin.left + scattermargin.right)} ${scatterheight + (scattermargin.top + scattermargin.bottom)}`)
    .append("g")
        .attr("transform",
            "translate(" + scattermargin.left + "," + scattermargin.top + ")");

    svg.append("text")
            .attr("x", (scatterwidth / 2))             
            .attr("y", 0 - (scattermargin.top / 2))
            .attr("text-anchor", "middle")
            .text(`${type}`.charAt(0).toUpperCase() + `${type}`.substr(1));
    
    var y = {}
    for (i in dimensions) {
        dim = dimensions[i]
        y[dim] = d3.scaleLinear().domain([0, 1.05 * d3.max(data, function(d) {  return +d[dim]; })]).range([scatterheight, 0])
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
    .range([0, scatterwidth])
    .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) {
        return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    svg
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", "black" )
        .style("opacity", 0.5)
        .append("image").attr('xlink:href', '../favicons/bard.svg').attr('width', 20)
        .attr('height', 20);

    for (i in dimensions) {
        dim = dimensions[i]
        svg
        .selectAll("images")
        .data(data)
        .enter()
        .append('svg:image')
            .attr('xlink:href', ({model}) => icons[model])
            .attr('x', x(dim))
            .attr('y', function(d) {return y[dim](d[dim]) - 10;})
            .attr('width', 20)
            .attr('height', 20);
    }

    // Draw the axis:
    svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(3).scale(y[d])); })
    // Add axis title
    .append("text")
        .style("text-anchor", "middle")
        .attr('transform', d=>`translate(0, ${scatterheight + scattermargin.bottom})`)
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "rgb(236, 236, 241)")
}

Promise.all([
    d3.csv("../data/agg_overall.csv"),
    d3.csv("../data/overall.csv"),
]).then(function(files) {
    function update() {
        d3.selectAll('.parallel').remove()
        if (d3.select(".checkbox-round").property("checked")) {
            newData = files[1]
            dimensions = ['readibility', 'word_count', 'vocab', 'unique_vocab']
        } else {
            newData = files[0]
            dimensions = ['readibility', 'word_count', 'vocab']
        }
        parallel(newData, 'scatter');

    }
    d3.select(".checkbox-round").on("change",update);
    update();
})