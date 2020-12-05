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


    var entity_list = data.bullish
    var svg= d3.select("#bullishCloud").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                     "translate(" + margin.left + "," + margin.top + ")");

    makeCloud(entity_list)

    var entity_list = data.neutral
    var svg= d3.select("#neutralCloud").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                     "translate(" + margin.left + "," + margin.top + ")");

    makeCloud(entity_list)

    var entity_list = data.bearish
    var svg= d3.select("#bearishCloud").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                     "translate(" + margin.left + "," + margin.top + ")");

    makeCloud(entity_list)

    function makeCloud(wordlist) {
        var sizeScale = d3.scaleLinear()
                        .domain([d3.min(entity_list, function(d) {
                            return d.size
                        }), d3.max(entity_list, function(d) {
                            return d.size;
                        })])
                        .range([10, 60])
            
        var d3cloud = d3.layout.cloud()
                        .size([width,height])
                        .words(entity_list)
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
})