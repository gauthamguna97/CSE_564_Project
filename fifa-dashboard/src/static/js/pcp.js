PcpData()

function PcpData() {
  var url = "http://127.0.0.1:5005";
  fetch(url + "/pcpdata", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    //   body: JSON.stringify({ value: attrs.toString() }),
  })
    .then((res) => res.json())
    .then((response) => {
//       attrs = [];
//       console.log(response.json());
      PcpChart(response.data);
    });
}

function PcpChart(dataPcp) {
  d3.select("#pcp").html("");
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var margin = { top: 50, right: 40, bottom: 10, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var x = d3.scalePoint().range([0, width], 1),
    y = {},
    dragging = {};

  var line = d3.line();

  var axis = d3.axisLeft();

  var svg_pcp = d3
    .select("#pcp")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Highlight the specie that is hovered
  var highlight = function (d) {
    // first every group turns grey
    d3.selectAll(".line")
      .transition()
      .duration(200)
      .style("stroke", "lightgrey");
    // .style("opacity", "0.2")

    // Second the hovered specie takes its color
    d3.selectAll(".l" + d.clusters)
      .transition()
      .duration(200)
      .style("stroke", color(d.clusters))
      .style("opacity", "1")
      .style("stroke-width", "2px");
  };

  // Unhighlight
  var doNotHighlight = function (d) {
    d3.selectAll(".line")
      .transition()
      .duration(200)
      .style("stroke", function (d) {
        return color(d.clusters);
      })
      .style("stoke-width", "0.5px")
      .style("opacity", 1);
  };

  // Extract the list of dimensions and create a scale for each.
  x.domain(
    (dimensions = d3.keys(dataPcp[0]).filter(function (d) {
//       if (categorical.includes(d)) {
//         return (y[d] = d3
//           .scalePoint()
//           .domain(
//             dataPcp.map(function (p) {
//               return p[d];
//             })
//           )
//           .range([height, 0]));
//       } else {
        return (
          d != "pos_type" &&
          (y[d] = d3
            .scaleLinear()
            .domain(
              d3.extent(dataPcp, function (p) {
                return +p[d];
              })
            )
            .range([height, 0]))
        );
//       }
    }))
  );

  // Add grey background lines for context.
  var bg = svg_pcp
    .append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(dataPcp)
    .enter()
    .append("path")
    .attr("d", path);
  // .attr("class", function (d) {
  //   return "line " + "l" + d.clusters;
  // })
  // .on("mouseover", highlight)
  // .on("mouseout", doNotHighlight)

  // Add blue foreground lines for focus.
  var fg = svg_pcp
    .append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(dataPcp)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("style", function (d) {
      return "stroke:" + color(d.pos_type) + ";";
    });
  //   .attr("class", function (d) {
  //     return "line " + "l" + d.clusters;
  //   })
  // .on("mouseover", highlight)
  // .on("mouseout", doNotHighlight)

  // Add a group element for each dimension.
  var group = svg_pcp
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", function (d) {
      return "translate(" + x(d) + ")";
    })
    .call(
      d3
        .drag()
        .subject(function (d) {
          return { x: x(d) };
        })
        .on("start", function (d) {
          dragging[d] = x(d);
          bg.attr("visibility", "hidden");
        })
        .on("drag", function (d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          fg.attr("d", path);
          dimensions.sort(function (a, b) {
            return position(a) - position(b);
          });
          x.domain(dimensions);
          group.attr("transform", function (d) {
            return "translate(" + position(d) + ")";
          });
        })
        .on("end", function (d) {
          delete dragging[d];
          transition(d3.select(this)).attr(
            "transform",
            "translate(" + x(d) + ")"
          );
          transition(fg).attr("d", path);
          bg.attr("d", path)
            .transition()
            .delay(500)
            .duration(0)
            .attr("visibility", null);
        })
    );

  // Add an axis and title.
  group
    .append("g")
    .attr("class", "axis")
    .each(function (d) {
      d3.select(this).call(axis.scale(y[d]));
    });

  group
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -15)
    .text(function (d) {
      return d;
    });

  // Add and store a brush for each axis.
  group
    .append("g")
    .attr("class", "brush")
    .each(function (d) {
      d3.select(this).call(
        (y[d].brush = d3
          .brushY()
          .extent([
            [-10, 0],
            [10, height],
          ])
          .on("start", brushstart)
          .on("brush", brush)).on("end", brush)
      );
    });

  function brush() {
    var actives = [];
    //filter brushed extents
    svg_pcp
      .selectAll(".brush")
      .filter(function (d) {
        return d3.brushSelection(this);
      })
      .each(function (d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this),
        });
      });

    //set un-brushed foreground line disappear
    fg.classed("fade", function (d, i) {
      return !actives.every(function (active) {
        var dim = active.dimension;
        return (
          active.extent[0] <= y[dim](d[dim]) &&
          y[dim](d[dim]) <= active.extent[1]
        );
      });
    });
  }

  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }

  function transition(g) {
    return g.transition().duration(500);
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(
      dimensions.map(function (p) {
        return [position(p), y[p](d[p])];
      })
    );
  }

  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  function brushEnd() {
    d3.event.sourceEvent.stopPropagation();
  }
}
