// SunBurst();

let currentDepth = 0;

// function SunBurst() {
var url = "http://127.0.0.1:5005";
//   fetch(url + "/sunburst")
//     .then((res) => res.json())
//     .then((response) => {
//       plotSunBurst(response);
//     });
// }

function plotSunBurst(root) {
  d3.selectAll("#sunburstplot").remove();

  var wrapper = d3.select("#sunburst")
  let width = wrapper.node().getBoundingClientRect().width - 50;
  let height = wrapper.node().getBoundingClientRect().height - 50;
  let numClicks = 0;
  const handleClick = (d) => {
    // numClicks++;

    // if (numClicks === 1) {
    //   if (d.depth < currentDepth) {
    //     focusOn(d);
    //   }
    //   singleClickTimer = setTimeout(() => {
    //     numClicks = 0;
    //   }, 400);
    // } else if (numClicks === 2) {
    //   clearTimeout(singleClickTimer);
    //   numClicks = 0;
    //   focusOn(d);
    // }
    // d3.event.stopPropagation();

    // d3.selectAll("path.main-arc").on("mouseleave", null);
    // d3.selectAll("path.main-arc").on("mouseover", null);

    var sequenceArray = getAncestors(d);

    console.log(d.data.name);

    var percentage = d.value;
    var percentageString = percentage;
    if (percentage < 0.1) {
      percentageString = "< 0.1%";
    }

    d3.select("#percentage").text(percentageString);

    d3.select("#explanation").style("visibility", "");

    // Fade all the segments.
    d3.selectAll("path.main-arc").style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    svg
      .selectAll("path.main-arc")
      .filter(function (node) {
        return sequenceArray.indexOf(node) >= 0;
      })
      .style("opacity", 1);

    fetch(url + "/fetchdata", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pos: d.data.name + "" }),
    })
      .then((data) => data.json())
      .then((response) => {
        console.log(response);
        // plot_table(response.data)
        // var attributes = response.data.map(d => d["Attributes"]);
        // plot_scatter(attributes);
        var data = JSON.parse(response.data);
        GeoMap(response.geoData, data);
        // plotSunBurst(response.sunburst, data)
        // var ndata = data.filter(s => s.nationality_name == "Brazil")
        BarChart(data, []);
        PcpChart(response.pcpdata,d3.keys(response.pcpdata[0]))
        wordCloud(response.wordcloud);
        // GeoMap(response.geoData)
      });
  };

  // const width = 400,
  //   height = 400,
    maxRadius = Math.min(width, height) / 2 - 5;

  const totalSize = 0;

  const formatNumber = d3.format(",d");

  const x = d3
    .scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

  const y = d3.scaleLinear().range([maxRadius * 0.4, maxRadius]);

  // const color = d3.scaleOrdinal(["#23DECA", '#5DA8FF', "#FBDA67", 'ef476f']);
  const color = d3.scaleOrdinal(["#219ebc", '#ef476f', "#ffd166", '#06d6a0']);

  // var color = d3.scaleOrdinal(d3.schemeCategory10);
  const partition = d3.partition();

  const arc = d3
    .arc()
    .startAngle((d) => x(d.x0))
    .endAngle((d) => x(d.x1))
    .innerRadius((d) => Math.max(0, y(d.y0)))
    .outerRadius((d) => Math.max(0, y(d.y1)));

  const middleArcLine = (d) => {
    const halfPi = Math.PI / 2;
    const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) {
      angles.reverse();
    }

    const path = d3.path();
    path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return path.toString();
  };

  const textFits = (d) => {
    const CHAR_SPACE = 6;

    const deltaAngle = x(d.x1) - x(d.x0);
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    return d.data.name.length * CHAR_SPACE < perimeter;
  };

  const svg = d3
    .select("#sunburst")
    .append("svg")
    .attr("id", "sunburstplot")
    .style("width", width)
    .style("height", height)
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    // .on("click", () => focusOn()); // Reset zoom on canvas click
    .on("click", () => focusOn()); // Reset zoom on canvas click

  root = d3.hierarchy(root);
  root.sum((d) => d.count);

  const slice = svg.selectAll("g.slice").data(partition(root).descendants());

  // svg.append("svg:circle")
  //     .attr("r", radius)
  //     .style("opacity", 0);

  slice.exit().remove();

  const newSlice = slice
    .enter()
    .append("g")
    .attr("class", "slice")
    .on("click", (d) => handleClick(d));
  // .on("mouseover", (d) => mouseover(d))
  // .on("mouseleave", (d) => mouseleave(d))

  newSlice
    .append("title")
    .text((d) => d.data.name + "\n" + formatNumber(d.value));

  newSlice
    .append("path")
    .attr("class", "main-arc")
    .style("fill", (d) => d.data.name === "Players" ? '#284b63' : color((d.children ? d : d.parent).data.name))
    .attr("d", arc);

  newSlice
    .append("path")
    .attr("class", "hidden-arc")
    .attr("id", (_, i) => `hiddenArc${i}`)
    .attr("d", middleArcLine);

  const text = newSlice
    .append("text")
    .attr("display", (d) => (textFits(d) ? null : "none"));

  // Add white contour
  // text
  //   .append("textPath")
  //   .attr("startOffset", "50%")
  //   .attr("xlink:href", (_, i) => `#hiddenArc${i}`)
  //   .text((d) => d.data.name)
  //   // .style("fill", "none")
  //   // .style("stroke", "grey")
  //   // .style("stroke-width", 1)
  //   .style("stroke-linejoin", "round");

  text
    .append("textPath")
    .attr("startOffset", "50%")
    .attr("xlink:href", (_, i) => `#hiddenArc${i}`)
    .attr("font-size", "12px")
    .text((d) => d.data.name)
    .style("fill", d => d.data.name === "Players" ? "white" : "");

  function mouseover(d) {
    var sequenceArray = getAncestors(d);

    var percentage = d.value;
    var percentageString = percentage;
    if (percentage < 0.1) {
      percentageString = "< 0.1%";
    }

    d3.select("#percentage").text(percentageString);

    d3.select("#explanation").style("visibility", "");

    // Fade all the segments.
    d3.selectAll("path.main-arc").style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    svg
      .selectAll("path.main-arc")
      .filter(function (node) {
        return sequenceArray.indexOf(node) >= 0;
      })
      .style("opacity", 1);
  }

  function getAncestors(node) {
    var path = [];
    var current = node;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

  function mouseleave(d) {
    // Deactivate all segments during transition.
    d3.selectAll("path.main-arc").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path.main-arc").style("opacity", 1);
    // .each("end", function() {
    //         d3.select(this).on("mouseover", mouseover);
    //       });

    d3.select("#explanation").style("visibility", "hidden");
  }

  function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
    console.log(d);
    // Fade all the segments.
    // d3.selectAll("path.main-arc").style("opacity", 1);
    // Reset to top-level if no data point specified
    // const transition = svg
    //   .transition()
    //   .duration(750)
    //   .tween("scale", () => {
    //     // const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
    //     //   yd = d3.interpolate(y.domain(), [d.y0, 1]);
    //     return (t) => {
    //       x.domain(xd(t));
    //       y.domain(yd(t));
    //     };
    //   });

    // transition.selectAll("path.main-arc").attrTween("d", (d) => () => arc(d));

    // transition
    //   .selectAll("path.hidden-arc")
    //   .attrTween("d", (d) => () => middleArcLine(d));

    // transition
    //   .selectAll("text")
    //   .attrTween("display", (d) => () => textFits(d) ? null : "none");

    // moveStackToFront(d);

    // currentDepth = d.depth;

    // function moveStackToFront(elD) {
    //   svg
    //     .selectAll(".slice")
    //     .filter((d) => d === elD)
    //     .each(function (d) {
    //       this.parentNode.appendChild(this);
    //       if (d.parent) {
    //         moveStackToFront(d.parent);
    //       }
    //     });
    // }
  }
}
