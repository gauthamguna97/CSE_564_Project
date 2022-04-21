const BarChart = () => {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 40, left: 200},
    width = 600 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;


    // append the svg object to the body of the page
    var svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("/static/data/fifa.csv", function(totaldata) {

        var map = new Map();

        var value = 'league_name_'

        totaldata.map((node) => {
            map.set(node[value], (map.get(node[value]) || 0) + 1);
        });

        console.log(map);

        var data = Array.from(map, ([name, value]) => ({ name, value }));

        console.log(data);


        // Add X axis
        let x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.value; })])
        .range([ 0, width]);

        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

        // Y axis
        var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(function(d) { return d.name; }))
        .padding(.1);
        svg.append("g")
        .call(d3.axisLeft(y))

        //Bars
        svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", () => {console.log(x(0)); return x(0)})
        .attr("y", function(d) { return y(d.name); })
        .attr("width", function(d) { console.log(d.value); return x(d.value); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#69b3a2")


        // .attr("x", function(d) { return x(d.Country); })
        // .attr("y", function(d) { return y(d.Value); })
        // .attr("width", x.bandwidth())
        // .attr("height", function(d) { return height - y(d.Value); })
        // .attr("fill", "#69b3a2")
    })
}
BarChart()