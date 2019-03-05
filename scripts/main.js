queue()
    .defer(d3.csv, "data/crimeData.csv")
    .defer(d3.json, "data/hertfordshire.json")
    .await(makeGraphs);

function makeGraphs(error, crimeData, mapJson) {
    var ndx = crossfilter(crimeData);

    crimeType(ndx);
    crimeOutcome(ndx);
    totalCrime(ndx);
    crimeMap(ndx, mapJson);
    crimeMonth(ndx);
    monthTotal(ndx);

    dc.renderAll();
}

//Variable to condense region name from csv file
var area = dc.pluck('LSOA name', function (d) {
    return d.split(" 0")[0];
})

// Create Month selector form data
function crimeMonth(ndx) {
    var monthDim = ndx.dimension(dc.pluck('Month'));
    var monthGroup = monthDim.group();

    dc.selectMenu('#monthSelect')
        .dimension(monthDim)
        .group(monthGroup)
        .title(function (d) {
            return d.key;
        })
        .multiple(true)
        .numberVisible(13)
        .promptText('All months');
};

//Create map of hertfordshire
function crimeMap(ndx, mapJson) {
    var width = document.getElementById("one").clientWidth;
    var mapRegion = dc.geoChoroplethChart("#crimeMap");
    var regions = ndx.dimension(area);
    var crimeSum = regions.group();

    var centre = d3.geo.centroid(mapJson);
    var projection = d3.geo.mercator().center(centre).scale(28500).translate([370, 220]);
    var colorBrewer = ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'];
    var max = crimeSum.top(1)[0].value;
    var min = crimeSum.top(200).reverse()[0].value;

    mapRegion
        .width(width)
        .height(400)
        .dimension(regions)
        .projection(projection)
        .group(crimeSum)
        .colors(d3.scale.quantize().range(colorBrewer))
        .colorDomain([min, max])
        .colorCalculator(function(d) {
            return d ? mapRegion.colors()(d) : '#ccc';
        })
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
        .valueAccessor(function (d) {
            return d;
        })
        .html({
            one: '%number Crime',
            some: '%number Crimes',
            none: 'No Records'
        });
};

// Type of crime in pie chart format
function crimeType(ndx) {
    var width = document.getElementById("two").clientWidth;
    var typeDim = ndx.dimension(dc.pluck('Crime type'));
    var typeGroup = typeDim.group();

    dc.pieChart('#crimeType')
        .width(width)
        .height(400)
        .radius(150)
        .innerRadius(45)
        .externalRadiusPadding(30)
        .transitionDuration(1500)
        .cx([150])
        .colors(d3.scale.category20())
        .dimension(typeDim)
        .group(typeGroup)
        .renderLabel(false)
        .legend(dc.legend().x(320).y(125).itemHeight(15).gap(5));
};

// Outcome of crime row chart
function crimeOutcome(ndx) {

    var width = document.getElementById("three").clientWidth;
    var outcomeDim = ndx.dimension(dc.pluck('Last outcome category'));
    var outcomeGroup = outcomeDim.group();

    dc.rowChart("#crimeOutcome")
        .width(width)
        .height(300)
        .dimension(outcomeDim)
        .group(outcomeGroup)
        .valueAccessor(function(p) {
            return p.value;
        })  
        .gap(1.5)    
        .elasticX(true)
        .cap(10);
}

// Total crimes in each month
function monthTotal(ndx) {
    var width = document.getElementById("four").clientWidth;
    var monthDim = ndx.dimension(dc.pluck('Month'));
    var monthGroup = monthDim.group();

    dc.barChart("#monthTotal")
        .width(width)
        .height(300)
        .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        })
        .dimension(monthDim)
        .group(monthGroup)
        .transitionDuration(500)
        .renderHorizontalGridLines(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Outcome Of Month")
        .elasticY(true)
        .yAxis().ticks(10);
}