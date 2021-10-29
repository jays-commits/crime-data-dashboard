// set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 30, left: 30 },
  width = 200 - margin["left"] - margin["right"],
  height = 180 - margin["top"] - margin["bottom"];

// append the svg object to the body of the page
const svg = d3
  .select("#scatterplot")
  .append("svg")
  .attr("height", height + margin["top"] + margin["bottom"])
  .attr("width", width + margin["left"] + margin["right"])
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the dataset
let local = "../processed/dummy-data.csv";
var dy = height / 4;
var dx = width / 4;
d3.csv(local).then(function (data) {
  const xAxis = d3
    .scaleOrdinal()
    .domain(
      data.map((d) => {
        return d.attribute;
      })
    )
    .range([0, dx, dx * 2, dx * 3, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xAxis));

  const yAxis = d3
    .scaleOrdinal()
    .domain(
      data.map((d) => {
        return d.compared;
      })
    )
    .range([height, dy * 3, dy * 2, dy, 0]);
  svg.append("g").call(d3.axisLeft(yAxis));

  const zAxis = d3.scaleLinear().domain([0, 10]).range([1, 10]);

  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cx", (d) => xAxis(d.attribute))
    .attr("cy", (d) => yAxis(d.compared))
    .attr("r", (d) => zAxis(d.value))
    .style("fill", "red")
    .style("opacity", "0.5");
});
