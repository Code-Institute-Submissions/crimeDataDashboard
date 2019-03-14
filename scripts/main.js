var opts = {
    lines: 12, // The number of lines to draw
    length: 5, // The length of each line
    width: 4, // The line thickness
    radius: 13, // The radius of the inner circle
    scale: 1.7, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#038531', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1.4, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute' // Element positioning
};

var target = document.getElementById('loader');
var spinner = new Spinner(opts).spin(target);


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
    spinner.stop();

    document.getElementById('loader').style.visibility = 'hidden';
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
    var mapRegion = dc.geoChoroplethChart("#crimeMap");
    var regions = ndx.dimension(area);
    var crimeSum = regions.group();

    var centre = d3.geo.centroid(mapJson);
    var projection = d3.geo.mercator().center(centre).scale(28500).translate([370, 220]);
    var colorBrewer = ['#b0e0c3', '#9fd0b2', '#8fc0a2', '#7fb192', '#6ea182', '#5e9272', '#4f8363', '#407555', '#306646'];
    var max = crimeSum.top(1)[0].value;
    var min = crimeSum.top(9).reverse()[0].value;



    mapRegion
        .width(600)
        .height(400)
        .dimension(regions)
        .projection(projection)
        .group(crimeSum)
        .colors(d3.scale.quantize().range(colorBrewer))
        .colorDomain([min, max])
        .colorCalculator(function (d) {
            return d ? mapRegion.colors()(d) : '#ccc';
        })
        .overlayGeoJson(mapJson.features, "region", function (d) {
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
    var width = document.getElementById("two").offsetWidth;
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
    var width = document.getElementById("three").offsetWidth;
    var outcomeDim = ndx.dimension(dc.pluck('Last outcome category'));
    var outcomeGroup = outcomeDim.group();

    dc.rowChart("#crimeOutcome")
        .width(width)
        .height(300)
        .dimension(outcomeDim)
        .group(outcomeGroup)
        .valueAccessor(function (p) {
            return p.value;
        })
        .gap(1.2)
        .elasticX(true)
        .cap(12);
}

// Total crimes in each month
function monthTotal(ndx) {
    var width = document.getElementById("four").offsetWidth;
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