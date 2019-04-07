# Hertfordshire Street Level Crime Dashboard #

This project it set visually display the data gathered by the Police Force in Hertfordshire (the county I live in) showing the amount, location and outcomes of street level crimes from Januray to December 2018. The aim of this dashboard to to share the data in a visual manner to those who may be interested.

## UX
[Mock up of site](CrimeDashboardLayout.png)

## Features

- Total overvew of all reported crimes in hertfordshire
- Map of the different regions in the county, with figures of how may reports i neach region
- Chart to display the types of crimes reported
- Chart displaying the total of each outcome for all reports
- Chart to display how many reports per month
- Slection to to filter by month
- Reset button to reset the dashboard to default

## Technologies Used

- [HTML](https://www.w3schools.com/html)
    - This is used for the main structre of the web page
- [CSS](https://www.w3schools.com/css)
    - This is used fot the main styling of the web page
- [JavaScript](https://www.w3schools.com/js/))
    - This is used for the main interctivity of the webpage
- [D3.js](https://d3js.org/)
    - This is a libaray used to create and render charts using SVG elements to display data in a visual format
- [DC.js](https://dc-js.github.io/dc.js/)
    - This is used to compliment D3.js and creat better looking interactive charts, give a rich depth of user interactivity, allowing them to see different data.
- [Crossfilter.js](http://square.github.io/crossfilter/)
    - This is used with D3 and DC to filter data, group it in particular groups and show user selected data.
- [Queue.js](https://github.com/d3/d3-queue)
    - This is used to queue data sets and load them into DC/D3
- [Bootstrap](https://getbootstrap.com/)
    - CSS and JS libray for quick and reliable responsive websites.
- [Spin.js](https://spin.js.org/)
    - Used to creat the spinner while the data is being loaded.

## Testing


## Deployment

The dashboard has been deployed on Git Hub Pages:
[Link to the dasboard](https://samuelwatson89.github.io/crimeDataDashboard/)
Only a single version has been worked on in the master branch

## Credits


### Content

Data used has been supplied by [Police Database](https://data.police.uk/)

### Acknowledgements
[Emma Saunders](https://www.lynda.com/Emma-Saunders/7094528-1.html) & [Ray Villalobos](https://www.lynda.com/Ray-Villalobos/832401-1.html) on [Lynda.com](https://www.lynda.com) for the uploaded tutorials which assisted in explaining D3, DC and Crossfilter.