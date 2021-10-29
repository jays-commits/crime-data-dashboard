function buildPCA() {
  const margin = { top: 20, right: 30, bottom: 30, left: 60 },
    width = 600 - margin["left"] - margin["right"],
    height = 580 - margin["top"] - margin["bottom"];

  const svg = d3
    .select("#PCA")
    .append("svg")
    .attr("height", height + margin["top"] + margin["bottom"])
    .attr("width", width + margin["left"] + margin["right"])
    .append("g")
    .attr("transform", `translate(${margin["left"]},${margin["top"]})`);

  // Load the data
  local = "../processed/pca-plot-data.csv";
  d3.csv(local).then(function (data) {
    const xAxis = d3.scaleLinear().domain([-3.5, 3.5]).range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height / 2})`)
      .call(d3.axisBottom(xAxis));

    const yAxis = d3.scaleLinear().domain([-3.5, 3.5]).range([height, 0]);
    svg
      .append("g")
      .attr("transform", `translate(${width / 2}, 0)`)
      .call(d3.axisLeft(yAxis));

    svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .join("circle")
      .attr("cx", function (d) {
        return xAxis(d.PC1);
      })
      .attr("cy", function (d) {
        return yAxis(d.PC2);
      })
      .attr("r", 1.5)
      .style("fill", "red")
      .style("opacity", 0.5);
  });
}
//Screeplot
function buildScreePlot() {
  const margin = { top: 20, right: 30, bottom: 70, left: 70 },
    width = 600 - margin["left"] - margin["right"],
    height = 480 - margin["top"] - margin["bottom"];

  const svg = d3
    .select("#screeplot")
    .append("svg")
    .attr("height", height + margin["top"] + margin["bottom"])
    .attr("width", width + margin["left"] + margin["right"])
    .append("g")
    .attr("transform", `translate(${margin["left"]},${margin["top"]})`);

  // Load the Dataset
  d3.csv("../processed/scree-plot-data.csv").then(function (data) {
    const xAxis = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.PC))
      .padding(0.2);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xAxis))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    const yAxis = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(yAxis));

    svg
      .selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xAxis(d.PC))
      .attr("y", (d) => yAxis(d.variance))
      .attr("width", xAxis.bandwidth())
      .attr("height", (d) => height - yAxis(d.variance))
      .attr("fill", "purple");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr("transform", "rotate(-90)")
      .attr("x", -margin["top"] - height / 2 + 20)
      .attr("y", -margin["left"] + 20)
      .text("Percentage (%)");
  });
}

buildPCA();
buildScreePlot();
