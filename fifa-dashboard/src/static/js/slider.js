time_slider(2015, 2022, 2016, 2019);

function time_slider(min, max, starting_min = min, starting_max = max) {
  console.log(min);
  console.log(max);
  console.log(starting_min);
  console.log(starting_max);

  var range = [min, max + 1];
  var starting_range = [starting_min, starting_max + 1];

  console.log(range);
  console.log(starting_max);
  // set width and height of svg
  var w = 250;
  var h = 50;
  var margin = 8;

  // dimensions of slider bar
  var width = w - margin - margin;
  var height = h - margin - margin;

  // create x scale
  var x = d3
    .scaleLinear()
    .domain(range) // data space
    .range([0, width]); // display space

  console.log("slider");
  // create svg and translated g
  var svg_slider = d3.select("#slider").append("svg");
  const g = svg_slider
    .append("g")
    // .attr("transform", `translate(${margin.left}, ${margin.top})`);
    .attr("transform", `translate(20, 20)`);

  // draw background lines
  g.append("g")
    .selectAll("line")
    .data(d3.range(range[0], range[1] + 1))
    .enter()
    .append("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "#ccc");

  // labels
  var labelL = g
    .append("text")
    .attr("id", "labelleft")
    .attr("x", 0)
    .attr("y", height + 5)
    .text(range[0]);

  var labelR = g
    .append("text")
    .attr("id", "labelright")
    .attr("x", 0)
    .attr("y", height + 5)
    .text(range[1]);

  // define brush
  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("brush", function () {
      var s = d3.event.selection;
      // update and move labels
      labelL.attr("x", s[0]).text(Math.round(x.invert(s[0])));
      labelR.attr("x", s[1]).text(Math.round(x.invert(s[1])) - 1);
      // move brush handles
      handle.attr("display", null).attr("transform", function (d, i) {
        return "translate(" + [s[i], -height / 4] + ")";
      });
      // update view
      // if the view should only be updated after brushing is over,
      // move these two lines into the on('end') part below
      svg_slider.node().value = s.map((d) => Math.round(x.invert(d)));
      svg_slider.node().dispatchEvent(new CustomEvent("input"));
    })
    .on("end", function () {
      if (!d3.event.sourceEvent) return;
      var d0 = d3.event.selection.map(x.invert);
      var d1 = d0.map(Math.round);
      d3.select(this).transition().call(d3.event.target.move, d1.map(x));
    });

  // append brush to g
  var gBrush = g.append("g").attr("class", "brush").call(brush);

  // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
  var brushResizePath = function (d) {
    var e = +(d.type == "e"),
      x = e ? 1 : -1,
      y = height / 2;
    return (
      "M" +
      0.5 * x +
      "," +
      y +
      "A6,6 0 0 " +
      e +
      " " +
      6.5 * x +
      "," +
      (y + 6) +
      "V" +
      (2 * y - 6) +
      "A6,6 0 0 " +
      e +
      " " +
      0.5 * x +
      "," +
      2 * y +
      "Z" +
      "M" +
      2.5 * x +
      "," +
      (y + 8) +
      "V" +
      (2 * y - 8) +
      "M" +
      4.5 * x +
      "," +
      (y + 8) +
      "V" +
      (2 * y - 8)
    );
  };

  var handle = gBrush
    .selectAll(".handle--custom")
    .data([{ type: "w" }, { type: "e" }])
    .enter()
    .append("path")
    .attr("class", "handle--custom")
    .attr("stroke", "#000")
    .attr("fill", "#eee")
    .attr("cursor", "ew-resize")
    .attr("d", brushResizePath);

  // override default behaviour - clicking outside of the selected area
  // will select a small piece there rather than deselecting everything
  // https://bl.ocks.org/mbostock/6498000
  gBrush
    .selectAll(".overlay")
    .each(function (d) {
      d.type = "selection";
    })
    .on("mousedown touchstart", brushcentered);

  function brushcentered() {
    var dx = x(1) - x(0), // Use a fixed width when recentering.
      cx = d3.mouse(this)[0],
      x0 = cx - dx / 2,
      x1 = cx + dx / 2;
    d3.select(this.parentNode).call(
      brush.move,
      x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]
    );
  }

  // select entire starting range
  gBrush.call(brush.move, starting_range.map(x));

  // return svg_slider.node();
}
