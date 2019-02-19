queue()
    .defer(d3.csv, "data/201801HertfordshireStreet.csv")
    .await(makeGraphs);

function makeGraphs(error, crimeData) {
    var ndx = crossfilter(crimeData);

    crime_location(ndx);
    crime_type(ndx);
    crime_area(ndx);
    crime_outcome(ndx);

    dc.renderAll();
}

function crime_type(ndx) {
    var type_dim = ndx.dimension(dc.pluck('Crime type'));
    var type_group = type_dim.group();

    dc.pieChart('#crimeType')
        .height(430)
        .radius(290)
        .transitionDuration(1500)
        .dimension(type_dim)
        .group(type_group);
}

function crime_outcome(ndx) {
    var outcome_dim = ndx.dimension(dc.pluck('Last outcome category'));
    var outcome_group = outcome_dim.group();

    dc.barChart("#crimeOutcome")
        .width(1200)
        .height(500)
        .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        })
        .dimension(outcome_dim)
        .group(outcome_group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Outcome Of Crime")
        .yAxis().ticks(20);
}

function crime_location(ndx) {
    var location_dim = ndx.dimension(dc.pluck('Location'));
    var location_group = location_dim.group();

    dc.barChart("#crimeLocation")
        .width(1200)
        .height(500)
        .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        })
        .dimension(location_dim)
        .group(location_group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Location Of Crime")
        .yAxis().ticks(20);
}

function crime_area(ndx) {
    var area_dim = ndx.dimension(dc.pluck('LSOA name'));
    var area_group = area_dim.group();
    dc.barChart("#crimeArea")
        .width(1200)
        .height(500)
        .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        })
        .dimension(area_dim)
        .group(area_group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Area of crime")
        .elasticY(true)
        .yAxis().ticks(20);


}