d3.json("data/wordCloud.json", function(data) {

    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = 650-margin.left-margin.right;
    var height = 650-margin.top-margin.bottom;

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

    var tickers = ["ALL"]

    var bullsvg= d3.select("#bullishCloud").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

    var bearsvg= d3.select("#bearishCloud").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

    var neutralsvg= d3.select("#neutralCloud").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
    

    function update(tickers){

        var thisdata = $.extend(true, {}, data)

        bullsvg.selectAll("*").remove()
        bearsvg.selectAll("*").remove()
        neutralsvg.selectAll("*").remove()

        if(tickers.length == 0){
            tickers = ["ALL"]
        }
        else {
            tickers = tickers
        }

        var worddata = {}

        var bullisharray = []
        var neutralarray = []
        var bearisharray = []


        for (var i = 0; i < tickers.length; i ++){
            bullisharray = bullisharray.concat(thisdata[tickers[i]].bullish)
            neutralarray = neutralarray.concat(thisdata[tickers[i]].neutral)
            bearisharray = bearisharray.concat(thisdata[tickers[i]].bearish)
        }
        worddata['bullish'] = bullisharray
        worddata['neutral'] = neutralarray
        worddata['bearish'] = bearisharray

        makeCloud(worddata.bullish, bullsvg)
        
        makeCloud(worddata.neutral, neutralsvg)

        makeCloud(worddata.bearish, bearsvg)

        function makeCloud(wordlist, svg) {
            var sizeScale = d3.scaleLinear()
                            .domain(d3.extent(wordlist, function(d) {
                                return d.size
                            }))
                            .range([10, 60])
                
            var d3cloud = d3.layout.cloud()
                            .size([width,height])
                            .words(wordlist)
                            .padding(3)
                            .rotate(function(d) {return ~~(Math.random() * 2) * 90;})
                            .fontSize(function(d) {return sizeScale(+d.size);})
                            .font("Impact")
                            .on("end", drawCloud);
            
            d3cloud.start();

            function drawCloud(words) {
                svg.append("g")
                    .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function(d) { return d.size + 'px'; })
                    .style("font-family", "Impact")
                    .style("fill", function(d, i) { return fill(i); })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
            }
        }
    }

    update(tickers)

    var activeTickers = []
    $("#options input:checkbox").change(function(d) {
    if (activeTickers.includes(this.value)){
        var removedex = activeTickers.indexOf(this.value)
        activeTickers.splice(removedex, 1)
    }
    else if (activeTickers.length < 3){
        activeTickers.push(this.value)
    }
    else{
        activeTickers.pop()
        activeTickers.push(this.value)
    }
    update(activeTickers);
    })
})