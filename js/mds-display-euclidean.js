const margin = { top: 20, right: 30, bottom: 40, left: 40 },
  width = 500 - margin["left"] - margin["right"],
  height = 480 - margin["top"] - margin["bottom"];

const svg = d3
  .select("#mds_euclidean")
  .append("svg")
  .attr("height", height + margin["top"] + margin["bottom"])
  .attr("width", width + margin["left"] + margin["right"])
  .append("g")
  .attr("transform", `translate(${margin["left"]},${margin["top"]})`);

// Load the dataset
d3.csv("../processed/mds-display-euclidean-data.csv").then(function (data) {
  const xAxis = d3.scaleLinear().domain([-30, 30]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xAxis));

  const yAxis = d3.scaleLinear().domain([-30, 30]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(yAxis));

  svg
    .append("text")
    .attr("x", width / 2 + margin["left"])
    .attr("text-anchor", "end")
    .attr("font-size", 12)
    .attr("y", height + margin["top"] + 20)
    .text("x-axis");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("font-size", 12)
    .attr("transform", "rotate(-90)")
    .attr("x", -margin["top"] - height / 2 + 20)
    .attr("y", -margin["left"] + 20)
    .text("y-axis");

  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cy", function (d) {
      return yAxis(d.y);
    })
    .attr("cx", function (d) {
      return xAxis(d.x);
    })
    .style("fill", "red")
    .attr("r", 2);
});
