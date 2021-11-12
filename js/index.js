initMap();
updateCrimesByOffenseChart("var1");

function initMap() {
  const accessToken =
    "pk.eyJ1IjoiamFuYXJvc21vbmFsaWV2IiwiYSI6ImNra2lkZmFqMzAzbzEydnM2ZWpjamJ5MnMifQ.0njPGy4UD3K-ZDq3M7e9ZA";

  var map = L.map("leaflet-map").setView([40.73, -73.99], 12.5);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
      accessToken,
    {
      id: "mapbox/dark-v9",
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(map);
}

const margin = { top: 10, right: 5, bottom: 20, left: 15 };
const width =
  document.getElementById("crimes-by-offense-chart").clientWidth -
  margin.left -
  margin.right;
const height =
  document.getElementById("crimes-by-offense-chart").clientHeight -
  margin.top -
  margin.bottom;

// Create the SVG object
const svg = d3
  .select("#crimes-by-offense-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Create X axis
const x = d3.scaleBand().range([0, width]).padding(0.1);
const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);

//Create Y axis
const y = d3.scaleLinear().range([height, 0]);
const yAxis = svg.append("g").attr("class", "yAxis");

// NOTE This is for other bar chart
// Create the SVG object

function updateCrimesByOffenseChart(selectedData) {
  d3.csv("../data/dummy-data.csv").then(function (data) {
    // X axis
    x.domain(data.map((d) => d.group));
    xAxis.transition().duration(1000).call(d3.axisBottom(x));

    // Y axis
    y.domain([0, d3.max(data, (d) => +d[selectedData])]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    const u = svg.selectAll("rect").data(data);
    u.join("rect")
      .transition()
      .duration(1000)
      .attr("x", (d) => x(d.group))
      .attr("y", (d) => y(d[selectedData]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d[selectedData]))
      .attr("fill", "#69b3a2");
  });
}
