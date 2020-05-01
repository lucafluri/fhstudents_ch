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


//Streamgraph
d3.csv("https://gist.githubusercontent.com/lucafluri/c0aded999834a9105c233bd97cb8c56e/raw/f5f58e379e71d5e6438a69d2fe3226a6a9d1a776/gistfile1.txt", function (error, data) {

    // List of groups = header of the csv files
    var keys = data.columns.slice(1)
    const majors = data.filter(d => d.Jahr === "1997/98" && d.Geschlecht === "Mann").map(d => d.Fachbereich);

    d3.select("#page-2").append("h1").text("Verteilung der Technik und IT Studentinnen")

    var svg = d3.select("#page-2")
        .append("div")
        .attr("id", "page-2-graph")
        .append("svg")
        .attr("class", "svg")
        .style("text-align", "center")
        .attr("height", fullHeight)
        .attr("width", fullWidth);
    var chartGroup = svg.append("g").attr("class", "chartGroup").attr("transform", "translate(" + xOffset + "," + yOffset + ")");



    data.forEach(d => d.Jahr = parseDate(d.Jahr.split("/")[0]));
    data = data.filter(d => d.Geschlecht === "Frau").filter(d => d.Fachbereich === "Technik und IT");

    // Add X axis
    var x = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return d.Jahr;
        }))
        .range([0, width]);
    chartGroup.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10));


    var maxY = d3.max(data, d => Object.values(d).slice(3).reduce((prev, current) => Number(prev) + Number(current)))


    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, maxY])
        .range([height, 0]);
    chartGroup.append("g")
        .call(d3.axisLeft(y));

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'])

        
    //stack the data?
    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(keys)
        (data)
    
    console.log(stackedData)

    // create a tooltip
    var Tooltip = chartGroup
        .append("text")
        .attr("x", 50)
        .attr("y", 10)
        .style("opacity", 0)
        .style("fill", "white")
        .style("font-size", 17)

    //Line Tooltip thanks to http://bl.ocks.org/WillTurman/4631136
    var InfoLine = d3.select("#page-2-graph")
        .append("div")
        .attr("class", "infoline")
        .style("position", "relative")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", height + "px")
        .style("top", -fullHeight + margin.top + "px")
        .style("background", "#fff");

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip.style("opacity", 1)
        InfoLine.style("display", "block")
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1)
    }
    var mousemove = function (d, i) {
        mousex = d3.mouse(this)[0];
        mousey = d3.mouse(this)[1];
        grp = keys[i]
        //Tooltip.text(grp)

        var year = x.invert(mousex).getFullYear();
        var students = data.filter(d => d.Jahr.getFullYear() == year)[0][grp];

        var total = Object.values(data.filter(d => d.Jahr.getFullYear() == year)[0]).slice(3).reduce((prev, current) => Number(prev) + Number(current))

        InfoLine.text(year + " " + grp);
        InfoLine.append("div").text(students);
        InfoLine.append("div").text(total);

        //calculate position of mouse
        var mousePosX = chartGroup.node().getBoundingClientRect().left + mousex + 40;

        //display InfoLine
        InfoLine.style("left", mousePosX + "px")
        InfoLine.style("display", "block")
    }
    var mouseleave = function (d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        InfoLine.style("display", "none");
    }

    // Area generator
    var area = d3.area()
        .x(function (d) {
            return x(d.data.Jahr);
        })
        .y0(function (d) {
            return y(d[0]);
        })
        .y1(function (d) {
            if (isNaN(d[1])) d[1] = 0;
            return y(d[1]);
        })

    // Show the areas
    chartGroup
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function (d) {
            return color(d.key);
        })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)





})