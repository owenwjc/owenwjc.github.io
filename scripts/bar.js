// set the dimensions and margins of the graph
const barmargin = {top: 30, right: 20, bottom: 10, left: 90};
const barwidth = 400 - (barmargin.left + barmargin.right);
const barheight = 400 - (barmargin.top + barmargin.bottom);

colors = ["#ed6542",
"#8fa741",
"#9c78ed",
"#d9d541",
"#51afdf"]

d3.csv('../data/emotion.csv').then(function(data) {

    var subgroups = data.columns.slice(1)
    var groups = data.map(d => d.model)

    const svg = d3
        .select('.bar')
        .append('svg')
        .attr('viewBox', `0 0 ${barwidth + (barmargin.left + barmargin.right)} ${barheight + (barmargin.top + barmargin.bottom)}`);

    const group = svg
        .append('g')
        .attr('transform', `translate(${barmargin.left}, ${barmargin.top})`);

    group.append("text")
        .attr("x", (barwidth / 2))             
        .attr("y", 0 - (barmargin.top / 2))
        .attr("text-anchor", "middle")
        .text("Count of Non-Neutral Responses");

    var y = d3.scaleBand()
        .range([barheight, barmargin.top])
        .domain(groups)
        .padding(.2);
    svg.append("g")
        .attr("transform", `translate(${barmargin.left}, 0)`)
        .call(d3.axisLeft(y))

    var x = d3.scaleLinear()
        .domain([0, 15])
        .range([0, barwidth])
    svg.append("g")
        .attr("transform", `translate(${barmargin.left}, ${barheight})`)
        .call(d3.axisBottom(x))

    var ysubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, y.bandwidth()])
        .padding([0.05])

    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(colors)
    
    svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
            .attr("transform", d => `translate(${barmargin.left}, ${y(d.model)})`)
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
        .join("rect")
            .attr("y", d => ysubgroup(d.key))
            .attr("x", d => 0)
            .attr("height", ysubgroup.bandwidth())
            .attr("width", d => x(d.value))
            .attr("fill", d => color(d.key));

    // Add one dot in the legend for each name.
    svg.selectAll("mydots")
        .data(subgroups)
        .enter()
        .append("circle")
            .attr("cx", 320)
            .attr("cy", function(d,i){ return 50 + i*15}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .style("fill", function(d){ return color(d)})

    svg.selectAll("mylabels")
        .data(subgroups)
        .enter()
        .append("text")
            .attr("x", 330)
            .attr("y", function(d,i){ return 54 + i*15}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
})