// Options for spin.js loader
var opts = {
    lines: 12, // The number of lines to draw
    length: 5, // The length of each line
    width: 4, // The line thickness
    radius: 13, // The radius of the inner circle
    scale: 1.7, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#355c7d', // CSS color or array of colors
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

// Spinner for loading data
var target = document.getElementById('loader');
var spinner = new Spinner(opts).spin(target);

//Queue data and wait for functions to execute and be called 
queue()
    .defer(d3.csv, "data/crimeData.csv") // Crime data
    .defer(d3.json, "data/hertfordshire.json") // Herts map data
    .await(makeGraphs); // wait for all graphs to render

// Call all chart functions
function makeGraphs(error, crimeData, mapJson) {
    var ndx = crossfilter(crimeData); // Run all data through crossfilter

    crimeType(ndx); // Type of crime pie chart
    crimeOutcome(ndx); // Outcome of crimes row chart
    totalCrime(ndx); // The total crimes selected, all by default
    crimeMap(ndx, mapJson); // Map of Hertfordshire
    crimeMonth(ndx); // Month selector
    monthTotal(ndx); // Total crimes per month in bar chart

    dc.renderAll(); // Render all the charts

    // Stop spinner and hidde overlay
    spinner.stop();
    document.getElementById('loader').style.visibility = 'hidden';
}

//Variable to condense region name from csv file, removing addiitonal numbers
var area = dc.pluck('LSOA name', function (d) {
    return d.split(" 0")[0];
});

// Color for chart colours
var colorRow = d3.scale.ordinal().range(['#355c7d', '#525f7d', '#6b637e', '#80667e', '#95697f', '#aa6b7f', '#bc6e7f', '#d16f80', '#e27180', '#f67280'].reverse()); // Set the color scale and reverse it
var colorMap = d3.scale.quantize().range(['#355c7d', '#525f7d', '#6b637e', '#80667e', '#95697f', '#aa6b7f', '#bc6e7f', '#d16f80', '#e27180', '#f67280']);
var colorPie = d3.schemeAccent;

// Total crime in number format, to display at the top of the page
function totalCrime(ndx) {
    var totalGroup = ndx.groupAll(); // Group all the data

    dc.numberDisplay('#totalCrime')
        .group(totalGroup)
        .formatNumber(d3.format(",")) // Format the number into comma seperated sections
        .valueAccessor(function (d) {
            return d;
        })
        .html({ // Set the display of the outcome, dependant of how many values are returned
            one: '%number Total Reported Crime',
            some: '%number Total reported Crimes',
            none: 'No Total To Display.'
        });
}

// Create a selector of Months for the whole year
function crimeMonth(ndx) {
    var monthDim = ndx.dimension(dc.pluck('Month'));
    var monthGroup = monthDim.group();

    dc.selectMenu('#monthSelect')
        .dimension(monthDim)
        .group(monthGroup)
        .title(function (d) {
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var month = d.key.split("-")[1];
            return (months[month - 1] + " 2018"); // Convert output from "2018-01" to January 2018
        })
        .multiple(true) // Multiple outputs to be rendered
        .numberVisible(13) // Amount of visible outputs, shows all months
        .promptText('All months')
        .useViewBoxResizing(true);
}

//Create map of hertfordshire
function crimeMap(ndx, mapJson) {
    var mapRegion = dc.geoChoroplethChart("#crimeMap"); //Chart
    var regions = ndx.dimension(area);
    var crimeSum = regions.group();
    var width = document.getElementById("one").offsetWidth; // Set the width to the continer the map is loaded to, sets the width properly on page load/refresh
    var height = 400; // Set solid height
    var centre = d3.geo.centroid(mapJson); // Center of map
    var middle = width / 2; // calculate where to position the map horizontaly within the container
    var hMiddle = height / 1.90; // calculate where to position the map verticaly within the container
    var scale = 25000 + (middle + width); // Scale the map to "zoom in" to hertfordshire
    var projection = d3.geo.mercator().center(centre).scale(scale).translate([middle, hMiddle]); // Ensure projection is suitable to display the UK/Europe

    mapRegion
        .width(width)
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
                .colorDomain([min, max]); // Ensure the map dispays the correct colors for Hi and Lo values when rendered
        })
        .on('preRender', function () {
            var max = crimeSum.top(1)[0].value;
            var min = crimeSum.top(9).reverse()[0].value;

            mapRegion
                .width(width)
                .height(height)
                .colorDomain([min, max]); // Ensure the map dispays the correct colors for Hi and Lo values when pre render
        })
        .on('preRedraw', function () {
            var max = crimeSum.top(1)[0].value;
            var min = crimeSum.top(9).reverse()[0].value;

            mapRegion
                .width(width)
                .height(height)
                .colorDomain([min, max]); // Ensure the map dispays the correct colors for Hi and Lo values when pre redraw
        })
        .overlayGeoJson(mapJson.features, "region", function (d) {
            return d.properties.lad17nm;
        })
        .useViewBoxResizing(true); // Allow the chart to scale when the screen size changes
}

// Type of crime in pie chart format
function crimeType(ndx) {
    var width = document.getElementById("two").offsetWidth;
    var height = width / 1.6;
    var typeDim = ndx.dimension(dc.pluck('Crime type'));
    var typeGroup = typeDim.group();
    var middle = width / 2; // Calculate where middle of the container

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
        .legend(dc.legend().x(middle).y(10).itemHeight(height / 20).gap(3)) // Set the legend to dislay somewhat responsivly.
        .useViewBoxResizing(true);
}

// Outcome of crime row chart
function crimeOutcome(ndx) {
    var width = document.getElementById("four").offsetWidth;
    var outcomeDim = ndx.dimension(dc.pluck('Last outcome category'));
    var outcomeGroup = outcomeDim.group();

    dc.rowChart("#crimeOutcome")
        .width(width)
        .height(width / 1.6)
        .label(function (d) { // 
            if (d.key === "") {
                return "No outcome recorded - ASB";
            }
            return d.key;
        })
        .dimension(outcomeDim)
        .group(outcomeGroup)
        .valueAccessor(function (p) {
            return p.value;
        })
        .colors(colorRow)
        .gap(1.2)
        .elasticX(true)
        .cap(9) // Set a cap on displayed data
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
        .height(width / 1.6)
        .margins({ // Set bar chart margins
            top: 10,
            right: 10,
            bottom: 30,
            left: 50
        })
        .ordinalColors(['#f67280', '#355c7d'])
        .dimension(monthDim)
        .group(monthGroup)
        .on('renderlet', (function (chart) {
            // rotate x-axis labels
            chart.selectAll('g.x text')
                .attr('transform', 'translate(-20,5) rotate(340)'); // Rotate the xAxis labels so they do not overlap
        }))
        .transitionDuration(500)
        .renderHorizontalGridLines(true) // Render grid lines for ease of reading
        .useViewBoxResizing(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis().ticks(10);
}