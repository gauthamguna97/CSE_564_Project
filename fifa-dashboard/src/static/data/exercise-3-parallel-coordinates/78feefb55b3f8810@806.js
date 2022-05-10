// https://observablehq.com/@valentinanaghavi/exercise-3-parallel-coordinates@806
import define1 from "./e93997d5089d7165@2303.js";

function _1(md,data){return(
md`# Exercise 3: Parallel Coordinates
In this assignment we are going to visualize the multivariate cars dataset using Parallel Coordinates. The dataset contains information on ${data.length} cars and includes various attributes of different types.

Parallel Coordinates can be arranged vertically or horizontally. In this assignment we are going to use vertical axes. The following scale maps from the attribute names to a horizontal position in the plot and should be used to position the axes of the Parallel Coordinates Plot (PCP). Use what you learned in the previous assignments.`
)}

function _x(d3,attributes,margin,width){return(
d3.scalePoint(attributes, [margin.left, width - margin.right])
)}

function _3(md){return(
md`## Task 1: Scales (20%)
To map the attribute values to a vertical position on the respective axis we need to setup scales. Different attribute types require different scales. Have a look at the data to determine which type of scale is suited for the attribute type. Setup the scales and add them to the following map with the attribute as the key and the scale as the value.`
)}

function _y(attributes,d3,data,height,margin)
{
  let scales = new Map();
  let originDomainContainer = ["US", "JP", "EU"]
  
  // TODO: create a suitable scale for each attribute and add it to the map
  // source: https://www.tutorialsteacher.com/d3js/scales-in-d3
  
  attributes.forEach(function(attribute) {
 
    let scaleValue = 0;
    
    if(attribute == "origin"){
      //works like a scale ordinal with equally distributed points
      scaleValue = d3.scalePoint().domain(data.map(item => item[attribute]))
                                  .range([height - margin.bottom, margin.top]);
     /* 
      scaleValue = d3.scaleOrdinal().domain(data.map(item => item[attribute]))
                                    // range for 3 equally distributed values
                                    .range([height - margin.bottom, (height - margin.bottom) / 2, margin.top]);
     */                                
    }else{
     // Construct continuous linear scale where input data (domain) maps to specified output range. 
     scaleValue = d3.scaleLinear().domain(d3.extent(data, item => item[attribute]))
                                  .range([height - margin.bottom, margin.top]).nice();
    }
    
    scales.set(attribute, scaleValue);
    
  });
  return scales;
}


function _5(md){return(
md`## Task 2: Polylines (30%)
In PCPs each item is represented as a polyline. The polyline's intersections with the axes encode the value for the respective attribute. Have a look at the [d3 example](https://observablehq.com/@d3/parallel-coordinates) but bear in mind that we're using a horizontal layout (i.e. vertical axes that are placed horizontally) instead of a vertical one. Use [d3 line](https://observablehq.com/@d3/d3-line) to create the axes and the polylines. Add a label for each axis designating its attribute with the short name from *shortAttributeNames*.`
)}

function _6(md){return(
md`## Task 3: Color (20%)
Create a color scale for each attribute that is suitable for the respective attribute type. Use the variable *colorAttribute* that is set in the dropdown below to apply the color mapping for that attribute. The colors should adapt when the attribute is changed.`
)}

function _colorAttribute(select,attributes){return(
select({
  title: "Color Attribute",
  description: "Pick an attribute for coloring the polylines.",
  options: attributes,
  value: "origin"
})
)}

function _color(colorAttribute,d3,y)
{
  if(colorAttribute == "origin"){
    /* Construct ordinal scale where input data includes alphabets and 
       are mapped to discrete numeric output range. */ 
    return d3.scaleOrdinal(y.get(colorAttribute).domain(), d3.schemeSet1);
  }else{
    // Construct sequential scale where output range is fixed by interpolator function. 
    return d3.scaleSequential(y.get(colorAttribute).domain().reverse(), d3.interpolateRdYlGn); // RdGy BrBG
  }
}


function _9(md){return(
md`## Task 4: Brushing & Linking (30%)
For each axis a brush is already created. By clicking and dragging on the axes a value range can be brushed and is stored in the map *activeBrushes*. The map uses the attribute name as a key and has an array of the lower and upper vertical pixel position of the brush as a value. Only items that are inside **all** of these value ranges are selected, all other polylines should be de-emphasized by adding the *hidden* class.`
)}

function _10(md){return(
md`## Bonus Task: Extended Areas (20%)
Implement extended areas as presented in the lecture for ordinal and categorical attributes.`
)}

function _path(d3,attributes,x,y){return(
function path(d) {
      //source: https://www.d3-graph-gallery.com/graph/parallel_basic.html
      return d3.line()(attributes.map(function(key) { return [x(key), y.get(key)(d[key])]; }));
  }
)}

function _paracoords(d3,width,height,data,path,color,colorAttribute,attributes,x,y,shortAttributeNames,margin)
{

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  // set the style of hidden data items
  svg
    .append("style")
    .text("path.hidden { stroke: #000; stroke-opacity: 0.01;}");

  // a map that holds any active brush per attribute
  let activeBrushes = new Map();

  const polylines = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.6) //optional
    .selectAll("path")
    .data(data)
    .join("path");
  
  // TODO: create the polylines
  polylines
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", /*"#69b3a2"*/ d => color(d[colorAttribute])) // TODO: apply the color scale from task 3
    .style("opacity", 0.5);

 
  // create the group nodes for the axes
  const axes = svg
    .append("g")
    .selectAll("g")
    .data(attributes)
    .join("g")
    //translate this element to its right position on the x axis
    .attr("transform", d => `translate(${x(d)},0)`);

  // TODO: add the visual representation of the axes
  // source: https://www.d3-graph-gallery.com/graph/parallel_basic.html
  axes
    .each(function(d) { d3.select(this).call(d3.axisRight(y.get(d))); })
    // add axis title
    .call(g => g.append("text") 
      .attr("transform", "rotate(90)")
      .style("text-anchor", "left")
      .attr("y", 9)
      .text(function(d) { return shortAttributeNames.get(d); }) 
      .style("fill", "green"))
    .call(g => g.selectAll("text")
      .clone(true).lower() //clone and get the lower layer of text as background 
      .attr("fill", "none")
      .attr("stroke-width", 5)
      .attr("stroke-linejoin", "round")
      .attr("stroke", "white"));
  
  // TODO implement brushing & linking
  function updateBrushing() {
    // d3.event.selection == activeBrushes without key
    if (activeBrushes === null){  
      polylines.classed("hidden",false);   
    }

      polylines.classed("hidden", d => {

        var key = 0;
        var value_y = 0;
        var active_domain_y = 0;
        /*Checks for each attribute whether the polyline should be drawn by checking whether 
          it is in the active area or not */
        for(var i=0; i < attributes.length; i++){
        
          key = attributes[i];
          value_y = y.get(key)(d[key]);
          active_domain_y /*[y0, y1]*/ = activeBrushes.get(key);
        
          if(active_domain_y != null){
            if(value_y < active_domain_y[0] || value_y > active_domain_y[1]) {
              return true;
            }
          }
        }
        return false;
      });
  }

  function brushed(attribute) {
    activeBrushes.set(attribute, d3.event.selection);
    updateBrushing();
  }

  function brushEnd(attribute) {
    if (d3.event.selection !== null) return;
    activeBrushes.delete(attribute);
    updateBrushing();
  }

  
  const brushes = axes.append("g").call(
    d3
      .brushY()
      .extent([[-10, margin.top], [10, height - margin.bottom]])
      .on("brush", brushed)
      .on("end", brushEnd)
  );
  return svg.node();
}


function _13(md){return(
md`## Appendix`
)}

function _height(){return(
500
)}

function _margin(){return(
{ top: 10, right: 30, bottom: 10, left: 10 }
)}

async function _data(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("cars.csv").text(), d3.autoType)
)}

function _attributes(data){return(
data.columns.filter(d => d !== "name")
)}

function _shortAttributeNames(){return(
new Map(
  Object.entries({
    mpg: "MPG",
    cylinders: "CYL",
    displacement: "DPL",
    horsepower: "HP",
    weight: "WGT",
    acceleration: "ACL",
    year: "YEAR",
    origin: "OGN"
  })
)
)}

function _d3(require){return(
require("d3@5")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["cars.csv", {url: new URL("./files/18d6df3f9727da75f1aa6c29ecc593d9b2112801eefcfc2a542515eece1d9f7171dd974512fe242fcad6a575ed18d2184ed2c9f7e621b1d8605a992bc4c6171a", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md","data"], _1);
  main.variable(observer("x")).define("x", ["d3","attributes","margin","width"], _x);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer("y")).define("y", ["attributes","d3","data","height","margin"], _y);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer("viewof colorAttribute")).define("viewof colorAttribute", ["select","attributes"], _colorAttribute);
  main.variable(observer("colorAttribute")).define("colorAttribute", ["Generators", "viewof colorAttribute"], (G, _) => G.input(_));
  main.variable(observer("color")).define("color", ["colorAttribute","d3","y"], _color);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer("path")).define("path", ["d3","attributes","x","y"], _path);
  main.variable(observer("paracoords")).define("paracoords", ["d3","width","height","data","path","color","colorAttribute","attributes","x","y","shortAttributeNames","margin"], _paracoords);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], _data);
  main.variable(observer("attributes")).define("attributes", ["data"], _attributes);
  main.variable(observer("shortAttributeNames")).define("shortAttributeNames", _shortAttributeNames);
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
