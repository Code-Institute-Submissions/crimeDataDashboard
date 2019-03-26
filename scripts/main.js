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
});

// Color for chart colours
var colorRow = d3.scale.ordinal().range(['#355c7d', '#525f7d', '#6b637e', '#80667e', '#95697f', '#aa6b7f', '#bc6e7f', '#d16f80', '#e27180', '#f67280'].reverse());
var colorMap = d3.scale.quantize().range(['#355c7d', '#525f7d', '#6b637e', '#80667e', '#95697f', '#aa6b7f', '#bc6e7f', '#d16f80', '#e27180', '#f67280']);
var colorPie = d3.schemeAccent;

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
}

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
        .promptText('All months')
        .useViewBoxResizing(true);
}

//Create map of hertfordshire
function crimeMap(ndx, mapJson) {
    var mapRegion = dc.geoChoroplethChart("#crimeMap");
    var regions = ndx.dimension(area);
    var crimeSum = regions.group();

    var width = document.getElementById("one").offsetWidth;
    var height = 400;
    var centre = d3.geo.centroid(mapJson);
    var middle = width / 2;
    var hMiddle = height / 1.90;
    var scale = 25000 + (middle + width);
    var projection = d3.geo.mercator().center(centre).scale(scale).translate([middle, hMiddle]);

    mapRegion
        .width(width / 2)
        .height(height)
        .dimension(regions)
        .projection(projection)
        .group(crimeSum)
        .colorAccessor(function (d) {
            return d;
        })
        .colors(colorMap)
        .on('renderlet', function () {
            var max = crimeSum.top(1)[0].value;
            var min = crimeSum.top(9).reverse()[0].value;

            mapRegion
                .width(width)
                .height(height)
                .colorDomain([min, max]);
        })
        .on('preRender', function () {
            var max = crimeSum.top(1)[0].value;
            var min = crimeSum.top(9).reverse()[0].value;

            mapRegion
                .width(width)
                .height(height)
                .colorDomain([min, max]);
        })
        .on('preRedraw', function () {
            var max = crimeSum.top(1)[0].value;
            var min = crimeSum.top(9).reverse()[0].value;

            mapRegion
                .width(width)
                .height(height)
                .colorDomain([min, max]);
        })
        .overlayGeoJson(mapJson.features, "region", function (d) {
            return d.properties.lad17nm;
        })
        .useViewBoxResizing(true);
}

// Type of crime in pie chart format
function crimeType(ndx) {
    var width = document.getElementById("two").offsetWidth;
    var height = width / 2;
    var typeDim = ndx.dimension(dc.pluck('Crime type'));
    var typeGroup = typeDim.group();

    var middle = width / 2;

    dc.pieChart('#crimeType')
        .width(width)
        .height(height)
        .radius(100)
        .innerRadius(50)
        .externalRadiusPadding(5)
        .transitionDuration(1500)
        .cx([width / 4])
        .ordinalColors(colorPie)
        .dimension(typeDim)
        .group(typeGroup)
        .renderLabel(false)
        .title(function (d) {
            return d.value;
        })
        .legend(dc.legend().x(middle).y(10).itemHeight(height / 20).gap(3))
        .useViewBoxResizing(true);
}

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
        .colors(colorRow)
        .gap(1.2)
        .elasticX(true)
        .cap(9)
        .useViewBoxResizing(true);
}

// Total crimes in each month bar chart
function monthTotal(ndx) {
    var chart = dc.barChart("#monthTotal");
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
        .ordinalColors(['#f67280', '#355c7d'])
        .dimension(monthDim)
        .group(monthGroup)
        .transitionDuration(500)
        .renderHorizontalGridLines(true)
        .useViewBoxResizing(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Outcome Of Month")
        .elasticY(true)
        .yAxis().ticks(10);
}