const margin = { top: 20, right: 30, bottom: 30, left: 30 },
  width = 500 - margin["left"] - margin["right"],
  height = 480 - margin["top"] - margin["bottom"];

const svg = d3
  .select("#biplot")
  .append("svg")
  .attr("height", height + margin["top"] + margin["bottom"])
  .attr("width", width + margin["left"] + margin["right"])
  .append("g")
  .attr("transform", `translate(${margin["left"]},${margin["top"]})`);

// Load the dataset
d3.csv("../processed/biplot-data.csv").then(function (data) {
  const xAxis = d3
    .scaleLinear()
    .domain([
      d3.min(data, function (d) {
        return +d.x;
      }),
      d3.max(data, function (d) {
        return +d.x;
      }),
    ])
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xAxis));

  const yAxis = d3
    .scaleLinear()
    .domain([
      d3.min(data, function (d) {
        return +d.y;
      }),
      d3.max(data, function (d) {
        return +d.y;
      }),
    ])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(yAxis));

  svg
    .selectAll("mylines")
    .data(data)
    .enter()
    .append("line")
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 1.0)
    .attr("x1", xAxis(0))
    .attr("y1", yAxis(0))
    .attr("x2", (d) => xAxis(d.x))
    .attr("y2", (d) => yAxis(d.y));
  svg
    .append("g")
    .selectAll("line")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (d) => xAxis(d.x))
    .attr("y", (d) => yAxis(d.y))
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .text((d) => d.attr);
});
