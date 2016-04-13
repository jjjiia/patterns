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
		.defer(d3.json,"data/openspaces.json")
		.defer(d3.json,"data/buildings.json")
		.defer(d3.json,"data/busStops.json")
		.defer(d3.json,"data/bikeLanes.json")
		.defer(d3.json,"data/bikeshare.json")
		.defer(d3.json,"data/businesses.json")
		.defer(d3.json,"data/trees.json")
        .await(dataLoaded);
})
var layersControl = {
    "streets":true,
    "locations":true,
    "openspace":true
}
var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
function dataLoaded(error,streets,locations,openspace,buildings,bus,bikeLanes,bikeShare,businesses,trees){
    var mapSvg = d3.select("#map").append("svg").attr("width",x).attr("height",y)
    mapSvg.call(zoom);
    
    drawStreets(streets,"streets")
    drawopenspace(openspace,"openspace","#59BA53")
    drawBuildings(buildings,"buildings","black")
    drawBus(bus,"bus","red")
    drawBikeRoutes(bikeLanes,"bikeLanes","black")
    drawBikeRoutes(bikeShare,"bikeLanes","black")
    showHidLayers("bikeLanes")
    drawBusinesses(businesses,"businesses","red")
    drawTrees(trees,"trees","green")
    drawLocations(locations,"locations")
    drawLegend()
}

function showHidLayers(layer){
    var layers = d3.select("#layers").append("svg").attr("width",400).attr("height",20)
    layers.append("text").text(layer).attr("x",20).attr("y",14)
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
function drawLegend(){
    
// var locationL = d3.select("#entities").append("svg").attr("width",250).attr("height",40)
// locationL.append("text").text("Potential Locations").attr("x",30).attr("y",30)
// locationL.append("circle")
//     .attr("r",10).attr("cx",15).attr("cy",23)
// 
    var legend = d3.select("#entities").append("svg").attr("width",250).attr("height",450)
   
    var catArray = []
    for(var cat in colorsCategories){
        catArray.push([cat,colorsCategories[cat]])
    }
    var grayArray = new Array(12)
    
    legend.append("text").text("Building Footprints by Height:").attr("x",12).attr("y",240)

    var heightScale = d3.scale.linear().domain([1,12]).range(["#fff","#000"])    
    legend.selectAll("rect").data(grayArray).enter()
        .append("rect")
        .attr("x",function(d,i){return i*12+26})
        .attr("y",270)
        .attr("width",10)
        .attr("height",20)
        .attr("fill",function(d,i){return heightScale(i)})
        .on("click",function(d,i){
            d3.selectAll(".buildings").style("opacity",.1)
            d3.selectAll(".f"+i).style("opacity",1)
        })
        .attr("cursor","pointer")
        
    
    legend.append("text").text("<2").attr("x",18).attr("y",262).attr("class","categoryLabel")
    legend.append("text").text(">12").attr("x",150).attr("y",262).attr("class","categoryLabel")
    
    
    legend.append("circle").attr("r",5).attr("cx",20).attr("cy",360).attr("fill","#000")
    legend.append("rect").attr("width",10).attr("height",2).attr("x",15).attr("y",380).attr("fill","#000")
    
    legend.append("text").text("Bus Stops").attr("x",30).attr("y",364)
    legend.append("text").text("Bike Lanes").attr("x",30).attr("y",384)
    
    legend.append("path")      
        .attr("d",d3.svg.symbol().type("triangle-down"))
        .attr("transform","translate(20,400)")
        .attr("fill","#000")
        .attr("class","schoolLegend")
    legend.append("path")      
        .attr("d",d3.svg.symbol().type("triangle-up"))
        .attr("transform","translate(20,420)")
        .attr("fill","#000")
        .attr("class","schoolLegend")
    legend.append("text").text("competing schools").attr("x",30).attr("y",404)
    legend.append("text").text("complementary schools").attr("x",30).attr("y",424)
    
    legend.selectAll(".legend")
    .data(catArray).enter().append("circle")
    .attr("cx",20)
    .attr("cy",function(d,i){return i*20+20})
    .attr("r",5)
    .attr("class",function(d){
        return d[0]
    })
    .attr("fill",function(d){
        var colorIndex = d[1]; 
        return businessTypeColorsArray[colorIndex]})
    .on("click",function(d){
        d3.selectAll("circle .businesses").style("opacity",.1)
        d3.selectAll("circle ."+d[0]).transition().duration(1500).delay(function(i){return i*50}).style("opacity",1).attr("r",150)
    })
    .attr("cursor","pointer")
    
    legend.selectAll(".legend").data(catArray).enter().append("text")
    .attr("x",30)
    .attr("y",function(d,i){return i*20+24})
    .attr("fill",function(d){
            var colorIndex = d[1]; 
            return businessTypeColorsArray[colorIndex]
    })
    .text(function(d){return d[0]})
    .on("click",function(d){
        d3.selectAll(".businesses").style("opacity",.1)
        d3.selectAll("."+d[0]).style("opacity",1)
    })
    .attr("cursor","pointer")
}
function drawTrees(data,layer,color){
    showHidLayers(layer)
    var treeColors =["#30442D",
"#88BB3B",
"#336843",
"#59BA53",
"#687B59",
"#4BBB72",
"#3C5B20",
"#A5AE85",
"#6A9030",
"#62AF7E",
"#408341",
"#90AD63"]
    
    var dataArray = jsonToArray(data)
    var projection = d3.geo.mercator().scale(util.scale).center(util.center).translate(util.translate)    
    var colorScale = d3.scale.linear().domain([10,100]).range(["#fff",color])
    var mapSvg = d3.select("#map svg").append("g")
    mapSvg.selectAll("."+layer)
          .data(dataArray)
          .enter()
          .append("circle")
          .attr("cx",function(d){
            return projection([parseFloat(d.data.coordinates[0]),parseFloat(d.data.coordinates[1])])[0]
          })
          .attr("cy",function(d){
            return projection([parseFloat(d.data.coordinates[0]),parseFloat(d.data.coordinates[1])])[1]
          })
          .attr("r", function(d){
              //console.log(d.data.ids[0])
              //return d.data.ids[0][3]/120
              return Math.random()*4
          })
          .style("fill",function(d){
              return "green"
              return treeColors[parseInt(Math.random()*8)]
          })
          .attr("class",function(d){
              var classArray = layer+" "
              for(var id in d.data.ids){
                  var classId =d.data.ids[id][0]
                  classArray = classArray+"_"+classId+" "
              } 
              return classArray
          })
          .attr("opacity",.5)
}
function drawBusinesses(data,layer,color){
    showHidLayers(layer)
    var dataArray = jsonToArray(data)
    var projection = d3.geo.mercator().scale(util.scale).center(util.center).translate(util.translate)    
    var colorScale = d3.scale.linear().domain([10,100]).range(["#fff",color])
    var mapSvg = d3.select("#map svg").append("g")
    mapSvg.selectAll("."+layer)
          .data(dataArray)
          .enter()
          .append("circle")
          .attr("cx",function(d){
            return projection([parseFloat(d.data.coordinates[1]),parseFloat(d.data.coordinates[0])])[0]
          })
          .attr("cy",function(d){
            return projection([parseFloat(d.data.coordinates[1]),parseFloat(d.data.coordinates[0])])[1]
          })
          .attr("r", 2)
          .style("fill",function(d){
              var type = d.data.type
              if(businessTypeColors[type]!=undefined){
                  
                  var group = businessTypeColors[type]
                  var colorIndex = colorsCategories[group]
                  return businessTypeColorsArray[colorIndex]
              }else{
                  return "none"
              }}
          )
          .attr("class",function(d){
              var classArray = layer+" "+d.data.type+" "+businessTypeColors[d.data.type]+" "
              for(var id in d.data.ids){
                  var classId =d.data.ids[id][0]
                  classArray = classArray+"_"+classId+" "
              } 
              return classArray  
          })
}
function drawBus(data,layer,color){
    showHidLayers(layer)
    var dataArray = jsonToArray(data)
	var projection = d3.geo.mercator().scale(util.scale).center(util.center).translate(util.translate)    
    var colorScale = d3.scale.linear().domain([10,100]).range(["#fff",color])
    var mapSvg = d3.select("#map svg").append("g")

      mapSvg.selectAll("."+layer)
          .data(dataArray)
          .enter()
          .append("circle")
          .attr("cx",function(d){
            return projection([parseFloat(d.data.coordinates[0]),parseFloat(d.data.coordinates[1])])[0]
          })
          .attr("cy",function(d){
            return projection([parseFloat(d.data.coordinates[0]),parseFloat(d.data.coordinates[1])])[1]
          })
          .attr("r", 3)
          .style("fill",color)
          .attr("class",function(d){
              var classArray = layer+" "
              for(var id in d.data.ids){
                  var classId =d.data.ids[id][0]
                  classArray = classArray+"_"+classId+" "
              } 
              return classArray  
          })
          .style("opacity",.7)
}
function drawBikeRoutes(data,layer,color){
    var dataArray = jsonToArray(data)
	var projection = d3.geo.mercator().scale(util.scale).center(util.center).translate(util.translate)
    var colorScale = d3.scale.linear().domain([10,100]).range(["#fff",color])
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
          .attr("fill","none")
          .style("stroke", color)
          .attr("class",function(d){
              var classArray = layer+" "
              for(var id in d.data.ids){
                  var classId =d.data.ids[id][0]
                  classArray = classArray+"_"+classId+" "
              } 
              return classArray  
          })
          .style("opacity",.7)
}
function drawBuildings(data,layer,color){
    showHidLayers(layer)
    var dataArray = jsonToArray(data)
	var projection = d3.geo.mercator().scale(util.scale).center(util.center).translate(util.translate)    
    var colorScale = d3.scale.linear().domain([10,100]).range(["#fff",color])
    var mapSvg = d3.select("#map svg").append("g")
    var heightScale = d3.scale.linear().domain([1,12]).range(["#fff","#000"])
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
          .style("fill", function(d){
              var floors = parseInt(d.data.properties.TOP_GL/8)
              return heightScale(floors)
          })
          .attr("class",function(d){
              var classArray = layer+" "
              var floors = parseInt(d.data.properties.TOP_GL/8)
              for(var id in d.data.ids){
                  var classId =d.data.ids[id][0]
                  classArray = classArray+"_"+classId+" "
              } 
              return classArray +"f"+floors
          })
          .style("opacity",.7)
}
function drawopenspace(data,layer,color){
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
          .style("fill", color)
          .attr("class",function(d){
              var classArray = layer+" "
              for(var id in d.data.ids){
                  var classId =d.data.ids[id][0]
                  classArray = classArray+"_"+classId+" "
              } 
              return classArray  
          })
          .style("opacity",.7)
}
function drawLocations(data,layer){
//    showHidLayers(layer)  
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
          //  d3.selectAll("."+layer).style("opacity",.1)
            clickLocations(d.id)
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
            clickLocations(d.id)
        })
        .attr("cursor","pointer")
}
function clickLocations(id){
            d3.selectAll(".openspace").style("opacity",.05)
            d3.selectAll(".buildings").style("opacity",.05)
            d3.selectAll(".bus").style("opacity",.05)
            d3.selectAll(".bikeLanes").style("opacity",.05)
            d3.selectAll(".businesses").style("opacity",.05)
            d3.selectAll(".trees").style("opacity",.05)
            d3.selectAll("._"+id).style("opacity",.6)
	        d3.selectAll(".trees ._"+id).style("opacity",.4)
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
        .attr("stroke-width",.3)
        //.call(zoom)
}
function zoomed() {
    util.scale = d3.event.scale
	util.translate = d3.event.translate
    d3.selectAll("#map").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    d3.selectAll("#map .openspace").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll("#map .buildings").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll("#map .bus").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll("#map .bikeLanes").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll("#map .businesses").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll("#map .trees").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll("#map path").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll("#map .locations").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}