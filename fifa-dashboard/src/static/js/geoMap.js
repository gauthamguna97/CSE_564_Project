// create geoMap svg
  var geo_svg = d3
    .select("#geoMap")
    .append("svg")
    .attr("id", "tempgeo");

  // initial variables
  let width = geo_svg.node().getBoundingClientRect().width;
  let height = geo_svg.node().getBoundingClientRect().height;
  var freq = {};
  var list = [];
  var selectList = [];

// Map and projection
  var path = d3.geoPath();
  var projection = d3
    .geoMercator()
    .scale(65)
    .center([0, 10])
    .translate([width / 2, height / 2 + 30]);

// Data and color scale
  var data = d3.map();



var geoData = JSON.parse(document.getElementById("worldData").innerHTML);


function GeoMap(frequency, tdata) {
  d3.selectAll("#scalegeo").remove();

  freq = frequency;
  var max = d3.max(Object.values(frequency))
  // var newColorScale = d3.scaleLinear().domain([0, 600]).range(["white", "red"]);
  var list = [0, max/100, max/40, max/20, max/10, max/5, max/4, max/2]

  var colorScale = d3
  .scaleThreshold()
  .domain([0, max/100, max/40, max/20, max/10, max/5, max/4, max/2])
  .range(d3.schemeYlGnBu[9]);

  list.push(max)

  var linear = d3.scaleQuantile()
  .domain(list)
  .range(d3.schemeYlGnBu[9]);

  var svg1 = d3.select("#geoMap").append("svg").attr("id", 'scalegeo');

  svg1.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(20,20)");

  var legendLinear = d3.legendColor()
  .shapeWidth(50)
  .cells(list)
  .orient('horizontal')
  .scale(linear)
  .labelFormat(d3.format(".0f"));

  svg1.select(".legendLinear")
    .call(legendLinear);

  let handleclick = (d) => {
    console.log(d.properties.name);
    list.push(d.properties.name);
    // var ndata = tdata.filter(s => list.includes(s.nationality_name))
    fetch("/fetchdata", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nationality: JSON.stringify(list) }),
    })
      .then((data) => data.json())
      .then((response) => {
        console.log(response);
        var data = JSON.parse(response.data);
        plotSunBurst(response.sunburst, data);
        BarChart(data, []);
        PcpChart(response.pcpdata,d3.keys(response.pcpdata[0]))
      });
    // BarChart(tdata, ndata);
    // console.log(tdata, ndata)

    d3.selectAll(".Country")
      .filter((d) => list.includes(d.properties.name))
      .transition()
      .duration(200)
      .style("opacity", 0.8);

    d3.selectAll(".Country")
      .filter((d) => !list.includes(d.properties.name))
      .transition()
      .duration(200)
      .style("opacity", 0.4);
    // d3.select(this)
    // .transition()
    // .duration(200)
    // .style("stroke", "transparent")
  };

  d3.select("#tempgeo").html("");

  // Draw the map
  var zoomG = geo_svg.append("g");
  // Draw the map
  zoomG
    .selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath().projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      console.log(d);
      var value = frequency[d.properties.name];
      return colorScale(value || 0);
    })
    .style("stroke", "white")
    .attr("class", function (d) {
      return "Country";
    })
    .style("opacity", 0.8)
    // .on("mouseover", mouseOver )
    .on("click", handleclick);
  // .on("mouseleave", mouseLeave )
  const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

  geo_svg.call(zoom);

  function zoomed() {
    zoomG
      .selectAll("path") // To prevent stroke width from scaling
      .attr("transform", d3.event.transform);
  }
}

// Geo()

let mouseOver = function (d, frequency) {
  // console.log(d.properties.name)
  // console.log(frequency[d.properties.name])


d3.selectAll(".Country")
    .filter((d) => !selectList.includes(d.name))
    .transition()
    .duration(200)
    .style("opacity", 0.5);
  d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "white");
};

let mouseLeave = function (d) {
  d3.selectAll(".Country").transition().duration(200).style("opacity", 0.8);
  d3.select(this).transition().duration(200).style("stroke", "transparent");
};
