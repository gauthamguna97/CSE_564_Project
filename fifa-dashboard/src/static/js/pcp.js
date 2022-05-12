
var pcaFData= new Set();


// function PcpData(dimen) {
//   fetch('/pcpdata' , {
//     method: "GET",
//     headers : { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//   }).then(function (response) {
//     return response.json();
//   }).then(function (d) {
//       pcaData=d.data
//       PcpChart(d.data,d3.keys(d.data[0]))    
//   });
// }

function PcpChart(dataPcp,dim){
  d3.selectAll('#pcpchart').remove()
  var pcp_wrap = d3.select('#pcp')
  let width = pcp_wrap.node().getBoundingClientRect().width - 100;
  let height = pcp_wrap.node().getBoundingClientRect().height - 100;
//  d3.select("#svg_pcp1").html("");
  colors_opt = ["#0570b0","#F95738","#4B4E6D"];
  var color = d3.scaleOrdinal(colors_opt);
  var margin= {
    top:50,
    right:50,
    bottom:50,
    left:50
  };
 var x = d3.scalePoint().range([0, width], 1),
     y = {},
     dragging = {};
     
   entity = {1:'India',2:'United States',3:'China',4:'Russia',5:'Australia',6:'Germany',7:'Japan',8:'New Zealand',9:'Mexico',10:'United Kingdom',11:'France',12:'Argentina',13:'Indonesia',14:'Italy',15:'Spain',16:'Saudi Arabia',17:'Switzerland',18:'Luxembourg',19:'Ireland',20:'Kuwait',21:'Austria'};
   

 var line = d3.line(),
     axis = d3.axisLeft(),
     background,
     foreground;

 var svg = d3.select("#pcp")
      .append('svg')
      .attr('id', 'pcpchart')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


   // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = dim.filter(function(d) {
     if(d==="sofifa_id") return false

if(d !== "wage_eur"){y[d] = d3.scalePoint()
          .domain(dataPcp.map(function(p) { return p[d]; }).sort())
          .range([height, 0]);}
else{
y[d] = d3.scaleLinear()
         .domain(d3.extent(dataPcp, function(p) { return +p[d]; }))
         .range([height, 0])
}
return true;
}));
     // console.log("pcaData");
  // console.log(dimensions);
   // Add grey background lines for context.
   background = svg.append("g")
       .attr("class", "background")
     .selectAll("path")
       .data(dataPcp)
     .enter().append("path")
       .attr("d", path);

   // Add blue foreground lines for focus.
   foreground = svg.append("g")
       .attr("class", "foreground")
     .selectAll("path")
       .data(dataPcp)
     .enter().append("path")
       .attr("d", path)
       .attr("style", function(d) {
           return "stroke:" + color(d.clusters) + ";";
       });

   // Add a group element for each dimension.
   var g = svg.selectAll(".dimension")
       .data(dimensions)
     .enter().append("g")
       .attr("class", "dimension")
       .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
       .call(d3.drag()
         .subject(function(d) { return {x: x(d)}; })
         .on("start", function(d) {
           dragging[d] = x(d);
           background.attr("visibility", "hidden");
         })
         .on("drag", function(d) {
           dragging[d] = Math.min(width, Math.max(0, d3.event.x));
           foreground.attr("d", path);
           dimensions.sort(function(a, b) { return position(a) - position(b); });
           x.domain(dimensions);
           g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
         })
         .on("end", function(d) {
           delete dragging[d];
           transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
           transition(foreground).attr("d", path);
           background
               .attr("d", path)
             .transition()
               .delay(500)
               .duration(0)
               .attr("visibility", null);
         }));



   // Add an axis and title.
   g.append("g")
       .attr("class", "axis")
       .each(function(d) { d3.select(this).call(axis.scale(y[d])); });
   g.append("text")
       .style("text-anchor", "middle")
       .transition()
.duration(2000)
       .attr("y", -15)
       .text(function(d) {
         return d;
       });
       
   yBrushes = {}
   g.append("g")
     .attr("class", "brush")
     .each(function(d) {
       d3.select(this).call(y[d].brush = d3.brushY().extent([[-10, 0], [10, height]])
       .on("start", brushstart).on("brush", brush));
     })

     function brush() {
       var actives = [];
       //filter brushed extents
       console.log('actives', actives);
       svg.selectAll(".brush")
           .filter(function(d) {
               return d3.brushSelection(this);
           })
           .each(function(d) {
               actives.push({
                   dimension: d,
                   extent: d3.brushSelection(this)
               });
           });
       //set un-brushed foreground line disappear
       foreground.classed("fade", function(d,i) {
            console.log('pcpd', d);
           var value = !actives.every(function(active) {
               var dim = active.dimension;
               return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim])  <= active.extent[1];
           });

           if (!value) {
             pcaFData.add(d['sofifa_id'])
           }
           return value;
       });

       console.log('actives', pcaFData);
       
       setTimeout((e) => {
        pFeature(Array.from(pcaFData))
       }, 500)
   }



 function position(d) {
   var v = dragging[d];
   return v == null ? x(d) : v;
 }

 function transition(g) {
   return g.transition().duration(500);
 }

 function path(d) {

   return line(dimensions.map(function(p) {  return [position(p), y[p](d[p])]; }));
 }

function brushstart() {
 d3.event.sourceEvent.stopPropagation();
}

}

const pFeature = (slist) => {

  fetch('/fetchdata', {
      method: 'POST', // or 'PUT'
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pcpval: JSON.stringify(slist)}),
  })
  .then(data => data.json())
  .then(response => {
      // plot_table(response.data)
      console.log(response)
      // plot_scatter(attributes);
      var data = JSON.parse(response.data)
      var maindata = JSON.parse(response.data)
      GeoMap(response.geoData, data)
      plotSunBurst(response.sunburst, data)
      // var ndata = data.filter(s => s.nationality_name == "Brazil")
      BarChart(maindata, data)
      // PcpChart(response.pcpdata,d3.keys(response.pcpdata[0]))
      wordCloud(response.wordcloud)
      pcaFData = new Set()
  });
}