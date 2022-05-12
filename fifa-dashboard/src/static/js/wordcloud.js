var slist = [];
const selectData = (list) => {
  
if (list.length == 0) {
  delete globalfilter['wfilter']
} else {
  globalfilter.wfilter = JSON.stringify(list)
}
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
    // wordCloud(response.wordcloud);
  });
};
function wordCloud(data) {
  // List of words
  var myWords = data
  d3.selectAll("#wordcloudplot").remove()

  var min = d3.min(myWords.map( (d) => d.count));
  var max = d3.max(myWords.map( (d) => d.count));

  console.log(myWords)

  myWords.length = Math.min(100, myWords.length)

  for (var i = 0; i < myWords.length; i++) {
    if (max != min)
      myWords[i].count = Math.pow(((myWords[i].count - min) / (max - min)) , 2) * 30;
    else
      myWords[i].count = 1 * 20;
    //Do something
  }

  console.log(myWords)


  // var fontSizeScale = d3.scalePow().exponent(5).domain([0,1]).range([myWords[0].count, myWords[myWords.length-1].count]);

  // console.log(fontSizeScale(50))

  // var maxSize = d3.max(myWords, function (d) {return d.size;});

  // set the dimensions and margins of the graph
    // var color = {
    //   0 : "#26a96c", /* Defence*/
    //   1 : "#e83f6f", /* Attacker*/
    //   2 : "#4d9de0", /* Mid*/
    //   3 : "#ffbf00", /* Goal*/
    // }

  // var color = {
  //   0 : "#27d7c4", /* Defence */
  //   1 : "#f65f18", /* Attacker */
  //   2 : "#4a58dd", /* Mid Fielder */
  //   3 : "#dedd32" /* Goal Keeper */
  // }

  var color = {
    0 : "#5fad56", /* Defence */
    1 : "#F97068", /* Attacker */
    2 : "#66C4CF", /* Mid Fielder */
    3 : "#F2C14E" /* Goal Keeper */
  }

  // var color = d3.scaleOrdinal([
  //   "#ffd166"/* Attacker*/,
  //   "#06d6a0",/* Goal*/
  //   '#ef476f',/* Mid*/
  //   '#219ebc', /* Defence*/
  // ]);

  var wordcloud_tooltip = d3.select("#geoMap")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("color", "black")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  var wordcloud = d3.select('#wordcloud')
  let width = wordcloud.node().getBoundingClientRect().width;
  let height = wordcloud.node().getBoundingClientRect().height - 40;

  var margin = { top: 10, right: 10, bottom: 10, left: 10 };

  // append the svg object to the body of the page
  var word_svg = d3
    .select("#wordcloud")
    .append("svg")
    .attr("id", "wordcloudplot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + -margin.left + "," + margin.top + ")");

  // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
  // Wordcloud features that are different from one word to the other must be here
  var layout = d3.layout
    .cloud()
    .size([width, height])
    .words(
      myWords.map(function (d) {
        return { text: d.name, size: d.count, pos: d.pos };
      })
    )
    .padding(5) //space between words
    .rotate(function () {
      return ~~(Math.random() * 2) * 90;
    })
    .fontSize(function (d) {
      // return fontSizeScale(d.size/maxSize);
      return d.size+"";
    }) // font size of words
    .on("end", draw);
  layout.start();

  // This function takes the output of 'layout' above and draw the words
  // Wordcloud features that are THE SAME from one word to the other can be here
  function draw(words) {
    wordcloud_tooltip.style("opacity", 0);

    var mydict = word_svg
      .append("g")
      .attr(
        "transform",
        "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .attr("class", "wtext")
      .attr("font-size", "0px")
      // .transition()
      // .duration(1000)
      .attr("font-size", function (d) {
        return d.size+"";
      })
      .style("fill", function (d) {
        return color[d.pos];
      })
      .attr("text-anchor", "middle")
      .style("font-family", "Impact")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function (d) {
        return d.text;
      })


      mydict
      .on("click", handleClick)
      // .on("mouseover", mouseOver)
      // .on("mouseleave", mouseLeave)
      // .on("mousemove", mouseOver);
  }

  function handleClick(d) {
    if (slist.indexOf(d.text) > -1) {
      slist.splice(slist.indexOf(d.text), 1);
    } else {
      slist.push(d.text);
    }
    d3.selectAll(".wtext").style("opacity", 0.2)

    if (slist.length != 0) {
      d3.selectAll(".wtext").filter(c => slist.indexOf(c.text) > -1).style("opacity", 1)
      selectData(slist)
    } else {
      d3.selectAll(".wtext").style("opacity", 1)
      selectData(slist)

    }
    
  }

  // function mouseOver(d) {
  //   wordcloud_tooltip
  //           .style("opacity", 1)
  //           .style("top", (event.pageY)+"px")
  //           .style("left",(event.pageX)+"px")
  //           .style("color", "black")
  //           .html("<p>" + d.text + "</p>");
  // };

  // function mouseLeave(d) {
  //   wordcloud_tooltip.style("opacity", 0);
  // };
}
