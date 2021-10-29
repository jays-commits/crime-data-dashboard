// set the dimensions and margins of the graph
const margin = { top: 20, right: 0, bottom: 10, left: 0 },
  width = 700 - margin["left"] - margin["right"],
  height = 450 - margin["top"] - margin["bottom"];

const svg = d3
  .select("#parallel-coordinates")
  .append("svg")
  .attr("height", height + margin["top"] + margin["bottom"])
  .attr("width", width + margin["left"] + margin["right"])
  .append("g")
  .attr("transform", `translate(${margin["left"]},${margin["top"]})`);

// Load gthe dataset
local = "../processed/parallel-coordinates-data.csv";
d3.csv(local).then(function (data) {
  dimensions = Object.keys(data[0]);

  const yAxis = {};
  // SUSPECT AGE
  yAxis[dimensions[0]] = d3
    .scaleOrdinal()
    .domain(["<18", "18-24", "25-44", "45-64", "65+"])
    .range(getRange(height, 0, 5));
  // VICTIM AGE
  yAxis[dimensions[1]] = d3
    .scaleOrdinal()
    .domain(["<18", "18-24", "25-44", "45-64", "65+"])
    .range(getRange(height, 0, 5));
  // SUSPECT SEX
  yAxis[dimensions[2]] = d3
    .scaleOrdinal()
    .domain(["M", "F"])
    .range(getRange(height, 0, 2));
  // VICTIM SEX
  yAxis[dimensions[3]] = d3
    .scaleOrdinal()
    .domain(["M", "F"])
    .range(getRange(height, 0, 2));
  // CRIME LAW
  yAxis[dimensions[4]] = d3
    .scaleOrdinal()
    .domain(["FELONY", "MISDEMEANOR", "VIOLATION"])
    .range(getRange(height, 0, 3));
  // DAY OF MONTH
  let domain_month = Array.from({ length: 10 }, (_, i) => i + 1);
  yAxis[dimensions[5]] = d3
    .scaleOrdinal()
    .domain([1, 31])
    .range(getRange(height, 0, 31));
  // MONTH
  yAxis[dimensions[6]] = d3
    .scaleOrdinal()
    .domain([1, 12])
    .range(getRange(height, 0, 12));
  // PRECINCT
  yAxis[dimensions[7]] = d3
    .scaleOrdinal()
    .domain([[1, 34]])
    .range(getRange(height, 0, 22));

  xAxis = d3.scalePoint().range([0, width]).padding(1).domain(dimensions);

  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [xAxis(p), yAxis[p](d[p])];
      })
    );
  }
  svg
    .selectAll("thePath")
    .data(data)
    .join("path")
    .attr("d", path)
    .style("fill", "none")
    .style("width", "2px")
    .style("stroke", "red")
    .style("opacity", 0.05);

  svg
    .selectAll("myAxis")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + xAxis(d) + ")";
    })
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().scale(yAxis[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) {
      return d;
    })
    .style("fill", "purple");
});

function getRange(start, end, steps) {
  let array = new Array(steps);
  array.fill(start);
  if (start < end) {
    var step = parseInt((end - start) / (steps - 1));
    for (let i = 0; i < steps; i++) {
      array[i] = array[i] + i * step;
    }
  } else {
    var step = parseInt((start - end) / (steps - 1));
    for (let i = 0; i < steps; i++) {
      array[i] = array[i] - i * step;
    }
  }
  return array;
}
