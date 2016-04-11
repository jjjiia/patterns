var w = window
x = Math.max(960, window.innerWidth)
y = Math.max(500, window.innerHeight);

var util = {
    width:x,
    height:y,
    center:[-71.116580,42.374059],
    scale:1200000,
    translate:[x/2,y/2]
}
var projection = d3.geo.mercator().scale(util.scale).center(util.center).translate(util.translate)


var streets = "data/geodata/streets.geojson"

$(function() {
	queue()
		.defer(d3.json,streets)
		.defer(d3.csv,"data/locationsForSchools.csv")
		.defer(d3.json,"data/openspace.json")
        .await(dataLoaded);
})
var layersControl = {
    "streets":true,
    "locations":true,
    "openspace":true
}
function dataLoaded(error,streets,locations,openspace){
    var mapSvg = d3.select("#map").append("svg").attr("width",x).attr("height",y)
    drawStreets(streets,"streets")
    drawLocations(locations,"locations")
    drawEntitiesShapes(openspace,"openspace")
}

function showHidLayers(layer){
    var layers = d3.select("#layers").append("svg").attr("width",400).attr("height",20)
    layers.append("text").text(layer).attr("x",10).attr("y",20)
    .on("click",function(){
        if(layersControl[layer]==false){
            d3.selectAll("."+layer).style("opacity",1)
            layersControl[layer]=true
            d3.select(this).style("opacity",1)
        }else{
            d3.selectAll("."+layer).style("opacity",0)
            layersControl[layer]=false
            d3.select(this).style("opacity",.5)
        }
    })
}
function jsonToArray(data){
    var array = []
    for(var i in data){
        var entry = {}
        entry["name"]=i
        entry["data"] = data[i]
        array.push(entry)
    }
    return array
}
function drawEntitiesShapes(data,layer){
    showHidLayers(layer)
    var dataArray = jsonToArray(data)
	var projection = d3.geo.mercator().scale(util.scale).center(util.center).translate(util.translate)
    
    
    var mapSvg = d3.select("#map svg").append("g")
    var line = d3.svg.line()
//          .interpolate("cardinal")
          .x(function(d) {
            return projection([parseFloat(d[0]),parseFloat(d[1])])[0]
          })
          .y(function(d) {
            return projection([parseFloat(d[0]),parseFloat(d[1])])[1]
          })
                    
      mapSvg.selectAll("."+layer)
          .data(dataArray)
          .enter()
          .append("path")
          .attr("d", function(d){return line(d.data.coordinates)})
          .style("fill", function(){
             return "green"
          })
          .attr("class",function(d){
              var classArray = layer+" "
              for(var id in d.data.ids){
                  var classId =d.data.ids[id][0][0]
                  classArray = classArray+"_"+classId+" "
              } 
              return classArray  
          })
          .style("opacity",.7)
}
function drawLocations(data,layer){
    showHidLayers(layer)
    
    var mapSvg = d3.select("#map svg").append("g")
    mapSvg.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r",14)
        .attr("class",function(d){
            return layer+" _"+d.id})
        .attr("cx",function(d){
            return projection([parseFloat(d.lng),parseFloat(d.lat)])[0]
        })
        .attr("cy",function(d){
            return projection([parseFloat(d.lng),parseFloat(d.lat)])[1]
        })
        .style("fill","black")
        .on("click",function(d){
            layersControl[layer]=false
            d3.selectAll("."+layer).style("opacity",.1)
            d3.selectAll(".openspace").style("opacity",.1)
            d3.selectAll("._"+d.id).style("opacity",1)
        })
        .attr("cursor","pointer")
    mapSvg.selectAll(".text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d){return d.id})
        .attr("class",function(d){
            return layer+" _"+d.id})
        .attr("x",function(d){
            return projection([parseFloat(d.lng),parseFloat(d.lat)])[0]
        })
        .attr("y",function(d){
            return projection([parseFloat(d.lng),parseFloat(d.lat)])[1]+5
        })
        .attr("text-anchor","middle")
        .style("fill","white")
        .on("click",function(d){
            layersControl[layer]=false
            d3.selectAll("."+layer).style("opacity",.1)
            d3.selectAll(".openspace").style("opacity",.2)
            d3.selectAll("._"+d.id).style("opacity",1)
        })
        .attr("cursor","pointer")
}
function drawStreets(data,layer){
    showHidLayers(layer)
	var path = d3.geo.path().projection(projection);
    //push data, add path
    var map = d3.select("#map svg").append("g").attr("class",layer)
	map.selectAll(".buildings")
		.data(data.features)
        .enter()
        .append("path")
		.attr("class","streets")
		.attr("d",path)
		.style("fill","none")
		.style("stroke","black")
	    .style("opacity",1)
        .attr("stroke-width",.5)
        //.call(zoom)
}