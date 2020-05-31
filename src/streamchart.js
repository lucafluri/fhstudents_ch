// const COLOR_PALETTE = ["#8c4b80", "#3d4d83", "#615190", "#865196", "#ab5094", "#cc508b", "#e7537b", "#fb5f67", "#ff724e", "#ff8b32", "#ffa600"].reverse();
const COLOR_PALETTE = ["#07334F", "#0A4775", "#074B89", "#0C55B4", "#116FBF", "#1D96C2", "#52C0D9", "#72E5F2"].reverse();



function removeDuplicates(names) {
    return names.reduce((acc, curr) => acc.includes(curr) ? acc : [...acc, curr], []);
}
//update data
function updateGraph(data, COLOR) {
    //remove all paths
    d3.selectAll(".myArea").remove();

    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(COLOR);

    //stack the data?
    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(keys)
        (data)

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        InfoLine.style("display", "block")
        InfoLine.style("background", "#ffffff")
        tooltipInfo.style("display", "block")
        d3.selectAll(".myArea").style("opacity", .5)
        d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1)

    }

    var mousemove = function (d, i) {
        mousex = d3.mouse(this)[0];
        mousey = d3.mouse(this)[1];
        grp = keys[i]

        var year = xChart.invert(mousex).getFullYear();

        var students = data.filter(d => d.Jahr.getFullYear() == year)[0][grp];

        var total = Object.values(data.filter(d => d.Jahr.getFullYear() == year)[0]).slice(3).reduce((prev, current) => Number(prev) + Number(current))

        //Build Tooltip

        tooltipInfo.text(""); //clear tooltip
        tooltipInfo.append("div").html(`<strong>Jahr:</strong> ${year}`).attr("class", "tooltipInfo");
        tooltipInfo.append("div").html(`<strong>FH:</strong> ${grp}`).attr("class", "tooltipInfo");
        tooltipInfo.append("div").html(`<strong>Studierende an FH: </strong> ${students}`).attr("class", "tooltipInfo");
        tooltipInfo.append("div").html(`<strong>Studierende Total: </strong> ${total}`).attr("class", "tooltipInfo");

        //calculate position of mouse
        var mousePosX = chartGroup.node().getBoundingClientRect().left + mousex + 80;

        //display InfoLine
        InfoLine.style("left", mousePosX + "px")
        InfoLine.style("display", "block")
        tooltipInfo.style("left", mousePosX + "px")


        mousex = d3.mouse(this)[0];
        var year = xChart.invert(mousex).getFullYear();


        /*Mouse active / set all ticks transparent*/
        d3.select('.x').selectAll(".tick")
            .style('opacity', .5);

        /**Round the year to an even number */
        if (year % 2 != 0) {
            year -= 1;

        }
        /**Set opacity to 1 for this year */
        d3.select("#year-" + year + "")
            .style('opacity', 0.8)
            .select("text")
            .style('fill', '#f3f3f3');
    }

    var mouseleave = function (d) {
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        InfoLine.style("display", "none").style("background", "#ffffff00");
        tooltipInfo.style("display", "none");
        d3.select('.x').selectAll(".tick")
            .style('opacity', 1.0)
            .select("text")
            .style('fill', '#848484');
    }

    var maxY = d3.max(data, d => Object.values(d).slice(3).reduce((prev, current) => Number(prev) + Number(current)))
    yChart.domain([0, maxY])
    xChart.domain(d3.extent(data, function (d) {
        return d.Jahr;
    }))

    // Area generator
    var area = d3.area()
        .x(function (d) {
            return xChart(d.data.Jahr);
        })
        .y0(function (d) {
            return yChart(d[0]);
        })
        .y1(function (d) {
            if (isNaN(d[1])) d[1] = 0;
            return yChart(d[1]);
        })

    // Show the areas
    var areas = chartGroup.selectAll("mylayers")
        .data(stackedData)


    areas.enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function (d) {
            return color(d.key);
        })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)


    
    chartGroup.select('.y')
        .transition()
        .duration(1500)
        .call(yAxis)
        
    chartGroup.select('.y')
        .selectAll("text")
        .style("fill", "#848484")
        .style("font-size", "11pt")
  

    chartGroup.select('.x')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("fill", "#848484")
        .style("font-size", "11pt")
        .attr("dx", "-.8em")
        .attr("dy", "1em")
        .attr("transform", function (d) {
            return "rotate(-30)";
        })

    d3.select('.x')
        .selectAll('.tick')
        .attr("id", function (d, i) {
            return "year-" + formatTime(d);
        })
    d3.selectAll("line")
        .style("stroke", "#848484")

    chartGroup.select(".y axis").transition()
        .duration(1000)
  
}


d3.csv("https://gist.githubusercontent.com/lucafluri/4d2b2caf23414ab2476200fc3c1cf7e4/raw/958ed54ec4a5ed48c438c871c69cb5267cea1d58/studis.csv", function (error, data) {
    const major = removeDuplicates(data.map(d => d.Fachbereich));

    // const COLOR_MEN = ["#07334F", "#094163", "#0A4775", "#074B89", "#0550A0", "#0C55B4", "#115BBF", "#116FBF", "#117DBF", "#158FBF", "#1D96C2", "#52C0D9", "#72E5F2"].reverse();
    // const COLOR_BOTH = ["#143724", "#19462d", "#1d5034", "#215c3c", "#256944", "#297e50", "#359f65", "#47b178", "#63d095", "#83e0ad", "#b5edcf"].reverse();

    const keys = data.columns.slice(1)
    data.forEach(d => d.Jahr = parseDate(d.Jahr.split("/")[0]));
    var orgData = d3.nest()
        .key(function (d) {
            return d.Fachbereich
        })
        .key(function (d) {
            return d.Geschlecht
        })
        .entries(data);
    // Add Dropdown
    var dropdown = d3.select("#container-menu-1")
        .append("select")
        .attr("id", "dropdown-major")
        .on("change", change)
        .selectAll("option")
        .data(orgData)
        .enter()
        .append("option")
        .attr("class", "select-options")
        .attr("value", function (d) {
            return d.key;
        })
        .text(function (d) {
            return d.key;
        })

    function change(select) {
        let major = document.getElementById('dropdown-major').value
        var ele = document.getElementsByName('gender')
        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked) {
                var gender = ele[i].value;
            }
        }

        /*Prepare Data*/
        for (let i = 0; i < orgData.length; i++) {
            if (orgData[i].key === major) {
                if (gender == "Mann") {
                    updateGraph(orgData[i].values[0].values, COLOR_PALETTE);
                    // color palette

                } else if (gender == "Frau") {
                    updateGraph(orgData[i].values[1].values, COLOR_PALETTE);
                } else {

                    let bothData = _.cloneDeep(orgData[i].values[0].values);
                    let femaleData = _.cloneDeep(orgData[i].values[1].values);

                    for (let j = 0; j < orgData[i].values[0].values.length; j++) {

                        Object.keys(bothData[j]).forEach(function (k) {
                            if (k !== "Fachbereich" && k !== "Geschlecht" && k !== "Jahr") {

                                bothData[j][k] = Number(parseInt(bothData[j][k]) + parseInt(femaleData[j][k]))
                            }
                        })
                    }
                    updateGraph(bothData, COLOR_PALETTE);
                }
            }
        }
    }
    //add radio onclick buttons
    var radios = d3.select("#gender")
    radios.on("click", change)
    change();
});





var keys = ["BFH", "HES-SO", "FHNW", "FHZ", "SUPSI", "FHO", "ZFH", "Kal FH", "LRG", "Andere PH/Inst.", "Andere FH"];

var margin = {
    left: 50,
    right: 20,
    top: 20,
    bottom: 50
};


var fullWidth = 1100;
var fullHeight = 600;
var width = 1000 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var xOffset = margin.left + 40 //window.innerWidth * 0.1;
var yOffset = margin.top //window.innerWidth * 0.1;

var minDate = new Date();
var maxDate = new Date();

var parseDate = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");

var svg = d3.select("#page-2")
    .append("div")
    .attr("id", "svg-streampath")
    .append("svg")
    .attr("class", "svg")
    .style("text-align", "center")
    .attr("height", fullHeight)
    .attr("width", fullWidth);
var chartGroup = svg.append("g").attr("class", "chartGroup").attr("transform", "translate(" + xOffset + "," + yOffset + ")");

// Add X axis
var xChart = d3.scaleTime()
    .range([0, width]);

// Add Y axis
var yChart = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(xChart).ticks(10);
var yAxis = d3.axisLeft(yChart);

// chartGroup.append("text")
//     .attr("transform",
//         "translate(" + (width / 2) + " ," +
//         (height + margin.top + 35) + ")")
//     .style("text-anchor", "middle")
//     .attr("class", "axisLabel")
//     .text("Jahre");

// text label for the y axis
chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 30)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("class", "axisLabel")
    .text("Neue Studierende");



//left axis
chartGroup.append("g")
    .attr("class", "y axis")
    .call(yAxis)

//bottom axis
chartGroup.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

//Line Tooltip thanks to http://bl.ocks.org/WillTurman/4631136
var InfoLine = d3.select("#svg-streampath")
    .append("div")
    .attr("class", "infoline")
    .style("position", "relative")
    .style("z-index", "19")
    .style("width", "1px")
    .style("height", height + "px")
    .style("top", -fullHeight + margin.top + "px")



var tooltipInfo = d3.select("#svg-streampath")
    .append("div")
    .style("position", "relative")
    .style("z-index", "19")
    .style("width", "100px")
    //.style("height", height + "px")
    .style("top", -1000 + "px");