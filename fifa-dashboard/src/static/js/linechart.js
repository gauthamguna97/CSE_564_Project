// // set the dimensions and margins of the graph
// var margin = {top: 10, right: 30, bottom: 40, left: 100},
//     width = 460 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// // append the svg object to the body of the page
// var svg = d3.select("#barchart")
//   .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");

// // Parse the Data
// d3.csv("/static/data/fifa.csv", function(totaldata) {

// // sort data
// var map = new Map();

// var value = 'league_name';

// totaldata.map((node) => {
//     map.set(node[value], (map.get(node[value]) || 0) + 1);
// });

// var data = Array.from(map, ([name, value]) => ({ name, value }));

// data.sort(function(b, a) {
//   return a.value - b.value;
// });

// console.log(data)

// data.length = 10

// // Add X axis
// var x = d3.scaleLinear()
//   .domain([0, d3.max(data.map(d => d.value))])
//   .range([ 0, width]);
// svg.append("g")
//   .attr("transform", "translate(0," + height + ")")
//   .call(d3.axisBottom(x))
//   .selectAll("text")
//     .attr("transform", "translate(-10,0)rotate(-45)")
//     .style("text-anchor", "end");

// // Y axis
// var y = d3.scaleBand()
//   .range([ 0, height ])
//   .domain(data.map(function(d) { return d.name; }))
//   .padding(1);
// svg.append("g")
//   .call(d3.axisLeft(y))

// // Lines
// svg.selectAll("myline")
//   .data(data)
//   .enter()
//   .append("line")
//     .attr("x1", x(0))
//     .attr("x2", x(0))
//     .attr("y1", function(d) { return y(d.name); })
//     .attr("y2", function(d) { return y(d.name); })
//     .attr("stroke", "grey")

// // Circles -> start at X=0
// svg.selectAll("mycircle")
//   .data(data)
//   .enter()
//   .append("circle")
//     .attr("cx", x(0) )
//     .attr("cy", function(d) { return y(d.name); })
//     .attr("r", "7")
//     .style("fill", "#69b3a2")
//     .attr("stroke", "black")

// // Change the X coordinates of line and circle
// svg.selectAll("circle")
//   .transition()
//   .duration(2000)
//   .attr("cx", function(d) { return x(d.value); })

// svg.selectAll("line")
//   .transition()
//   .duration(2000)
//   .attr("x1", function(d) { return x(d.value); })

// })