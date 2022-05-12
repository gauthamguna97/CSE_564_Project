var x, y;
var selectList = [];
var otherlist = [];

var bar_tooltip = d3
  .select("#geoMap")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("color", "black")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

const sFeature = (d) => {

    const index = selectList.indexOf(d.name);

    if (d.name == "Other_leagues") {
        var contains = false;
        otherlist.forEach(d => {
            if (selectList.indexOf(d) > -1) {
                selectList.splice(selectList.indexOf(d), 1)
                contains = true;
            }
        })

        if (!contains) {
            selectList = [...selectList, ...otherlist]
        }
    } else {
        if (index > -1) {
            selectList.splice(index, 1);
        } else {
            selectList.push(d.name);
        }
    }

    var sdata = {};
    if (selectList.length == 0) {
        sdata = {};
    } else {
        globalfilter.value = JSON.stringify(selectList);
    }

    d3.selectAll('.barrect').filter(d => selectList.indexOf(d.name) > -1).attr('fill', 'red').style('opacity', 1)
    d3.selectAll('.barrect').filter(d => !selectList.indexOf(d.name) > -1).attr("fill", "#284b63").style('opacity', 0.5)


  fetch("/fetchdata", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(globalfilter),
  })
    .then((data) => data.json())
    .then((response) => {
      // plot_table(response.data)
      console.log(response);
      // plot_scatter(attributes);
      var data = JSON.parse(response.data);
      GeoMap(response.geoData, data);
      plotSunBurst(response.sunburst, data);
      // var ndata = data.filter(s => s.nationality_name == "Brazil")
      // BarChart(data, [])
      PcpChart(response.pcpdata, d3.keys(response.pcpdata[0]));
      wordCloud(response.wordcloud);
    });
};

const BarChart = (totaldata, filterdata = []) => {
  d3.selectAll("#svgbar").remove();
  bar_tooltip.style("opacity", 0)

  console.log(totaldata, filterdata);

  var wrapper = d3.select("#barchart");
  let Twidth = wrapper.node().getBoundingClientRect().width - 50;
  let Theight = wrapper.node().getBoundingClientRect().height - 100;

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 0, bottom: 0, left: 150 },
    width = Twidth - margin.left - margin.right,
    height = Theight - margin.top - margin.bottom;


    // append the svg object to the body of the page

    var svg = d3.select("#svgbar");

    // var skipsetting = true;
    console.log('svg', svg)
    // if (svg.empty()) {
        svg = d3.select("#barchart")
        .append("svg")
        .attr("id", "svgbar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        // skipsetting = false;
    // }

    // Parse the Data not required
    // d3.csv("/static/data/fifa.csv", function(totaldata) {

        var map = new Map();
        var value = 'final_league'
        totaldata.map((node) => {
            map.set(node[value], (map.get(node[value]) || 0) + 1);
        });
        console.log(map);
        var data = Array.from(map, ([name, value]) => ({ name, value }));
        data.sort((a, b) => b.value - a.value)
        var othercount = 0;
        for (let i=28; i<data.length; i++) {
            otherlist.push(data[i].name);
            othercount += data[i].value;
        }
        data.length = 28;
        data.push({
            'name': 'Other_leagues',
            'value': othercount
        });
        data.sort((a, b) => b.value - a.value)
        console.log(data.length);


        var map2 = new Map();
        filterdata.map(node => {
            map2.set(node[value], (map2.get(node[value]) || 0) + 1);
        })

        var sum = 0;
        otherlist.forEach(v => {
            sum += map2.get(v)
        })
        map2.set("Other_leagues", sum)

        console.log(map)
        console.log(map2)


        // if (!skipsetting) {
            // Add X axis
            x = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.value; })])
            .range([ 0, width]);

            svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .attr("fill", "white");

            // Y axis
            y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.name; }))
            .padding(.1);
            svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("fill", "white");
        // }


        // if (!skipsetting)
        //Bars
        svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", 'barrect')
        .attr("x", () => {console.log(x(0)); return x(0)})
        .attr("y", function(d) { console.log(y(d.name)); return y(d.name); })
        .attr("width", function(d) { console.log(d.value); return x(d.value); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#8da7be")
        .attr("opacity", filterdata.length > 0 ? 0.5 : 1)
        .on("click", (d) => {
            console.log(d)
            sFeature(d)
        }).on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("mousemove", mouseOver);

      // rgb(166, 189, 219)

      function mouseOver(d) {
        bar_tooltip
                .style("opacity", 1)
                .style("top", (event.pageY)+"px")
                .style("left",(event.pageX)+"px")
                .style("color", "black")
                .html(d.name + " : " + d.value);
      };

      function mouseLeave(d) {
        bar_tooltip.style("opacity", 0);
      };

        // rgb(166, 189, 219)

        if (filterdata.length > 0) {
            svg.selectAll("myRect2")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", () => {console.log(x(0)); return x(0)})
            .attr("y", function(d) { console.log(y(d.name)); return y(d.name); })
            .attr("width", function(d) { console.log(map2.get(d.name), d.name); return x(map2.get(d.name) || 0); })
            .attr("height", y.bandwidth() )
            .attr("fill", "rgb(74, 111, 165)")
        }
}
// BarChart()
