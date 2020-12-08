var margin = {top: 10, right: 250, bottom: 30, left:50};
var graphWidth = document.getElementById('lineDiv').clientWidth - margin.left - margin.right;
var graphHeight = Math.min(((document.getElementById('lineDiv').clientWidth * 0.707)- margin.top - margin.bottom-100), 
                           (window.innerHeight - margin.top - margin.bottom-100));

colorLines = ["#3d9cf0",
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

colorBars = ['#ccffcc', '#ffaacc', '#ccaaee', '#ffffee', '#ccbbcc', '#ffaaee']

var lineColor = d3.scaleOrdinal(colorLines)

var lineSvg = d3.select('#lineDiv').append("svg")

var tickers = ["WMT", "NKLA", "AMZN", "DIS", "FB", "SPCE", 
"BA", "AMD", "MSFT", "AAPL", "TSLA", "SPY"]


d3.json("data/lineBar.json", function(data) {

  var subgroups = ['bullish', 'bearish', 'neutral']

  var parse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

  function update(tickers, normalize){
    lineSvg.selectAll("*").remove()

    graphWidth = document.getElementById('lineDiv').clientWidth - margin.left - margin.right;
    graphHeight = Math.min(((document.getElementById('lineDiv').clientWidth * 0.707)- margin.top - margin.bottom-100), 
                           (window.innerHeight - margin.top - margin.bottom-100));

    lineSvg.attr("width", graphWidth + margin.left + margin.right)
            .attr("height", graphHeight + margin.top + margin.bottom)
            .append("g")
    //lineSvg.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var x = d3.scaleBand().range([0 + margin.left,graphWidth]);

    var y = d3.scaleLinear().range([0, graphHeight]);
    var yAxis = d3.axisLeft().scale(y);

    var y2 = d3.scaleLinear().range([0, graphHeight]);
    var y2Axis = d3.axisRight().scale(y2);

    thisdata = $.extend(true, {}, data)

    var bardata = []
    if(tickers.length == 0){
        tickers = ["WMT", "NKLA", "AMZN", "DIS", "FB", "SPCE", 
        "BA", "AMD", "MSFT", "AAPL", "TSLA", "SPY"]
        bardata = thisdata[0]['SPY']
        subgroups = ['bullish', 'bearish', 'neutral']
    }
    else if(tickers.length == 1){
        bardata = thisdata[0][tickers[0]]
        subgroups = ['bullish', 'bearish']
    }
    else if(tickers.length == 2){
        for(var i = 0; i < thisdata[0][tickers[0]].length; i ++){
            var pushdict = {}
            pushdict['time'] = thisdata[0][tickers[0]][i].time
            pushdict[tickers[0] + ' bullish'] = thisdata[0][tickers[0]][i].bullish
            pushdict[tickers[0] + ' bearish'] = thisdata[0][tickers[0]][i].bearish
            pushdict[tickers[1] + ' bullish'] = thisdata[0][tickers[1]][i].bullish
            pushdict[tickers[1] + ' bearish'] = thisdata[0][tickers[1]][i].bearish
            bardata.push(
                pushdict
            )
        }
        subgroups = [tickers[0] + ' bullish', tickers[0] + ' bearish', 
                     tickers[1] + ' bullish', tickers[1] + ' bearish']
    }
    else if(tickers.length == 3){
        for(var i = 0; i < thisdata[0][tickers[0]].length; i ++){
            var pushdict = {}
            pushdict['time'] = thisdata[0][tickers[0]][i].time
            pushdict[tickers[0] + ' bullish'] = thisdata[0][tickers[0]][i].bullish
            pushdict[tickers[0] + ' bearish'] = thisdata[0][tickers[0]][i].bearish
            pushdict[tickers[1] + ' bullish'] = thisdata[0][tickers[1]][i].bullish
            pushdict[tickers[1] + ' bearish'] = thisdata[0][tickers[1]][i].bearish
            pushdict[tickers[2] + ' bullish'] = thisdata[0][tickers[2]][i].bullish
            pushdict[tickers[2] + ' bearish'] = thisdata[0][tickers[2]][i].bearish
            bardata.push(
                pushdict
            )
        }
        subgroups = [tickers[0] + ' bullish', tickers[0] + ' bearish',
                     tickers[1] + ' bullish', tickers[1] + ' bearish',
                     tickers[2] + ' bullish', tickers[2] + ' bearish']
    }
    else{
        bardata = thisdata[0]['SPY']
        subgroups = ['bullish', 'bearish', 'neutral']
    }


    var barColor = d3.scaleOrdinal(colorBars).domain(subgroups)

    lineSvg.append("g")
   .attr("transform", "translate(" + margin.left + "," + graphHeight + ")")
   .attr("class", "myXaxis")

    lineSvg.append("g")
   .attr("transform", "translate(" + margin.left + "," + "0)")
   .attr("class", "myYaxis")

   lineSvg.append("g")
   .attr("transform", "translate(" + (graphWidth) + "," + "0)")
   .attr("class", "myY2axis")

    var stockdata = [];
    for (var i = 0; i < tickers.length; i ++){
        var ticker = tickers[i]
        stockdata.push({
            name: ticker,
            values: thisdata[0][ticker]
        })
    }

    var xarray = []
    var yarray = []
    var y2array = []
    stockdata.map(function(d) {
        d.values.map(function(e) {
            xarray.push(parse(e.time))
            yarray.push(e.Open)
            y2array.push(e.tot)
        })
    })

    var stackeddata = d3.stack().keys(subgroups)(bardata)

    if(normalize.length == 2){
        stackeddata = d3.stack().keys(subgroups).offset(d3.stackOffsetExpand)(bardata)
        y2array = [0.4]
        stockdata.map(function(d){
            var tickmax = Math.max.apply(Math, d.values.map(function(e){return e.Open}))
            d.values.map(function(f) {
                f.Open = f.Open/tickmax
            })
        })
        yarray = [1]
    }
    else if(normalize[0] === "Bars"){
        stackeddata = d3.stack().keys(subgroups).offset(d3.stackOffsetExpand)(bardata)
        y2array = [0.4]
    }
    else if(normalize[0] === "Lines"){
        stockdata.map(function(d){
            var tickmax = Math.max.apply(Math, d.values.map(function(e){return e.Open}))
            d.values.map(function(f) {
                f.Open = f.Open/tickmax
            })
        })
        yarray = [1]
    }
    else{
        stockdata.map(function(d) {
            d.values.map(function(e) {
                xarray.push(parse(e.time))
                yarray.push(e.Open)
                y2array.push(e.tot)
            })
        })
    }

    x.domain(xarray);
    var xAxis = d3.axisBottom().scale(x)
                  .tickFormat(d3.timeFormat("%b"))
                  .tickValues(x.domain().filter(function(d,i) {return ! (i%20)}));
    lineSvg.selectAll(".myXaxis")
        .call(xAxis);

    y.domain([d3.max(yarray), 0]);
    lineSvg.selectAll(".myYaxis")
        .call(yAxis)

    y2.domain([d3.max(y2array)*2.5, 0]);
    lineSvg.selectAll(".myY2axis")
        .call(y2Axis)


    var line = d3.line()
                 .x(function(d) {
                    return x(parse(d.time))})
                 .y(function(d) {
                    return y(+d.Open)})

    lineSvg.append("g")
    .selectAll("myBars")
    .data(stackeddata)
    .enter().append("g")
                .attr("fill", function(d) {return barColor(d.key)})
                .selectAll("rect")
                .data(function(d) {return d;})
                .enter().append("rect")
                .attr("x", function(d) {return x(parse(d.data.time))})
                .attr("y", function(d) {return y2(d[1]);})
                .attr("height", function(d) {return y2(d[0]) - y2(d[1]);})
                .attr("width", x.bandwidth())


    lineSvg.selectAll("myLines")
           .data(stockdata)
           .enter()
           .append("path")
           .attr("class", function(d) {return d.name})
           .attr("d", function(d) {return line(d.values)})
           .attr("fill", "none")
           .attr("stroke", function(d) {return lineColor(d.name)})
           .attr("stroke-width", 2)

    lineSvg.selectAll("myLabels")
           .data(stockdata)
           .enter()
                .append("g")
                .append("text")
                    .attr("class", function(d) {return d.name})
                    .datum(function(d) {return {name: d.name, value: d.values[d.values.length - 1]};})
                    .attr("transform", function(d) {return "translate(" + x(parse(d.value.time)) + "," + y(d.value.Open) + ")";})
                    .attr("x", 12)
                    .text(function(d) {return d.name})
                    .style("fill", function(d) {return lineColor(d.name)})
                    .style("font-size", 15)

    var legend = lineSvg.selectAll("myLegend")
                        .data(barColor.domain())
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) {return "translate(40," + ((graphHeight - 18) - (i * 20)) + ")";})
    legend.append("rect")
          .attr("x", graphWidth - 18 + 35)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", barColor);
    legend.append("text")
          .attr("x", graphWidth + 10 + 35)
          .attr("y", 9)
          .attr("dy", ".35em")
          .attr("text-anchor", "start")
          .text(function(d) {return d;})
  }

  var normalize = []
  var activeTickers = []
  update(tickers, normalize)

  $("#options input:checkbox").change(function(d) {
    if (activeTickers.includes(this.value)){
        var removedex = activeTickers.indexOf(this.value)
        activeTickers.splice(removedex, 1)
    }
    else if (activeTickers.length < 3){
        activeTickers.push(this.value)
    }
    else{
        var removedticker = activeTickers.pop()
        $("#options").find('[value='+ '"' + removedticker + '"' + ']').prop("checked", false).parent().removeClass("active")
        activeTickers.push(this.value)
    }
    update(activeTickers, normalize);
  })

  $("#normalize input:checkbox").change(function(d) {
    if (normalize.includes(this.value)){
        var removedex = normalize.indexOf(this.value)
        normalize.splice(removedex, 1)
    }
    else{
        normalize.push(this.value)
    }
    update(activeTickers, normalize)
  })
  window.addEventListener('resize', function(){
    update(activeTickers, normalize)})
})