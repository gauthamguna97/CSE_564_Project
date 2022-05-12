function wordCloud(data) {
  // List of words
  var myWords = data.slice(0, 100);
  d3.selectAll("#wordcloudplot").remove()

  for (var i = 0; i < myWords.length; i++) {
    myWords[i].count = (myWords.length - i) * 0.5;
    //Do something
  }

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
      return d.size+"";
    }) // font size of words
    .on("end", draw);
  layout.start();

  // This function takes the output of 'layout' above and draw the words
  // Wordcloud features that are THE SAME from one word to the other can be here
  function draw(words) {
    word_svg
      .append("g")
      .attr(
        "transform",
        "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .attr("font-size", function (d) {
        return d.size;
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
      .on("click", handleClick);
  }

  function handleClick(d) {
    console.log(d)
  }
}
