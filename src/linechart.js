var margin = {
    left: 50,
    right: 20,
    top: 20,
    bottom: 50
};


var fullWidth = 1000;
var fullHeight = 500;
var width = fullWidth - margin.left - margin.right;
var height = fullHeight - margin.top - margin.bottom;

var xOffset = margin.left //window.innerWidth * 0.1;
var yOffset = margin.top //window.innerWidth * 0.1;

var minDate = new Date();
var maxDate = new Date();

var parseDate = d3.timeParse("%Y");

//Basic Linechart
d3.csv("https://gist.githubusercontent.com/lucafluri/c0aded999834a9105c233bd97cb8c56e/raw/6d70f9a5152d3d6b267f62507d8914b5ef9b4ea8/gistfile1.txt")
    .row(function (d) {
        return {
            year: parseDate(d.Jahr.split("/")[0]),
            major: d.Fachbereich,
            sex: d.Geschlecht,
            FHNW: Number(d.FHNW),
        }
    })
    .get(function (error, data) {
        var maxY = 0;
        // Filter inly CS and Engineering Majors and Men
        rows = data.filter(d => d.major === "Angewandte Psychologie").filter(d => d.sex === "Mann");
        rows_women = data.filter(d => d.major === "Angewandte Psychologie").filter(d => d.sex === "Frau");

        //Test Log
        //console.table(rows)

        maxY = d3.max(rows, d => d.FHNW);
        minDate = d3.min(rows, d => (d.year));
        maxDate = d3.max(rows, d => (d.year));

        var y = d3.scaleLinear()
            .domain([0, maxY])
            .range([height, 0]);

        var x = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([0, width]);

        var yAxis = d3.axisLeft(y);

        var xAxis = d3.axisBottom(x).ticks(rows.filter(d => d.sex === "Mann").length);


        var line = d3.line()
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.FHNW);
            })
            .curve(d3.curveLinear);

        var line2 = d3.line()
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.FHNW);
            })
            .curve(d3.curveLinear);



        d3.select("#page-1").append("h1").text("Männer & Frauen welche im Bereich Angewandte Psychologie studieren seit 1997")
        var svg = d3.select("#page-1").append("svg").attr("class", "svg").attr("height", fullHeight).attr("width", fullWidth);
        var chartGroup = svg.append("g").attr("class", "chartGroup").attr("transform", "translate(" + xOffset + "," + yOffset + ")");

        var path = chartGroup.append("path")
            .data([rows])
            .attr("class", "line")
            .attr("d", line)
            

        chartGroup.append("path")
            .data([rows_women])
            .attr("class", "line")
            .style("stroke", "blue")
            .attr("d", line)


        chartGroup.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        chartGroup.append("g")
            .attr("class", "axis y")
            .call(yAxis);
    })

