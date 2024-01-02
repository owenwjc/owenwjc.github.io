const colors = ["#bc5d41",
"#84a955",
"#965da7"]

const bar_colors = ["#a970ff", "#d5cabd"]

const hist_colors = ["#d94273",
"#6d7ddb"]

const density_margin = {
    top: 30,
    right: 10,
    bottom: 30,
    left: 50,
}
const bar_margin = {
    top: 45,
    right: 20,
    bottom: 20,
    left: 30
}

const density_width = 1200 - (density_margin.left + density_margin.right)
const density_height = 400 - (density_margin.top + density_margin.bottom)

const bar_width = 450 - (bar_margin.left + bar_margin.right)
// 250 emotes * 28 = 5600
const bar_height = 7000 - (bar_margin.top + bar_margin.bottom)

var emotes = ["505187"]
var domain = [0, 24600]

var color = d3.scaleOrdinal()
    .range(colors)

var updateDensity = function() {
    var svg
    
    function graph(_selection) {
        _selection.each(function(_data) {

            if (!svg) {
                svg = d3.select(this)
                    .append('svg')
                    .attr('viewBox', `0 0 ${density_width + (density_margin.left + density_margin.right)} ${density_height + (density_margin.top + density_margin.bottom)}`)
            }
            svg.selectAll('path').remove()
            svg.selectAll('.tick').remove()
            svg.selectAll('.brush').remove()

            var brush = d3.brushX()
                .extent([[0,0], [density_width, density_height]])
                .on('end', brushChart)

            var x = d3.scaleLinear()
                .domain(domain)
                .range([0, density_width])
            var xAxis = svg.append('g')
                .attr('transform', `translate(${density_margin.left},${density_height + density_margin.top})`)
                .call(d3.axisBottom(x).tickFormat(function(d) {
                    var hours = Math.floor(d / 3600)
                    var minutes = Math.floor((d % 3600) / 60)
                    var seconds = (d % 3600) % 60
                    if (seconds == 60) {
                        seconds = 0
                        minutes += 1
                    }
                    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
                }).ticks(6))

            var y = d3.scaleLinear()
                .range([density_height, 0])
                .domain([0, d3.max(_data, function(d) {
                    return d3.max(d, function(e) {
                        return d3.max(e.slice(1))
                    })})])
            var yAxis = svg.append('g')
                .attr('transform', `translate(${density_margin.left},${density_margin.top})`)
                .call(d3.axisLeft(y).tickFormat(function(d) {
                    return `${(d * 100).toFixed(3)}`
                }))

            var density = svg.append('g')
                .attr('transform', `translate(${density_margin.left} ${density_margin.top})`)

            density.append('text')
                .attr('x', (density_width / 2))
                .attr('y', 0 - (density_margin.top / 2))
                .attr('text-anchor', 'middle')
                .text('Emote Density Over Time')

            density.selectAll().data(_data)
                .join('path')
                .attr('fill', function(d, i) {return color(i)})
                .attr('opacity', '.6')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('stroke-linejoin', 'round')
                .attr('d', d3.area()
                    .curve(d3.curveBasis)
                        .x(function(d) {return x(d[0])})
                        .y0(y(0))
                        .y1(function(d) {return y(d[1])})
                    )
    
            density.append('g')
                .attr('class', 'brush')
                .call(brush)

        })
    }
    return graph
}

var updateLegend = function() {
    var svg
    
    function graph(_selection) {
        _selection.each(function(_data) {

            if (!svg) {
                svg = d3.select(this)
                    .append('svg')
                    .attr('viewBox', `0 0 180 180`)
            }
            svg.selectAll('text').remove()
            svg.selectAll('circles').remove()
            svg.selectAll('image').remove()

            svg.append('text').attr('text-anchor', 'middle').attr('x', 90).attr('y', 20).text('Selected Emotes')
            svg.append('g')
                .selectAll('image')
                .data(_data)
                .join('image')
                .attr('href', function(d) {return d.path})
                .attr('x', 30)
                .attr('y', (d, i) => (i * 35) + 35)
                .attr('width', 28)
                .attr('height', 28)
                .on('click', removeEmote)

            svg.selectAll('circle')
                .data(_data)
                .join('circle')
                .attr('cx', 10)
                .attr('cy', (d, i) => (i * 35) + 50)
                .attr('r', 6)
                .style('fill', (d, i) => color(i))
                .on('click', removeEmote)

            svg.selectAll('labels').data(_data)
                .join('text')
                .attr('x', 65)
                .attr('y', (d, i) => (i * 35) + 55)
                .text((d) => d.name)
                .on('click', removeEmote)
        })
    }
    return graph
}

var updateHist = function() {
    var hist_color = d3.scaleOrdinal()
    .range(hist_colors),  svg
    
    function graph(_selection) {
        _selection.each(function(_data) {

            if (!svg) {
                svg = d3.select(this)
                    .append('svg')
                    .attr('viewBox', `0 0 ${density_width + (density_margin.left + density_margin.right)} ${density_height + (density_margin.top + density_margin.bottom)}`)
            }
            svg.selectAll('path').remove()
            svg.selectAll('.tick').remove()
            svg.selectAll('rect').remove()

            var x = d3.scaleLinear()
                .domain(domain)
                .range([0, density_width])
            var xAxis = svg.append('g')
                .attr('transform', `translate(${density_margin.left}, ${density_height + density_margin.top})`)
                .call(d3.axisBottom(x).tickFormat(function(d) {
                    var hours = Math.floor(d / 3600)
                    var minutes = Math.floor((d % 3600) / 60)
                    var seconds = (d % 3600) % 60
                    if (seconds == 60) {
                        seconds = 0
                        minutes += 1
                    }
                    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
                }).ticks(6))
            
            var y = d3.scaleLinear()
                .range([density_height, 0])
                .domain([0, d3.max(_data, function(d) {
                    return d3.max(d, function(e) {
                        return e.messages
                    })
                })])
            var yAxis = svg.append('g')
                .attr('transform', `translate(${density_margin.left}, ${density_margin.top})`)
                .call(d3.axisLeft(y))

            var barwidth = x(_data[1][0]) - x(_data[0][0])

            var hist = svg.append('g')
                .attr('transform', `translate(${density_margin.left}, ${density_margin.top})`)

            hist.append('text')
                .attr('x', (density_width / 2))
                .attr('y', 0 - (density_margin).top / 2)
                .attr('text-anchor', 'middle')
                .text('Message and Chatter Count Over Time')

            hist.selectAll('rect')
                .data(_data)
                .join('rect')
                .attr('x', function(d) {return x(d[0])})
                .attr('y', function(d) {return y(d[1].messages)})
                .attr('width', barwidth)
                .attr('height', function(d) {return density_height - y(d[1].messages)})
                .style('fill', hist_color(0))
                .style('opacity', .5)

            hist.selectAll('rect2')
                .data(_data)
                .join('rect')
                .attr('x', function(d) {return x(d[0])})
                .attr('y', function(d) {return y(d[1].commenters)})
                .attr('width', barwidth)
                .attr('height', function(d) {return density_height - y(d[1].commenters)})
                .style('fill', hist_color(1))
                .style('opacity', 1)
            
            svg.on('click', addImage)
        })
    }
    return graph
}

var update_density = updateDensity()
var density_container = d3.select('.density')

var update_legend = updateLegend()
var legend_container = d3.select('.density-legend')

var update_hist = updateHist()
var hist_container = d3.select('.histogram')

function update() {
    d3.csv("../data/tables/chat.csv").then(function(data) {
        data = data.filter(function(d) {
            return d.time >= domain[0] && d.time <= domain[1]
        })

        var x = d3.scaleLinear().domain(domain)
        const kde = kernelDensityEstimator(kernelEpanechnikov(10), x.ticks(100))

        density_data = emotes.map(function(emote) {
            return kde(data.filter(function(d) {
                return d.emotes.includes(emote)
            }).map(function(d) {return d.time}))

        })
        density_container.data([density_data]).call(update_density)

        var binsize = (x.ticks(100)[1] - x.ticks(100)[0])
        hist_data = d3.rollups(data, function(v) {
            return {'messages': v.length, 'commenters': new Set(v.map(d => d['commenter._id'])).size}}, function(d) {
                return Math.floor(d.time / binsize) * binsize})
        hist_container.data([hist_data]).call(update_hist)
    })

    d3.csv("../data/tables/emotes.csv").then(function(data) {
        emoteData = data.filter(function(d) {
            return emotes.includes(d.id)
        })
        emoteData.sort(function(a, b) {return emotes.indexOf(a.id) - emotes.indexOf(b.id)})
        emoteData.forEach(function(d) {
            d.path = "../data/emotes/" + d.id + ".png";
        })
        legend_container.data([emoteData]).call(update_legend)
    })
}
update()

var idleTimeout
function idled() {idleTimeout = null}

function brushChart({selection}) {
    var x = d3.scaleLinear().domain(domain).range([0, density_width])
    if (!selection) {
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
        domain[0] = 0
        domain[1] = 24600
    } else {
        domain[0] = x.invert(selection[0])
        domain[1] = x.invert(selection[1])
    }
    update()
}

function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) {return kernel(x - v)})]
        })
    }
}
function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0
    }
}

function addEmote(event, d) {
    if (!emotes.includes(d.id) && emotes.length < 3) {
        emotes.push(d.id)
    }
    update()
}
function removeEmote(event, d) {
    if (emotes.length > 1) {
        emotes.splice(emotes.indexOf(d.id), 1)
    }
    update()
}

function roundAndString(number) {
    if(number>24545)
    return "24545";

    if(number<0)
    return "0";

    var num =  Math.round(number / 5) * 5;
    return String(num).padStart(5, '0');
}

function addImage(event, d) {
    x = d3.scaleLinear().domain(domain).range([0, density_width])
    var x0 = x.invert(event.clientX);

    var img_id = roundAndString(x0);
    frame = d3.select('.image')

    frame.selectAll('svg').remove()
    frame.append('svg')
        .attr('viewBox', `0 0 1280 720`)
        .append('image')
        .attr('href', "../data/images/"+img_id+".jpg")
        .attr('width', 1280)
        .attr('height', 720)
        .on('click', removeImage)
}

function removeImage(event, d) {
    frame = d3.select('.image')

    frame.selectAll('svg').remove()
}

d3.csv("../data/tables/emotes.csv").then(function(data) {
    var emoteData = data.sort(function(a, b) {return b.count - a.count})
    emoteData.forEach(function(d) {
        d.path = `../data/emotes/${d.id}.png`
    })

    var color = d3.scaleOrdinal()
        .domain(['fp', 'tp'])
        .range(bar_colors)

    var tooltip = d3.select('.page')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style("background-color", "black")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("position", 'absolute')

    var mouseover = function(event, d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1)
    }
        
    
    var mousemove = function(event, d) {
        tooltip
            .html(d.name + " was used in " + d.count + " messages.")
            .style("left", (event.clientX) + 30 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (event.clientY) + "px")
    }
    
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function(event, d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    const svg = d3.select('.bar')
        .append('svg')
        .attr('viewBox', `0 0 ${bar_width + (bar_margin.left + bar_margin.right)} ${bar_height + (bar_margin.top + bar_margin.bottom)}`)

    var bar = svg.append('g')
        .attr('transform', `translate(${bar_margin.left} ${bar_margin.top})`)

    bar.append('text')
        .attr('x', (bar_width / 2))
        .attr('y', 0 - (bar_margin.top / 2))
        .attr('text-anchor', 'middle')
        .text('Number of Messages Containing Emote')

    var y = d3.scaleBand()
        .domain(emoteData.map(function(d) {return d.id}))
        .range([0, bar_height])
        .padding(.1)
    svg.append('g')
        .attr('transform', `translate(${bar_margin.left}, ${bar_margin.top})`)
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickSize([0, 0]).tickFormat(""))

    var x = d3.scaleLinear()
        .domain([0, d3.max(emoteData, function(d) {return +d.count})])
        .range([0, bar_width])
    svg.append('g')
        .attr('transform', `translate(${bar_margin.left}, ${bar_margin.top})`)
        .call(d3.axisTop(x).tickSizeOuter(0).ticks(5))

    bar.selectAll('myRect')
        .data(emoteData)
        .join('rect')
        .attr('x', x(0))
        .attr('y', function(d) {return y(d.id)})
        .attr('width', function(d) {return x(d.count)})
        .attr('height', y.bandwidth())
        .attr('fill', function(d) {return color(d.source)})
        .attr('opacity', .8)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)
        .on('click', addEmote)

    var ticks = svg.select('.axis').selectAll('.tick')
        .data(emoteData)
        .append('image')
        .attr('href', function(d) {return d.path})
        .attr('width', 28)
        .attr('height', 28)
        .attr('x', -28)
        .attr('y', -14)
        .on('click', addEmote)

    //opaque lines showing the emote count
    svg.append("g")
        .attr("transform", `translate(${bar_margin.left},${bar_margin.top})`)
        .attr("stroke-opacity", 0.1)
        .call(d3.axisBottom(x).tickFormat("").tickSize(bar_height).ticks(5).tickSizeOuter(0))

})

function bar_legend() {
    const svg = d3.select('.bar-legend')
        .append('svg')
        .attr('viewBox', `0 0 180 180`)

    svg.append('text').attr('text-anchor', 'middle').attr('x', 90).attr('y', 20).text('Emote Source')
    svg.append('circle').attr('cx', 10).attr('cy', 50).attr('r', 6).style('fill', bar_colors[0])
    svg.append('circle').attr('cx', 10).attr('cy', 80).attr('r', 6).style('fill', bar_colors[1])
    svg.append('text').attr('x', 25).attr('y', 55).text('Twitch')
    svg.append('text').attr('x', 25).attr('y', 85).text('Third-party')
}
bar_legend()

function hist_legend() {
    const svg = d3.select('.histogram-legend')
        .append('svg')
        .attr('viewBox', `0 0 180 180`)

    svg.append('text').attr('text-anchor', 'middle').attr('x', 90).attr('y', 20).text('Chat Metrics')
    svg.append('circle').attr('cx', 10).attr('cy', 50).attr('r', 6).style('fill', hist_colors[0])
    svg.append('circle').attr('cx', 10).attr('cy', 80).attr('r', 6).style('fill', hist_colors[1])
    svg.append('text').attr('x', 25).attr('y', 55).text('Message Count')
    svg.append('text').attr('x', 25).attr('y', 85).text('Chatter Count')
}
hist_legend()