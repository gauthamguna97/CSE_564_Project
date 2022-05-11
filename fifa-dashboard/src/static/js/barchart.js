
var x, y;
var selectList = [];

const sFeature = (d) => {

    const index = selectList.indexOf(d.name)
    if (index > -1) {
        selectList.splice(index, 1);
    } else {
        selectList.push(d.name);
    }
    
    fetch('/fetchdata', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: JSON.stringify(selectList)}),
    })
    .then(data => data.json())
    .then(response => {
        // plot_table(response.data)
        console.log(response)
        // plot_scatter(attributes);
        var data = JSON.parse(response.data)
        GeoMap(response.geoData, data)
        plotSunBurst(response.sunburst, data)
        // var ndata = data.filter(s => s.nationality_name == "Brazil")
        // BarChart(data, [])
        PcpChart(response.pcpdata,d3.keys(response.pcpdata[0]))  
        wordCloud(response.wordcloud)
    });
}


const BarChart = (totaldata, filterdata=[]) => {
    d3.selectAll("#svgbar").remove()
    console.log(totaldata, filterdata);

    var wrapper = d3.select("#barchart")
    let Twidth = wrapper.node().getBoundingClientRect().width - 50;
    let Theight = wrapper.node().getBoundingClientRect().height - 100;
    

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 0, bottom: 0, left: 150},
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
            .padding(.3);
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
        .attr("x", () => {console.log(x(0)); return x(0)})
        .attr("y", function(d) { console.log(y(d.name)); return y(d.name); })
        .attr("width", function(d) { console.log(d.value); return x(d.value); })
        .attr("height", y.bandwidth() )
        .attr("fill", "bisque")
        .on("click", (d) => {
            console.log(d)
            sFeature(d)
        })

        if (filterdata.length > 0) {
            svg.selectAll("myRect2")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", () => {console.log(x(0)); return x(0) + 200})
            .attr("y", function(d) { console.log(y(d.name)); return y(d.name) + 20; })
            .attr("width", function(d) { console.log(map2.get(d.name), d.name); return x(map2.get(d.name)); })
            .attr("height", y.bandwidth() )
            .attr("fill", "tomato")
        }
}
// BarChart()