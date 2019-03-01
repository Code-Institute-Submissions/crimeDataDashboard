queue()
    .defer(d3.csv, "data/2018Jan.csv")
    .defer(d3.json, "data/hertfordshire.json")
    .await(makeGraphs);

function makeGraphs(error, crimeData, mapJson) {
    var ndx = crossfilter(crimeData);

    crimeType(ndx);
    // crimeArea(ndx);
    crimeOutcome(ndx);
    totalCrime(ndx);
    crimeMap(ndx, mapJson);    

    dc.renderAll();
}

//Create map of hertfordshire
function crimeMap(ndx, mapJson) {

    var mapRegion = dc.geoChoroplethChart("#crimeMap");    
    var regions = ndx.dimension(dc.pluck('LSOA name', function(d) {
        return d.split(" 0")[0];
    }));
    var crimeSum = regions.group();

    var centre = d3.geo.centroid(mapJson);
    var projection = d3.geo.mercator().center(centre).scale(29000).translate([290, 290]);
    var colorBrewer = ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081'];
    var max = crimeSum.top(1)[0].value;

    mapRegion
        .width(500)
        .height(500)
        .dimension(regions)
        .projection(projection)
        .group(crimeSum)
        .colors(colorBrewer)
        .colorDomain([0, max])
        .colorAccessor(function(d, i){ return d;})
        .overlayGeoJson(mapJson.features, "region", function(d) {
            return d.properties.lad17nm;
        });
}

// Total crime in number format
function totalCrime(ndx) {
    var totalGroup = ndx.groupAll();

    dc.numberDisplay('#totalCrime')
        .group(totalGroup)
        .formatNumber(d3.format(".0f"))
        .valueAccessor( function(d) { return d; } )
        .html({
            one:'%number Crime',
            some:'%number Crimes',
            none:'No Records'});
};

// Type of crime in pie chart format
function crimeType(ndx) {
    var typeDim = ndx.dimension(dc.pluck('Crime type'));
    var typeGroup = typeDim.group();

    dc.pieChart('#crimeType')
        .width(400)
        .height(550)
        .radius(150)
        .innerRadius(65)
        .externalRadiusPadding(50)
        .transitionDuration(1500)        
        .colors(d3.scale.category20())
        .dimension(typeDim)
        .group(typeGroup)
        .renderLabel(false)
        .legend(dc.legend().x(320).y(125).itemHeight(15).gap(5));
};

// Outcome of crime in pie chart format
function crimeOutcome(ndx) {
    var outcomeDim = ndx.dimension(dc.pluck('Last outcome category'));
    var outcomeGroup = outcomeDim.group();

    dc.pieChart('#crimeOutcome')
        .width(600)
        .height(550)
        .radius(150)
        .innerRadius(65)
        .externalRadiusPadding(50)
        .transitionDuration(1500)
        .colors(d3.scale.category10())
        .dimension(outcomeDim)
        .group(outcomeGroup)
        .renderLabel(false)
        .legend(dc.legend().x(420).y(35).itemHeight(15).gap(5));
};

// Area of crime in bar chart format
// function crimeArea(ndx) {  
//     var areaDim = ndx.dimension(dc.pluck('LSOA name', function(d){
//         return d.split(" 0")[0];
//     }));
//     var areaGroup = areaDim.group();

//     dc.barChart("#crimeArea")
//         .width(1100)
//         .height(400)
//         .margins({
//             top: 10,
//             right: 50,
//             bottom: 30,
//             left: 50
//         })
//         .dimension(areaDim)
//         .group(areaGroup)
//         .transitionDuration(500)
//         .colors(d3.scale.category10())
//         .x(d3.scale.ordinal())
//         .xUnits(dc.units.ordinal)
//         .xAxisLabel("Area of crime")
//         .elasticY(true)
//         .renderHorizontalGridLines(true)
//         .yAxis().ticks(10);
// }