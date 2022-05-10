// The svg
var geo_svg = d3.select("#geoMap")
            .append("svg")
            .attr("width", 500)
            .attr("height", 500)
  width = +geo_svg.attr("width"),
  height = +geo_svg.attr("height");

var freq = {}

var list = [];

var selectList = [];

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();

var newColorScale =  d3.scaleLinear().domain([0, 600])
                        .range(["white", "red"])

var colorScale = d3.scaleThreshold()
  .domain([10, 20, 50, 100, 200, 300, 400, 500])
  .range(d3.schemeYlOrRd[9]);

// function Geo() {
//     const url = "http://127.0.0.1:5005";
//     fetch(url + "/geo_json")
//       .then((res) => res.json())
//       .then((response) => {
//         GeoMap(response);
//       });
// }


function GeoMap(frequency, tdata) {

    freq = frequency

    // console.log(frequency)

    var geoData = JSON.parse(document.getElementById('worldData').innerHTML);

    // console.log(geoData)


    let mouseOver = function(d, frequency) {
        // console.log(d.properties.name)
        // console.log(frequency[d.properties.name])
    d3.selectAll(".Country")
        .filter(d => !selectList.includes(d.name))
        .transition()
        .duration(200)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "white")
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

    let handleclick = (d) => {
      console.log(d.properties.name);
      list.push(d.properties.name);
      var ndata = tdata.filter(s => list.includes(s.nationality_name))
      BarChart(tdata, ndata);
      console.log(tdata, ndata)
    }

    // Draw the map
    var zoomG = geo_svg.append("g");
    // Draw the map
    zoomG.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
        // draw each country
        .attr("d", d3.geoPath()
          .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
          console.log(d)
          var value = frequency[d.properties.name]
          return colorScale(value || 0);
        })
        .style("stroke", "white")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("click", handleclick )
        // .on("mouseleave", mouseLeave )
  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);

    geo_svg.call(zoom);

    function zoomed() {
      zoomG.selectAll('path') // To prevent stroke width from scaling
        .attr('transform', d3.event.transform);
    }
}

// Geo()