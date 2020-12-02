var radius = 1;
var height = 1000
var graphWidth = 1000

var industrydict = {'Auto': "#f0a8a8",
 'Travel': "#f0d1a8",
 'Food distribution': "#ddf0a8",
 'Agriculture': "#b9f0a8",
 'Media': "#a8f0c0",
 'Tech': "#5ba4b1",
 'Aerospace': "#a8f0da",
 'Stock Market Index': "#a8ebf0",
 'Pharm': "#a8d9f0",
 'Services': "#a8aff0",
 'Goods': "#bea8f0",
 'Finance': "#e2a8f0",
 'Real Estate': "#f0a8de",
 'Department Stores': "#f0a8c4",
 'Utilities': "#aaf0a8",
 'Oil': "#f0a8f0"};

var graphCanvas = d3.select('#networkDiv').append('canvas')
                    .attr('width', graphWidth + 'px')
                    .attr('height', height + 'px')
                    .node();

var context = graphCanvas.getContext('2d');

var simulation = d3.forceSimulation()
                   .force("center", d3.forceCenter(graphWidth / 2, height / 2))
                   .force("x", d3.forceX(graphWidth / 2).strength(0.1))
                   .force("y", d3.forceY(height / 2).strength(0.1))
                   .force("charge", d3.forceManyBody().strength(-250))
                   .force("link", d3.forceLink().id(function(d) {return d.id;}))
                   .alphaTarget(0)
                   .alphaDecay(0.05)

var transform = d3.zoomIdentity;

d3.json("data/network.json", function(error, data) {
  console.log(data)
  initGraph(data)


  function initGraph(tempData){

    function zoomed(){
      console.log("zooming")
      transform = d3.event.transform;
      simulationUpdate();
    }

    d3.select(graphCanvas)
      .call(d3.drag().subject(dragsubject)/*
                     .on("start", dragstarted)
                     .on("drag", dragged)
                     .on("end", dragended)*/)
      .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))

  

  function dragsubject() {
    var i,
    x = transform.invertX(d3.event.x),
    y = transform.invertY(d3.event.y),
    dx,
    dy;
    for (i = tempData.nodes.length - 1; i >= 0; --i) {
    node = tempData.nodes[i];
      dx = x - node.x;
      dy = y - node.y;

      if (dx * dx + dy * dy < radius * radius) {

        node.x =  transform.applyX(node.x);
        node.y = transform.applyY(node.y);

        return node;
      }
    }
  }

  /*function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragged() {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }*/

  simulation.nodes(tempData.nodes)
              .on("tick",simulationUpdate);

  simulation.force("link")
            .links(tempData.links)
            .strength(function(d) {return 0.001 +(d.weight-1)*(0.049)/(1730)});

  function simulationUpdate(){
      context.save();

      context.clearRect(0, 0, graphWidth, height);
      context.fillStyle = "black";
      context.fillRect(0, 0, graphWidth, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.links.forEach(function(d) {
            context.beginPath();
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
            context.lineWidth = 0.005 + ((d.weight-1)*(0.995)/(1730));
            context.strokeStyle = "rgb(0,255,255)"
            context.stroke();
        });

        // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
            radius = 1 + ((d.weight-25)*(6.5)/(8821))
            context.beginPath();
            context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
            context.fillStyle = industrydict[d.Industry];
            context.fill();
            context.fillStyle = "white"
            context.font = '5px Roboto'
            context.fillText(d.id, d.x+radius, d.y+3)
        });

        context.restore();
  }
}
})