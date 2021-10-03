const DATASET_PATH =
  "data/NYPD_Complaint_Data_Current__Year_To_Date_Reduced.csv";
let dataset = [];
let precinct = [];
let law = [];
let law_pie = {};
let offence = [];
let offence_pie = {};
let victim = {
  age: [],
  race: [],
  sex: [],
  age_pie: {},
  race_pie: {},
  sex_pie: {},
};
let suspect = {
  age: [],
  race: [],
  sex: [],
  age_pie: {},
  race_pie: {},
  sex_pie: {},
};
let scatterplot = [];

window.onload = function () {
  init();
};

function init() {
  loadData().then((result) => {
    dataset = result;
    preprocess();
    render();
  });
}

// prettier-ignore
function render() {
  var width = document.getElementById("pills-precinct").clientWidth;
  var small = width / 2;
  renderBarChart("#precinct", precinct, "Precinct", "Crime Count", width);
  renderBarChart("#law", law, "Law Category", "Crime Count", width);
  renderBarChart("#offence", offence, "Offence Category", "Crime Count", width);
  renderPieChart("#law-pie-container", law_pie, width);
  renderPieChart("#offence-pie-container", offence_pie, width);

  renderBarChart("#victim-age", victim.age, "Age Group", "Crime Count", small);
  renderPieChart("#victim-age-pie", victim.age_pie, small);

  renderBarChart("#victim-sex",victim.sex,"Sex Group","Crime Count",small);
  renderPieChart("#victim-sex-pie", victim.sex_pie, small);

  renderBarChart("#victim-race",victim.race,"Race Group","Crime Count",small);
  renderPieChart("#victim-race-pie", victim.race_pie, small);

  renderBarChart("#suspect-age", suspect.age, "Age Group", "Crime Count", small);
  renderPieChart("#suspect-age-pie", suspect.age_pie, small);

  renderBarChart("#suspect-sex",suspect.sex,"Sex Group","Crime Count",small);
  renderPieChart("#suspect-sex-pie", suspect.sex_pie, small);

  renderBarChart("#suspect-race",suspect.race,"Race Group","Crime Count",small);
  renderPieChart("#suspect-race-pie", suspect.race_pie, small);

  renderScatterPlot('#scatterplot', scatterplot, width)

}

// Render a scatterplot
function renderScatterPlot(id, data, width) {
  let height = 600;
  const svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("overflow", "visible")
    .append("g")
    .attr("transform", `translate(${0}, ${0})`);

  const xAxis = d3.scaleLinear().domain([979216, 1016268]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xAxis));

  const yAxis = d3.scaleLinear().domain([194845, 257172]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(yAxis));

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
    .attr("r", 1)
    .style("fill", "red");
}

// Render a pie chart
function renderPieChart(id, data, width) {
  var height = 400;
  var radius = height / 2;

  var totalSum = Object.entries(data)
    .map((e) => e[1])
    .reduce((partial_sum, a) => partial_sum + a, 0);

  // prettier-ignore
  const svg = d3.select(id)
  .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('overflow', 'visible')
  .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);

  const color = d3
    .scaleOrdinal()
    .domain(Object.entries(data).map((e) => e[0]))
    .range(d3.schemeDark2);

  // Compute the position of each group on the pie:
  const pie = d3
    .pie()
    .sort(null) // Do not sort group by size
    .value((d) => d[1]);
  const data_ready = pie(Object.entries(data));

  // The arc generator
  const arc = d3
    .arc()
    .innerRadius(radius * 0.2) // This is the size of the donut hole
    .outerRadius(radius * 0.8);

  // Another arc that won't be drawn. Just for labels positioning
  const outerArc = d3
    .arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll("allSlices")
    .data(data_ready)
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data[1]))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  // Add the polylines between chart and labels:
  //prettier-ignore
  svg
    .selectAll("allPolylines")
    .data(data_ready)
    .join("polyline")
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", function (d) {
        const posA = arc.centroid(d); // line insertion in the slice
        const posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
        const posC = outerArc.centroid(d); // Label position = almost the same as posB
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC];
    });

  // Add the polylines between chart and labels:
  //prettier-ignore
  svg
    .selectAll("allLabels")
    .data(data_ready)
    .join("text")
      .text((d) => {return d.data[0] + ` (${Math.round(d.data[1]/totalSum*100)}%)`})
      .attr("transform", function (d) {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", function (d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      });
}
// Render a bar chart
function renderBarChart(id, data, xAxisText, yAxisText, width) {
  var height = 400;
  const svg = d3
    .select(id)
    .attr("width", width)
    .attr("height", height)
    .attr("overflow", "visible")
    .attr("viewbox", [0, 0, width, height]);

  const x = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(
        data.map((e) => {
          return e.count;
        })
      ),
    ])
    .range([height, 0]);

  max = d3.max(
    data.map((e) => {
      return e.count;
    })
  );

  // prettier-ignore
  svg
    .append("g")
    .attr("fill", "royalblue")
    .selectAll("rect")
    .data(data.sort((a, b) => d3.descending(a.count, b.count)))
    .join("rect")
    	.attr("x", (d, i) => x(i))
    	.attr("y", (d) => {return (height) - ((height) * d.count / max)})
    	.attr("height", (d, i) => height * d.count / max)
    	.attr("width", x.bandwidth())

  // prettier-ignore
  svg.append("g")
    .attr("transform", `translate(0, ${height} )`)
    .attr('class', 'xAxis')
    .call(d3.axisBottom(x).tickFormat((i) => data[i].attr))
    .attr("font-size", "14px")
    .append("text")
			.attr("y", -height+50)
			.attr("x", width/2)
			.attr("text-anchor", "middle")
			.attr('font-size', 16)
			.attr("stroke", "black")
			.attr("fill", "black")
    	.text(xAxisText)

  svg
    .selectAll(".xAxis g>text")
    .style("text-anchor", "end")
    .attr("transform", function (d) {
      return "translate(" + -15 + "," + 10 + ")rotate(-90)";
    });

  svg
    .append("g")
    .call(
      d3
        .axisLeft(y)
        .tickFormat(function (d) {
          return d;
        })
        .ticks(10)
    )
    .attr("font-size", "12px")
    .append("text")
    .text(yAxisText)
    .attr("stroke", "black")
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 3)
    .attr("y", -50)
    .attr("font-size", 16)
    .attr("text-anchor", "end");

  svg.node();
}

// Format the calculated data into a JS object array
function postprocess(
  precinct_data,
  law_data,
  offence_data,
  victim_data,
  suspect_data
) {
  for (var key in precinct_data) {
    precinct.push({ count: precinct_data[key], attr: key + "pct" });
  }
  for (var key in law_data) {
    law.push({ count: law_data[key], attr: key });
  }
  law_pie = law_data;

  // Combine small offences into OTHER category
  for (var key in offence_data) {
    offence.push({ count: offence_data[key], attr: key });
  }
  offence.sort((a, b) => {
    return a.count - b.count;
  });
  var otherCount = 0;
  for (var i = 0; i < 25; i++) {
    otherCount += offence[i].count;
  }
  offence = offence.slice(25, offence.length);
  offence.push({ count: otherCount, attr: "OTHER CRIMES" });
  offence.map((e) => {
    offence_pie[e.attr] = e.count;
  });

  for (var key in victim_data.age) {
    victim.age.push({ count: victim_data.age[key], attr: key });
  }
  for (var key in victim_data.race) {
    victim.race.push({ count: victim_data.race[key], attr: key });
  }
  for (var key in victim_data.sex) {
    victim.sex.push({ count: victim_data.sex[key], attr: key });
  }
  for (var key in suspect_data.age) {
    if (key === "2021") {
    } else suspect.age.push({ count: suspect_data.age[key], attr: key });
  }
  for (var key in suspect_data.race) {
    suspect.race.push({ count: suspect_data.race[key], attr: key });
  }
  for (var key in suspect_data.sex) {
    suspect.sex.push({ count: suspect_data.sex[key], attr: key });
  }
  victim.age_pie = victim_data.age;
  victim.race_pie = victim_data.race;
  victim.race_pie["OTHER"] =
    victim.race_pie["BLACK HISPANIC"] +
    victim.race_pie["AMERICAN INDIAN/ALASKAN NATIVE"];
  delete victim.race_pie["AMERICAN INDIAN/ALASKAN NATIVE"];
  delete victim.race_pie["BLACK HISPANIC"];
  victim.sex_pie = victim_data.sex;
  delete victim.sex_pie["D"];
  suspect.age_pie = suspect_data.age;
  delete suspect.age_pie["2021"];
  suspect.race_pie = suspect_data.race;
  suspect.race_pie["OTHER"] =
    suspect.race_pie["BLACK HISPANIC"] +
    suspect.race_pie["AMERICAN INDIAN/ALASKAN NATIVE"];
  delete suspect.race_pie["AMERICAN INDIAN/ALASKAN NATIVE"];
  delete suspect.race_pie["BLACK HISPANIC"];
  suspect.sex_pie = victim_data.sex;
  delete suspect.sex_pie["D"];
  suspect.sex_pie = suspect_data.sex;
  console.log("\x1b", "Post-processing is complete!");
}

// Calculate frequencies of attributes in a dataset
function preprocess() {
  let precinct_data = {};
  let law_data = {};
  let offence_data = {};
  let victim_data = { age: {}, race: {}, sex: {} };
  let suspect_data = { age: {}, race: {}, sex: {} };

  dataset.forEach((row) => {
    precinct_data[row.ADDR_PCT_CD] =
      precinct_data[row.ADDR_PCT_CD] === undefined
        ? 1
        : precinct_data[row.ADDR_PCT_CD] + 1;
    law_data[row.LAW_CAT_CD] =
      law_data[row.LAW_CAT_CD] === undefined ? 1 : law_data[row.LAW_CAT_CD] + 1;

    offence_data[row.OFNS_DESC] =
      offence_data[row.OFNS_DESC] === undefined
        ? 1
        : offence_data[row.OFNS_DESC] + 1;

    victim_data.age[row.VIC_AGE_GROUP] =
      victim_data.age[row.VIC_AGE_GROUP] === undefined
        ? 1
        : victim_data.age[row.VIC_AGE_GROUP] + 1;

    victim_data.race[row.VIC_RACE] =
      victim_data.race[row.VIC_RACE] === undefined
        ? 1
        : victim_data.race[row.VIC_RACE] + 1;

    victim_data.sex[row.VIC_SEX] =
      victim_data.sex[row.VIC_SEX] === undefined
        ? 1
        : victim_data.sex[row.VIC_SEX] + 1;

    suspect_data.age[row.SUSP_AGE_GROUP] =
      suspect_data.age[row.SUSP_AGE_GROUP] === undefined
        ? 1
        : suspect_data.age[row.SUSP_AGE_GROUP] + 1;

    suspect_data.race[row.SUSP_RACE] =
      suspect_data.race[row.SUSP_RACE] === undefined
        ? 1
        : suspect_data.race[row.SUSP_RACE] + 1;

    suspect_data.sex[row.SUSP_SEX] =
      suspect_data.sex[row.SUSP_SEX] === undefined
        ? 1
        : suspect_data.sex[row.SUSP_SEX] + 1;

    scatterplot.push({ x: row.X_COORD_CD, y: row.Y_COORD_CD });
  });
  console.log("\x1b", "Pre-processing is complete!");
  postprocess(precinct_data, law_data, offence_data, victim_data, suspect_data);
}

// Loading the data in a JS Promise
function loadData() {
  return new Promise((resolve, reject) => {
    d3.csv(DATASET_PATH).then(function (data) {
      resolve(data);
    });
  });
}
