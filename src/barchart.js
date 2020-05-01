function removeDuplicates(names){
    return names.reduce((acc,curr)=> acc.includes(curr) ? acc: [...acc,curr], []);
}
function updateGraph(data){             
     //set domain for the x axis
    xChart.domain(data.map(function(d){ return formatTime(d.Jahr)}) );
    //set domain for y axis
    yChart.domain([0, d3.max(data, d => parseInt(d.FHNW))] );

    //get the width of each bar 
    var barWidth = (width / data.length);

    //select all bars on the graph, take them out, and exit the previous data set. 
    //then you can add/enter the new data set
    var bars = chartGroup.selectAll(".bar")
                    .remove()
                    .exit()
                    .data(data)		
    //now actually give each rectangle the corresponding data
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i){ return i * barWidth + 5 })
        .attr("y", function(d){ return yChart( d.FHNW); })
        .attr("height", function(d){ return height - yChart(d.FHNW); })
        .attr("width", barWidth -5)
        .attr("fill", function(d){ 
            if(d.Geschlecht === "Frau"){
                return "rgb(251,180,174)";
            }else{
                return "rgb(179,205,227)";
            }
        });
        //left axis
        chartGroup.select('.y')
            .call(yAxis)
        //bottom axis
        chartGroup.select('.xAxis')
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d){
                    return "rotate(-65)";
                });
}
d3.csv("../data/studis.csv", function (error, data2) {
    const major = removeDuplicates(data2.map(d => d.Fachbereich));
    
    data2.forEach(d => d.Jahr = parseDate(d.Jahr.split("/")[0]));

    var orgData = d3.nest()
                    .key(function(d){return d.Fachbereich})
                    .key(function(d){return d.Geschlecht})
                    .entries(data2);
    // Add Dropdown
    var dropdown = d3.select("#container-menu-1")
            .append("select")
            .attr("id", "dropdown-major")
            .on("change", change)
            .selectAll("option")
            .data(orgData)
            .enter()
            .append("option")
            .attr("value", function(d){
                return d.key;
            })
            .text(function(d){
                return d.key;
            })  
            
    function change(select){
        let major = document.getElementById('dropdown-major').value
       
        var ele = document.getElementsByName('gender')
              
        for(i = 0; i < ele.length; i++) { 
            if(ele[i].checked){
                var gender = ele[i].value; 
            }
        } 
       
        /*Prepare Data*/
        for(let i = 0; i < orgData.length; i++){
            if(orgData[i].key === major){
    
                 /*Gender*/
                if(gender == "Mann"){
                       updateGraph(orgData[i].values[0].values);
                       console.log(gender)
                 }else if(gender == "Frau"){
                     updateGraph(orgData[i].values[1].values);
                        console.log(gender)
                  }else{
                       var bothData = [];
    
                       for(let j = 0; j < orgData[i].values[0].values.length; j++){
                           bothData.push(orgData[i].values[0].values[j])
                           bothData.push(orgData[i].values[1].values[j])
                       }
    
                    updateGraph(bothData);
                    
                  }
               }
        }
    }
    //add radio onclick buttons
    var radios = d3.select("#gender")
    radios.on("click", change)
}); //end d3.csv

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
var formatTime = d3.timeFormat("%Y");


//set up chart
var svg = d3.select("#page-3").append("svg").attr("class", "svg").attr("height", "100vh").attr("width", "100vw");
var chartGroup = svg.append("g").attr("class", "chartGroup").attr("transform", "translate(" + xOffset + "," + yOffset + ")");

var xChart = d3.scaleBand()
            .range([0, width]);
				
var yChart = d3.scaleLinear()
            .range([height, 0]);

var xAxis = d3.axisBottom(xChart);
var yAxis = d3.axisLeft(yChart);

//left axis
chartGroup.append("g")
		    .attr("class", "y axis")
	        .call(yAxis)
		  
//bottom axis
chartGroup.append("g")
		    .attr("class", "xAxis")
		    .attr("transform", "translate(0," + height + ")")
		    .call(xAxis)
		    .selectAll("text")
			    .style("text-anchor", "end")
			    .attr("dx", "-.8em")
			    .attr("dy", ".15em")
			    .attr("transform", function(d){
				    return "rotate(-65)";
			    });

//add labels
chartGroup.append("text")
            .attr("transform", "translate(-35," +  (height+margin.bottom)/2 + ") rotate(-90)")
	        .text("Anzahl Studenten");
		
chartGroup.append("text")
	        .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom - 5) + ")")
            .text("Jahre");