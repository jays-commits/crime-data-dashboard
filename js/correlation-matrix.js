const margin = { top: 20, right: 30, bottom: 60, left: 65 },
  width = 500 - margin["left"] - margin["right"],
  height = 480 - margin["top"] - margin["bottom"];

const svg = d3
  .select("#correlation")
  .append("svg")
  .attr("width", width + margin["left"] + margin["right"])
  .attr("height", height + margin["top"] + margin["bottom"])
  .append("g")
  .attr("transform", `translate(${margin["left"]},${margin["top"]})`);

// Load the dataset
local = "../processed/correlation-matrix-data.csv";
d3.csv(local).then(function (data) {
  for (var i = 0; i < data.length; i++) {
    let value = parseInt(data[i].correlation);
    data[i].correlation = value < 90 ? value + 10 : value;
  }

  const attributes = Array.from(new Set(data.map((d) => d.attribute)));
  const compared = Array.from(new Set(data.map((d) => d.compared)));
  compared.reverse();

  const xAxis = d3
    .scaleBand()
    .range([0, width])
    .domain(attributes)
    .padding(0.05);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .style("font-size", 10)
    .call(d3.axisBottom(xAxis).tickSize(0))
    .select(".domain")
    .remove();

  const yAxis = d3
    .scaleBand()
    .range([height, 0])
    .domain(compared)
    .padding(0.05);
  svg
    .append("g")
    .style("font-size", 10)
    .call(d3.axisLeft(yAxis).tickSize(0))
    .select(".domain")
    .remove();

  const getColorIntensity = d3
    .scaleSequential()
    .interpolator(d3.interpolatePurples)
    .domain([1, 100]);

  svg
    .selectAll()
    .data(data, function (d) {
      return d.attribute + ":" + d.compared;
    })
    .join("rect")
    .attr("x", function (d) {
      return xAxis(d.attribute);
    })
    .attr("y", function (d) {
      return yAxis(d.compared);
    })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", xAxis.bandwidth())
    .attr("height", yAxis.bandwidth())
    .style("fill", function (d) {
      return getColorIntensity(d.correlation);
    })
    .style("stroke-width", 4)
    .style("stroke", "none");
});
