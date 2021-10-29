// set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 40, left: 40 },
  width = 500 - margin["left"] - margin["right"],
  height = 480 - margin["top"] - margin["bottom"];

// append the svg object to the body of the page
const svg = d3
  .select("#mds_correlation")
  .append("svg")
  .attr("width", width + margin["left"] + margin["right"])
  .attr("height", height + margin["top"] + margin["bottom"])
  .append("g")
  .attr("transform", `translate(${margin["left"]},${margin["top"]})`);

// Load the dataset
d3.csv("../processed/mds-display-correlation-data.csv").then(function (data) {
  const xAxis = d3.scaleLinear().domain([-1, 1]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xAxis));

  const yAxis = d3.scaleLinear().domain([-1, 1]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(yAxis));

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 20)
    .attr("font-size", 12)
    .text("x-axis");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("font-size", 12)
    .attr("y", -margin["left"] + 20)
    .attr("x", -margin["top"] - height / 2 + 20)
    .text("y-axis");

  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cx", function (d) {
      return xAxis(d.x);
    })
    .attr("cy", function (d) {
      return yAxis(d.y);
    })
    .attr("r", 5)
    .style("fill", "red");

  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (d) => xAxis(d.x))
    .attr("y", (d) => height - xAxis(d.y))
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .text((d) => d.attr);
});
