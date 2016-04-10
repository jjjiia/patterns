var w = window
x = Math.max(960, window.innerWidth)
y = Math.max(500, window.innerHeight);

var util = {
    width:x,
    height:y,
    center:[-71.116580,42.374059],
    scale:600000
}



drawTiles()


function drawTiles(){
    var tiler = d3.geo.tile()
        .size([ util.width,  util.height]);
    
    var projection = d3.geo.mercator()
        .center(util.center)
        .scale(util.scale)
        .translate([util.width/2, util.height/2]);
    
    var svg = d3.select("#map").append("svg")
        .attr("width", util.width)
        .attr("height", util.height);

    var path = d3.geo.path()
        .projection(projection);
    
          svg.selectAll("g")
              .data(tiler
                .scale(projection.scale() * 2 * Math.PI)
                .translate(projection([0, 0])))
              .enter().append("g")
              .each(function(d) {
    
                  var g = d3.select(this);
      
                  d3.json("http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-highroad/" + d[2] + "/" + d[0] + "/" + d[1] + ".json", function(error, json) {
                        g.selectAll("path")
                        .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
                        .enter().append("path")
                        .attr("class", function(d) { return d.properties.kind; })
                        .attr("d", path)
                      .attr("fill","none")
                      .attr("stroke","#000")
                      .attr("stroke-width",0.5)
                });
              });
}
