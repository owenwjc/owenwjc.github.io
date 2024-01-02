const favicons = {
  'Bard': '../favicons/bard.svg',
  'OpenAssistant': '../favicons/openassistant.png',
  'ChatGPT': '../favicons/chatgpt.png',
  'GIPPR': '../favicons/gippr.png',
  'Bing': '../favicons/bing.png'
};
  
// minimum and maximum values
const range = {
  min: -10,
  max: 10,
};

// in the .compass container include an SVG element following the margin convention
const margin = {
  top: 30,
  right: 20,
  bottom: 30,
  left: 45,
};

// the chart ought to be wider than taller
const width = 400 - (margin.left + margin.right);
const height = 400 - (margin.top + margin.bottom);

// create an array of data points leveraging the utility functions
d3.csv("../data/compass.csv").then(function(data) {

  const svg = d3
    .select('.compass')
    .append('svg')
    .attr('viewBox', `0 0 ${width + (margin.left + margin.right)} ${height + (margin.top + margin.bottom)}`);

  const group = svg
    .append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

  group.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text("Political Compass");

  // scales
  // for both the x and y dimensions define linear scales, using the minimum and maximum values defined earlier
  const lrScale = d3
    .scaleLinear()
    .domain(d3.extent(Object.values(range)))
    .range([0, width]);

  const libauthScale = d3
    .scaleLinear()
    .domain(d3.extent(Object.values(range)))
    .range([height, 0]);

  // quadrants and labels
  // position four rectangles and text elements to divvy up the larger shape in four sections
  const quad = [
    'Authoritarian Left',
    'Authoritarian Right',
    'Libertarian Left',
    'Libertarian Right',
  ];

  const quadrantsGroup = group
    .append('g')
    .attr('class', 'quadrants');

  // include one group for each quadrant
  const quadrants = quadrantsGroup
    .selectAll('g.quadrant')
    .data(quad)
    .enter()
    .append('g')
    .attr('class', 'quadrant')
    // position the groups at the four corners of the viz
    .attr('transform', (d, i) => `translate(${i % 2 === 0 ? 0 : width / 2} ${i < 2 ? 0 : height / 2})`);

  // for each quadrant add a rectangle and a label
  quadrants
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width / 2)
    .attr('height', height / 2)
    .attr('fill', (d, i) => {
        if (i===0)
            return '#f9bbbb'
        if (i===1)
            return '#93daf8'
        if (i===2)
            return '#c9e5bd'
        if (i===3)
            return '#f5f5a9'
    })
    .attr('opacity', .25);

  quadrants
    .append('text')
    .attr('x', width / 4)
    .attr('y', height / 4)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text(d => d)
    .style('text-transform', 'uppercase')
    .style('font-weight', '200')
    .style('font-size', '0.8rem')
    .attr('opacity', 0.9);

  // axes
  const lrAxis = d3
    .axisBottom(lrScale)
    .tickFormat("");

  const libauthAxis = d3
    .axisLeft(libauthScale)
    .tickFormat("");

  // add classes to later identify the axes individually and jointly
  group
    .append('g')
    .attr('transform', `translate(0 ${height})`)
    .attr('class', 'axis axis-lr')
    .call(lrAxis);

  group
    .append('g')
    .attr('class', 'axis axis-libauth')
    .call(libauthAxis);

  // remove the path describing the axes
  d3
    .selectAll('.axis')
    .select('path')
    .remove();

  // style the ticks to be shorter
  d3
    .select('.axis-lr')
    .selectAll('line')
    .attr('visibility', 'hidden');

  d3
    .select('.axis-libauth')
    .selectAll('line')
    .attr('visibility', 'hidden');

  // grid
  // include dotted lines for each tick and for both axes
  d3
    .select('.axis-lr')
    .selectAll('g.tick')
    .append('path')
    .attr('d', `M 0 0 v -${height}`)
    .attr('stroke', 'currentColor')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2')
    .attr('opacity', 0.3);

  d3
    .select('.axis-libauth')
    .selectAll('g.tick')
    .append('path')
    .attr('d', `M 0 0 h ${width}`)
    .attr('stroke', 'currentColor')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2')
    .attr('opacity', 0.3);


  // labels
  // add a group to position the label where needed
  // for the percentage label, this allows to also modify the transform-origin as to rotate the label from the center of the axis
  d3
    .select('.axis-lr')
    .append('g')
    .attr('class', 'label label-lr')
    .attr('transform', `translate(${width / 2} ${margin.bottom - 15})`);

  d3
    .select('g.label-lr')
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text('Left v Right')
    .attr('text-anchor', 'middle');

  d3
    .select('.axis-libauth')
    .append('g')
    .attr('class', 'label label-libauth')
    .attr('transform', `translate(-${margin.left - 15} ${height / 2})`);

  d3
    .select('g.label-libauth')
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text('Libertarian v Authoritarian')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .attr('transform', 'rotate(-90)');

  // style both labels with a heavier weight
  d3
    .selectAll('g.label text')
    .style('font-size', '0.65rem')
    .style('font-weight', '600')
    .style('letter-spacing', '0.05rem');


  // data points
  // add a group for each data point, to group circle and text elements
  const dataGroup = group
    .append('g')
    .attr('class', 'data');

  const dataPointsGroup = dataGroup
    .selectAll('g.data-point')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'data-point')
    .attr('transform', ({x, y}) => `translate(${lrScale(x)} ${libauthScale(y)})`);

  // favicons
  dataPointsGroup
    .append('svg:image')
    .attr('xlink:href', ({model}) => favicons[model])
    .attr('x', -10)
    .attr('y', -10)
    .attr('width', 20)
    .attr('height', 20);
});