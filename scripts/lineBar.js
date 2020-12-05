var margin = {top: 10, right: 100, bottom: 30, left: 50};
var graphheight = 1000 - margin.top - margin.bottom;
var width = 1200 - margin.left - margin.right;

colorCat = ["#3d9cf0",
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

var lineSvg = d3.select('#lineDiv').append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", graphheight + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

/*var legendSvg = d3.select('#legend').append("svg")
                  .attr("width", 500)
                  .attr("height", 900)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")*/

var x = d3.scaleTime().range([0,width]);
var xAxis = d3.axisBottom().scale(x);

var y = d3.scaleLinear().range([0, graphheight]);
var yAxis = d3.axisLeft().scale(y);

d3.json("data/lineBar.json", function(error, data) {

  var tickers = ["WMT", "NKLA", "AMZN", "DIS", "FB", "SPCE", 
                "BA", "AMD", "MSFT", "AAPL", "TSLA", "SPY"]
  var parse = d3.timeParse('%s');

  function update(tickers){
    
    lineSvg.selectAll("*").remove()

    lineSvg.append("g")
   .attr("transform", "translate(0," + graphheight + ")")
   .attr("class", "myXaxis")

    lineSvg.append("g")
   .attr("class", "myYaxis")

    var stockdata = [];
    for (var i = 0; i < tickers.length; i ++){
        var ticker = tickers[i]
        indTicker = data[ticker]
        indTicker = d3.map(indTicker).entries()
        indTicker.forEach(function(d) {
            d.key = parse(d.key * 10**-9)
        })
        stockdata.push({
            name: ticker,
            values: indTicker.map(function(entry) {
                return{time: entry.key, Open: +entry.value.Open, 
                       bullish: +entry.value.bullish, bearish: +entry.value.bearish, 
                       neutral: +entry.value.neutral, tot: +entry.value.tot, 
                       avg: +entry.value.avg}
            })
        })
    }

    var xarray = []
    var yarray = []
 
    stockdata.map(function(d) {
        d.values.map(function(e) {
            xarray.push(e.time)
            yarray.push(e.Open)
        })
    })


    x.domain(d3.extent(xarray));
    lineSvg.selectAll(".myXaxis")
       .call(xAxis);

    y.domain([d3.max(yarray), 0]);
    lineSvg.selectAll(".myYaxis")
       .call(yAxis)

    var line = d3.line()
                 .x(function(d) {
                    return x(+d.time)})
                 .y(function(d) {
                    return y(+d.Open)})

    
    lineSvg.selectAll("myLines")
           .data(stockdata)
           .enter()
           .append("path")
           .attr("class", function(d) {return d.name})
           .attr("d", function(d) {return line(d.values)})
           .attr("fill", "none")
           .attr("stroke", function(d) {return fill(d.name)})
           .attr("stroke-width", 2.5)

    lineSvg.selectAll("myLabels")
           .data(stockdata)
           .enter()
                .append("g")
                .append("text")
                    .attr("class", function(d) {return d.name})
                    .datum(function(d) {return {name: d.name, value: d.values[d.values.length - 1]};})
                    .attr("transform", function(d) {return "translate(" + x(d.value.time) + "," + y(d.value.Open) + ")";})
                    .attr("x", 12)
                    .text(function(d) {return d.name})
                    .style("fill", function(d) {return fill(d.name)})
                    .style("font-size", 15)
  }
  update(tickers)

  $("#options input:checkbox").change(function(d) {
    var fav = []
    $.each($("input[name = 'ticker']:checked"), function() {
      fav.push($(this).val());
    });
    update(fav);
  })
})