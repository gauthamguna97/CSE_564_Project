// The svg
var svg = d3.select("#geoMap")
            .append("svg")
            .attr("width", 700)
            .attr("height", 700),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([200, 400, 600, 800])
  .range(d3.schemeBlues[5]);

// Load external data and boot
// d3.queue()
//   .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
//   .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
//   .await(GeoMap);

function Geo() {
    const url = "http://127.0.0.1:5005";
    fetch(url + "/geo_json")
      .then((res) => res.json())
      .then((response) => {
        GeoMap(response);
      });
}


function GeoMap(frequency) {

    console.log(frequency)

    var geoData = JSON.parse(document.getElementById('worldData').innerHTML);

    console.log(geoData)


    let mouseOver = function(d) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
    }

    let mouseLeave = function(d) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
    }

    // Draw the map
    svg.append("g")
    .selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
        // draw each country
        .attr("d", d3.geoPath()
        .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
        d.total = frequency[d.properties.name] || 0;
        console.log(d.properties)
        return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
}

Geo()