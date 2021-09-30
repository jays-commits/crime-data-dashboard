const DATASET_PATH =
  "data/NYPD_Complaint_Data_Current__Year_To_Date_Reduced.csv";
let dataset = [];
let precinct = [];
let law = [];
let offence = [];
let victim = { age: [], race: [], sex: [] };
let suspect = { age: [], race: [], sex: [] };
let scatterplot = [];
init();

function init() {
  loadData().then((result) => {
    dataset = result;
    preprocess();
    renderPrecinct();
  });
}

// Render d3.js charts
function renderPrecinct() {
  width = document.getElementById("pills-precinct").clientWidth;
  height = 400;
  const svg = d3
    .select("#precinct")
    .attr("width", width)
    .attr("height", height)
    .attr("overflow", "visible")
    .attr("viewbox", [0, 0, width, height]);

  const x = d3
    .scaleBand()
    .domain(d3.range(precinct.length))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleBand()
    .domain([
      0,
      d3.max(
        precinct.map((e) => {
          return e.count;
        })
      ),
    ])
    .range([height, 0]);

  max = d3.max(
    precinct.map((e) => {
      return e.count;
    })
  );
  // prettier-ignore
  svg
    .append("g")
    .attr("fill", "royalblue")
    .selectAll("rect")
    .data(precinct.sort((a, b) => d3.descending(a.count, b.count)))
    .join("rect")
    	.attr("x", (d, i) => x(i))
    	.attr("y", (d) => {return (height) - ((height) * d.count / max)})
    	.attr("height", (d, i) => height * d.count / max)
    	.attr("width", x.bandwidth());

  // prettier-ignore
  svg
    .append("g")
    .attr("transform", `translate(0, ${height} )`)
    .call(d3.axisBottom(x).tickFormat((i) => precinct[i].attr))
    .attr("font-size", "10px")
    .append("text")
			.attr("y", 50)
			.attr("x", width/2+50)
			.attr("text-anchor", "end")
			.attr('font-size', 16)
			.attr("stroke", "black")
			.attr("fill", "black")
    	.text("Precinct number");
  // prettier-ignore
  svg
    .append("g")
    .call(d3.axisLeft(y).ticks(null, precinct.format))
    .attr("font-size", "12px")
    .append("text")
    	.text("Number of crimes")
			.attr("stroke", "black")
			.attr("fill", "black")
			.attr("transform", "rotate(-90)")
			.attr('x', -height/3)
			.attr('y', -50)
			.attr('font-size', 16)
			.attr("text-anchor", "end")

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
  for (var key in offence_data) {
    offence.push({ count: offence_data[key], attr: key });
  }
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
    suspect.age.push({ count: suspect_data.age[key], attr: key });
  }
  for (var key in suspect_data.race) {
    suspect.race.push({ count: suspect_data.race[key], attr: key });
  }
  for (var key in suspect_data.sex) {
    suspect.sex.push({ count: suspect_data.sex[key], attr: key });
  }
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
