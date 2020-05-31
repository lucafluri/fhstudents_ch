var size = 200;
var sizesChartsStats = {
    fullWidth: size + 210,
    fullHeight: size + 50,
    width: size + 150,
    height: size,
    xOffset: 0,
    yOffset: 0
}
// thanks to https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}


//Stat 1 
d3.csv("https://gist.githubusercontent.com/lucafluri/4d2b2caf23414ab2476200fc3c1cf7e4/raw/958ed54ec4a5ed48c438c871c69cb5267cea1d58/studis.csv", function (error, data) {
    //console.log(data)
    var stat1 = d3.select("#stat1").append("div").attr("class", "innerStat")
    var stat2 = d3.select("#stat2").append("div").attr("class", "innerStat")
    var stat4 = d3.select("#stat4").append("div").attr("class", "innerStat")

    

    // calc total amount of students since '97 - '19
    let totalWomen = 0;
    let totalMen = 0;
    data.forEach(d => {
        //if(d.Jahr == "2005/06")
        Object.keys(d).forEach((o, i) => {
            if (o !== "Fachbereich" && o !== "Geschlecht" && o !== "Jahr") {
                // totalStudents += Number(d[o]);
                if (d.Geschlecht === "Frau") totalWomen += Number(d[o]);
                else totalMen += Number(d[o]);
            }
        })
    })

    let percMen = Math.round((totalMen / (totalMen + totalWomen)) * 100);
    let percWomen = Math.round((totalWomen / (totalMen + totalWomen)) * 100);

    // stat1.append("p").text("Anzahl Studenten and schweizer FH's von 1997 - 2019 ").style("margin", "50px")
    stat1.append("div").attr("id", "stat1-spacer")
    d3.select("#stat1-text").text(numberWithCommas(totalMen + totalWomen) + " Studierende")
    stat1.append("div").attr("id", "stat1-wrapper")

    var barWrapper = d3.select("#stat1-wrapper")
    barWrapper.append("div").attr("id", "women-bar").style("width", 420*0.48+"px").style("padding-left", 420*0.52+"px")
    barWrapper.append("div").attr("id", "men-bar").style("width", 420*0.52+"px")
    d3.select("#men-bar").append("p").text("Männer: " + percMen + "%").attr("class", "stat1-text")
    d3.select("#women-bar").append("p").text("Frauen: " + percWomen + "%").attr("class", "stat1-text").style("font-size", "80%").style("margin-top", "5px")

})



//Stat 2 Line Chart
d3.csv("https://gist.githubusercontent.com/lucafluri/4d2b2caf23414ab2476200fc3c1cf7e4/raw/958ed54ec4a5ed48c438c871c69cb5267cea1d58/studis.csv")
    .row(function (d) {

        //Sum of all FH's
        var sum = 0;
        FHList.forEach(fh => {
            sum += Number(d[fh])
            //console.log(d[next])
        })

        return {
            year: d.Jahr.split("/")[0],
            major: d.Fachbereich,
            sex: d.Geschlecht,
            sum: sum,
        }
    })
    .get(function (error, data) {

        //Sort data into genders and year and sum all students
        var sortedData = d3.nest().key(d => d.sex).key(d => d.year).rollup(function (leaves) {
            return {
                "total": d3.sum(leaves, d => d.sum)
            }
        }).entries(data);



        var maxY = 0;
        rows = sortedData.filter(d => d.key == "Mann")[0].values;
        rows_women = sortedData.filter(d => d.key == "Frau")[0].values;

        //console.log(rows.length)


        //Frauen und Männer waren 2009 nahezu gleichviel
        //2010 überholten die Frauen dann die Männer in der Anzahl
        // Year: Men   Women
        // 2010: 36898 38137
        // 2009: 34841 34835

        // rows.forEach((o, i) => {
        //     console.log(rows[i].key + ": " + rows[i].value.total + " " + rows_women[i].value.total)
        // })


        maxY = d3.max(rows.concat(rows_women), d => d.value.total);

        minDate = d3.min(rows, d => parseDate(d.key)); //parseDate("1997"); 
        maxDate = d3.max(rows, d => parseDate(d.key)); //parseDate("2019"); 

        var y = d3.scaleLinear()
            .domain([0, maxY])
            .range([sizesChartsStats.height, 0]);

        var x = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([0, sizesChartsStats.width]);

        var yAxis = d3.axisLeft(y).ticks(5);

        var xAxis = d3.axisBottom(x).ticks(7);


        let line = d3.line()
            .x(function (d) {
                return x(parseDate(d.key));
            })
            .y(function (d) {
                return y(d.value.total);
            })
            .curve(d3.curveBasis);



        var div = d3.select("#stat2").append("div").style("width", sizesChartsStats.width + "px")
        var svg = div.append("svg").attr("class", "svg").attr("height", sizesChartsStats.fullHeight).attr("width", sizesChartsStats.fullWidth).attr("transform", "translate(" + (sizesChartsStats.fullWidth - 220) / 2 + "," + (sizesChartsStats.fullHeight - 150) / 2 + ")");;
        var chartGroup = svg.append("g").attr("class", "chartGroup2").attr("transform", "translate(" + sizesChartsStats.xOffset + 60 + "," + sizesChartsStats.yOffset + ")");


        var pathM = chartGroup.append("path")
            .data([rows])
            .attr("class", "line")
            .style("stroke", colorM)
            .attr("d", line)

        var pathW = chartGroup.append("path")
            .data([rows_women])
            .attr("class", "line")
            .style("stroke", colorW)
            .attr("d", line)

        chartGroup.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(-1," + sizesChartsStats.height + ")")
            .call(xAxis);

        chartGroup.append("g")
            .attr("class", "axis y")
            .attr("transform", function (d) {
                return "translate(" + -1 + ")";
            })
            .call(yAxis);

        chartGroup.select('.y')
            .call(yAxis)
            .selectAll("text")
            .style("fill", "#848484")
            .style("font-size", "11pt")

        chartGroup.select('.x')
            //.attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#848484")
            .style("font-size", "11pt")
            .attr("dx", "-.8em")
            .attr("dy", "1em")
            .attr("transform", function (d) {
                return "rotate(-30)";
            })


    })


//Stat 3 Donut Chart
//Thanks to https://www.d3-graph-gallery.com/graph/donut_label.html
d3.csv("https://gist.githubusercontent.com/lucafluri/4d2b2caf23414ab2476200fc3c1cf7e4/raw/958ed54ec4a5ed48c438c871c69cb5267cea1d58/studis.csv")
    .row(function (d) {

        //Sum of all FH's
        var sum = 0;
        FHList.forEach(fh => {
            sum += Number(d[fh])
            //console.log(d[next])
        })

        return {
            year: d.Jahr.split("/")[0],
            major: d.Fachbereich,
            sex: d.Geschlecht,
            sum: sum,
        }
    })
    .get(function (error, data) {

        var slider = d3.select("#placeholder_for_slider")
            .append("input")
            .attr("type", "range")
            .attr("min", "1997")
            .attr("max", "2019")
            .attr("value", "1997")
            .attr("ticks", "23")
            .attr("id", "slider_donut")
            .attr("class", "slider")

        d3.select("#slider_donut").on("input", () => donut(document.getElementById("slider_donut").value))
        donut(1997)
        

        // let year = 2019 //Accepted Values: 1997-2019
        function donut(year) {
            d3.select("#div_donut").remove()
            let YEAR_INDEX = Math.abs(year - 2019);
            
            let maxAreas = 5; //to not overwhelm the user #of areas except the collapsed other category
            if(year == 1997) maxAreas = 4;
            else if(year >= 2001) maxAreas = 6;
            
            //Sorted Data after year and sum of male and female
            // var sortedData = d3.nest().key(d => d.major).key(d => d.sex).entries(data);
            var sortedData = d3.nest().key(d => d.major).key(d => d.year).rollup(function (leaves) {
                return d3.sum(leaves, d => d.sum)
            }).entries(data);

            //Sort data to filter only the top ones
            sortedData = sortedData.sort(function (a, b) {
                return d3.descending(a.values[YEAR_INDEX].value, b.values[YEAR_INDEX].value)
            })

            //Construct "Other" Object to append to the main data
            let obj = {
                key: "YEAR",
                value: 0
            };
            let leftoverObj = {
                key: "Andere",
                values: new Array(23).fill({
                    key: "YEAR",
                    value: 0
                })
            }
            let leftover = sortedData.filter(function (d, i) {
                return i >= maxAreas
            })

            leftover.forEach(d => {
                //console.log(YEAR_INDEX)
                leftoverObj.values[YEAR_INDEX].key = d.values[YEAR_INDEX].key;
                leftoverObj.values[YEAR_INDEX].value += d.values[YEAR_INDEX].value;

            })


            sortedData = sortedData.filter(function (d, i) {
                return i < maxAreas
            })
            sortedData.push(leftoverObj)


            let majors = []

            //console.log(sortedData)

            // set the dimensions and margins of the graph
            var donut_width = 500
            donut_height = 250
            donut_margin = 40

            // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
            var radius = Math.min(donut_width, donut_height) / 2 - donut_margin



            // append the svg object to the div called '#stat3'

            d3.select("#div_donut").remove()
            var stat3 = d3.select("#placeholder_for_chart").append("div").attr("class", "innerStat").attr("id", "div_donut")

            var svg = stat3
                .append("svg")
                .attr("width", donut_width)
                .attr("height", donut_height)
                .append("g")
                .attr("transform", "translate(" + donut_width / 2 + "," + donut_height / 2 + ")");



            // set the color scale
            var color = d3.scaleOrdinal()
                .domain(majors)
                .range(COLOR_PALETTE);

            // Compute the position of each group on the pie:
            var pie = d3.pie()
                .sort(null) // Do not sort group by size
                .value(function (d) {
                    //console.log(d.values[0].value)
                    //return only sum of 2019
                    return d.values[YEAR_INDEX].value;
                })
            var data_ready = pie((sortedData))

            // The arc generator
            var arc = d3.arc()
                .innerRadius(radius * 0.5) // This is the size of the donut hole
                .outerRadius(radius * 0.8)

            // Another arc that won't be drawn. Just for labels positioning
            var outerArc = d3.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9)

            // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
            svg
                .selectAll('allSlices')
                .data(data_ready)
                .enter()
                .append('path')
                .attr("class", "donut")
                .attr('d', arc)
                .attr('fill', function (d) {
                    return (color(d.data.key))
                })
                .attr("stroke", "#191919")
                .style("stroke-width", "2px")
                .style("opacity", 1)

            // Add the polylines between chart and labels:
            svg
                .selectAll('allPolylines')
                .data(data_ready)
                .enter()
                .append('polyline')
                .attr("stroke", "white")
                .style("fill", "none")
                .attr("stroke-width", 1)
                .attr('points', function (d) {
                    var posA = arc.centroid(d) // line insertion in the slice
                    var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                    var posC = outerArc.centroid(d); // Label position = almost the same as posB
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                    return [posA, posB, posC]
                })

            // Add the polylines between chart and labels:
            svg
                .selectAll('allLabels')
                .data(data_ready)
                .enter()
                .append('text')
                .text(function (d) {
                    // console.log(d.data.key);
                    let m = ""
                    let maxLength = 15;
                    if (d.data.key.length > maxLength)
                        m = d.data.key.slice(0, 15) + "..."
                    else m = d.data.key
                    return m
                })
                .attr("class", "axisLabel")
                .attr('transform', function (d) {
                    var pos = outerArc.centroid(d);
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                })
                .style('text-anchor', function (d) {
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    return (midangle < Math.PI ? 'start' : 'end')
                })

            //Add center Year Indicator
            svg
                .append('text')
                .text(year)
                .attr("class", "axisLabel")
                .attr('transform', function (d) {
                    return 'translate(' + -17 + ", " + 5 + ')';
                })

        }

    })