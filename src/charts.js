var margin = {
    left: 50,
    right: 20,
    top: 20,
    bottom: 50
};

var sizesCharts = {
    fullWidth: 120,
    fullHeight: 120,
    width: 120,
    height: 120,
    xOffset: 0,
    yOffset: 0
}


var animationTime = 7000;
var animationEase = d3.easeSin;
var colorW = "#AB5093"//"#FA734E"
var colorM = "#FAA601"//"#52C0D9"


var minDate = new Date();
var maxDate = new Date();

var parseDate = d3.timeParse("%Y");

let majorList = ["Architektur, Bau- und Planungswesen", "Technik und IT", "Chemie und Life Sciences", "Land- und Forstwirtschaft", "Wirtschaft und Dienstleistungen", "Design", "Sport", "Musik, Theater und andere Künste", "Angewandte Linguistik", "Soziale Arbeit", "Angewandte Psychologie", "Gesundheit", "Lehrkräfte-Ausbildung"]//, "Nicht zuteilbar"]
var FHList = ["BFH","HES-SO","FHNW","FHZ","SUPSI","FHO","ZFH","Kal FH","LRG","Andere PH/Inst.","Andere FH"]

//Basic Linechart
d3.csv("https://gist.githubusercontent.com/lucafluri/4d2b2caf23414ab2476200fc3c1cf7e4/raw/958ed54ec4a5ed48c438c871c69cb5267cea1d58/studis.csv")
    .row(function (d) {
            
        //Sum of all FH's
        var sum = 0;
        FHList.forEach(fh => {
            sum += Number(d[fh])
            //console.log(d[next])
        })

        return {
            year: parseDate(d.Jahr.split("/")[0]),
            major: d.Fachbereich,
            sex: d.Geschlecht,
            sum: sum, 
        }
    })
    .get(function (error, data) {

        d3.select("#p1-legend-m").attr("style", "fill:" + colorM + ";")
        d3.select("#p1-legend-w").attr("style", "fill:" + colorW + ";")

        //Remove entries with zeros
        data = data.filter(d => d.sum != 0)
        

        majorList.forEach((m, i) => {
            addGraph(m, i)
        })

        function addGraph(major, index) {
            var maxY = 0;
            // Filter inly CS and Engineering Majors and Men
            rows = data.filter(d => d.major === major).filter(d => d.sex === "Mann");
            rows_women = data.filter(d => d.major === major).filter(d => d.sex === "Frau");

            maxY = d3.max(rows.concat(rows_women), d => d.sum);
            minDate = d3.min(rows, d => (d.year));
            maxDate = d3.max(rows, d => (d.year));


            //console.log(minDate)

            var y = d3.scaleLinear()
                .domain([0, maxY])
                .range([sizesCharts.height, 0]);

            var x = d3.scaleTime()
                .domain([minDate, maxDate])
                .range([0, sizesCharts.width]);

            var line = d3.line()
                .x(function (d) {
                    return x(d.year);
                })
                .y(function (d) {
                    return y(d.sum);
                })
                .curve(d3.curveBasis);

        
            var div = d3.select("#miniCharts").append("div").attr("class", "miniChartDiv " + `miniChartDiv${index}`).style("width", sizesCharts.width + "px")
            div.append("p").text(major).style("text-align", "center").style("margin-bottom", "10px").style("height", "60px")
            var svg = div.append("svg").attr("class", "svg").attr("height", sizesCharts.fullHeight).attr("width", sizesCharts.fullWidth);
            var chartGroup = svg.append("g").attr("class", "chartGroup").attr("transform", "translate(" + sizesCharts.xOffset + "," + sizesCharts.yOffset + ")");

            
            var pathM = chartGroup.append("path")
                .data([rows])
                .attr("class", "line")
                .style("stroke", colorM)
                .attr("d", line)

            var pathMLength = pathM.node().getTotalLength();

            pathM.attr('stroke-dasharray', `${pathMLength} ${pathMLength}`)
                .attr('stroke-dashoffset', pathMLength)
                .transition().ease(animationEase).duration(animationTime).attr('stroke-dashoffset', 2 * pathMLength)

            var pathW = chartGroup.append("path")
                .data([rows_women])
                .attr("class", "line")
                .style("stroke", colorW)
                .attr("d", line)

            var pathWLength = pathW.node().getTotalLength();

            pathW.attr('stroke-dasharray', `${pathWLength} ${pathWLength}`)
                .attr('stroke-dashoffset', pathWLength)
                .transition().ease(animationEase).duration(animationTime).attr('stroke-dashoffset', 2 * pathWLength)

        }


    })