// Options for spin.js loader
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

//Queue data and wait for functions to execute and be called 
queue()
    .defer(d3.csv, "data/crimeData.csv")
    .defer(d3.json, "data/hertfordshire.json")
    .await(makeGraphs);

// Call all chart functions
function makeGraphs(error, crimeData, mapJson) {
    var ndx = crossfilter(crimeData);

    crimeType(ndx);
    crimeOutcome(ndx);
    totalCrime(ndx);
    crimeMap(ndx, mapJson);
    crimeMonth(ndx);
    monthTotal(ndx);

    dc.renderAll();

    // Stop spinner and hidde overlay
    spinner.stop();
    document.getElementById('loader').style.visibility = 'hidden';
}

//Variable to condense region name from csv file
var area = dc.pluck('LSOA name', function (d) {
    return d.split(" 0")[0];
})

// Colorbrewer for chart colours
var colorBrewer = d3.scale.quantize().range(['#fff0e2', '#f8dbc6', '#efc7aa', '#e6b38e', '#dc9f73', '#d18b59', '#c5783f', '#b76524', '#aa5200']);
var colorBrewerTwo = d3.scale.ordinal().range(['#b0e0c3', '#9fd0b2', '#8fc0a2', '#7fb192', '#6ea182', '#5e9272', '#4f8363', '#407555', '#306646'].reverse())

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

// Create Month selector form data
function crimeMonth(ndx) {
    var monthDim = ndx.dimension(dc.pluck('Month'));
    var monthGroup = monthDim.group();

    dc.selectMenu('#monthSelect')
        .dimension(monthDim)
        .group(monthGroup)
        .title(function (d) {
            return d.key.split("-")[1] + " 2018";
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

    var width = document.getElementById("one").offsetWidth;
    function resize (){
        document.onresize
    }
    var height = 400;

    var max = crimeSum.top(1)[0].value;
    var min = crimeSum.top(9).reverse()[0].value;

    var centre = d3.geo.centroid(mapJson);
    var middle = width / 2;
    var scale = 25000 + (middle + width);
    var projection = d3.geo.mercator().center(centre).scale(scale).translate([middle, 220]);

    mapRegion
        .width(width)
        .height(height)
        .dimension(regions)
        .projection(projection)
        .group(crimeSum)
        .colors(colorBrewer)
        .colorDomain([min, max])
        .colorCalculator(function (d) {
            return d ? mapRegion.colors()(d) : '#ccc';
        })
        .overlayGeoJson(mapJson.features, "region", function (d) {
            return d.properties.lad17nm;
        });
}

// Type of crime in pie chart format
function crimeType(ndx) {
    var width = document.getElementById("two").offsetWidth;
    var typeDim = ndx.dimension(dc.pluck('Crime type'));
    var typeGroup = typeDim.group();



    dc.pieChart('#crimeType')
        .width(width)
        .height(width / 2)
        .radius(width / 4)
        .innerRadius(width / 15)
        .externalRadiusPadding(width  / 10)
        .transitionDuration(1500)
        .cx([width / 4])
        .colors(d3.scale.category10())
        .dimension(typeDim)
        .group(typeGroup)
        .renderLabel(false)
        .title(function (d) {
            return d.value
        })
        .legend(dc.legend().x(width / 2).y(0).itemHeight(12).gap(3));
};

// Outcome of crime row chart
function crimeOutcome(ndx) {
    var width = document.getElementById("four").offsetWidth;
    var outcomeDim = ndx.dimension(dc.pluck('Last outcome category'));
    var outcomeGroup = outcomeDim.group();

    dc.rowChart("#crimeOutcome")
        .width(width)
        .height(width / 2)
        .dimension(outcomeDim)
        .group(outcomeGroup)
        .valueAccessor(function (p) {
            return p.value;
        })
        .colors(colorBrewerTwo)
        .gap(1.2)
        .elasticX(true)
        .cap(9);
}

// Total crimes in each month bar chart
function monthTotal(ndx) {
    var chart = dc.barChart("#monthTotal")
    var width = document.getElementById("three").offsetWidth;
    var monthDim = ndx.dimension(dc.pluck('Month'));
    var monthGroup = monthDim.group();


    chart
        .width(width)
        .height(width / 2)
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