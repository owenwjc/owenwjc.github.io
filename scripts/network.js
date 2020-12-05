var radius = 1;
var graphWidth = window.innerHeight * 1.414;
var height = window.innerHeight;

console.log(graphWidth)

 var colorCat = ["#3d9cf0",
 "#ed47cf",
 "#04fcf4",
 "#ca58f4",
 "#1288da",
 "#ea5da0",
 "#2e8bf3",
 "#db7bd0",
 "#447cfe",
 "#cd6ee4",
 "#5e90e9",
 "#956ff8",
 "#7c89e9",
 "#b98ff0",
 "#6c81f4",
 "#9d77d9"]

 var fill = d3.scaleOrdinal(colorCat)

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
  initGraph(data)

  function initGraph(tempData){

    function zoomed(){
      console.log("zooming")
      transform = d3.event.transform;
      simulationUpdate();
    }

    d3.select(graphCanvas)
      .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))


  simulation.nodes(tempData.nodes)
              .on("tick",simulationUpdate);

  simulation.force("link")
            .links(tempData.links)
            .strength(function(d) {return 0.001 +(d.weight-1)*(0.049)/(1730)});

  function simulationUpdate(){

    graphWidth = window.innerHeight * 1.414
    height = window.innerHeight;
    graphCanvas.width = graphWidth
    graphCanvas.height = height
    context = graphCanvas.getContext('2d');

    context.save()

      context.clearRect(0, 0, graphWidth, height);
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
            context.fillStyle = fill(d.Industry);
            context.fill();
            context.fillStyle = "white"
            context.font = '5px Roboto'
            context.fillText(d.id, d.x+radius, d.y+3)
        });

        context.restore();
  }
  window.addEventListener('resize', simulationUpdate)
}
})