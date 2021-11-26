let dataset = [];
const DATASET_PATH = "data/nypd-dataset-extended.csv";
let law_data = {
  Felony: 0,
  Misdemeanor: 0,
  Violation: 0,
};
let location_data = {};
let crime_hourly_data = {};
let crime_share = 100;

let state = {
  s_age: "None",
  s_sex: "None",
  v_age: "None",
  v_sex: "None",
};

// SECTION Start
window.onload = function () {
  init();
};
// Global init function
function init() {
  loadData().then((result) => {
    dataset = result;
    preprocess();
    initMap();
  });
}

// SECTION Pre-processing
function preprocess() {
  resetFilters();
  filtered = dataset.filter(
    (row) =>
      (state.s_age != "None" ? row.SUSP_AGE_GROUP == state.s_age : row) &&
      (state.s_sex != "None" ? row.SUSP_SEX == state.s_sex : row) &&
      (state.v_age != "None" ? row.VIC_AGE_GROUP == state.v_age : row) &&
      (state.v_sex != "None" ? row.VIC_SEX == state.v_sex : row)
  );
  // Update Crime Share
  crime_share = parseInt((filtered.length / dataset.length) * 100);
  document.getElementById("crime_share").innerHTML = crime_share + "%";

  filtered.forEach((row) => {
    // Update Crimes by Law Category
    if (row.LAW_CAT_CD == "FELONY") {
      law_data["Felony"] += 1;
    } else if (row.LAW_CAT_CD == "MISDEMEANOR") {
      law_data["Misdemeanor"] += 1;
    } else {
      law_data["Violation"] += 1;
    }

    // Update Top Crime Locations
    if (row.PREM_TYP_DESC in location_data) {
      location_data[row.PREM_TYP_DESC] += 1;
    } else {
      location_data[row.PREM_TYP_DESC] = 0;
    }
  });
  updateCrimesByLawChart(law_data);
  let top_location_data = Object.keys(location_data)
    .map((key) => {
      return [key, location_data[key]];
    })
    .sort((first, second) => {
      return second[1] - first[1];
    });
  updateCrimesBylocationChart(top_location_data.slice(0, 4));
}

// Loading the data in a JS Promise
function loadData() {
  return new Promise((resolve, reject) => {
    d3.csv(DATASET_PATH).then(function (data) {
      resolve(data);
    });
  });
}

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

function updateSuspectAge(value) {
  state.s_age = value;
  preprocess();
}
function updateVictimAge(value) {
  state.v_age = value;
  preprocess();
}
function updateSuspectSex(value) {
  state.s_sex = value;
  preprocess();
}
function updateVictimSex(value) {
  state.v_sex = value;
  preprocess();
}
function resetFilters() {
  law_data = {
    Felony: 0,
    Misdemeanor: 0,
    Violation: 0,
  };
  location_data = {};
  crime_hourly_data = {};
}

// NOTE Crimes by Offence Category SVG
const locationChart = {
  margin: {},
  width: 0,
  height: 0,
  svg: {},
  x: {},
  xAxis: {},
  y: {},
  yAxis: {},
};

locationChart.margin = { top: 10, right: 5, bottom: 20, left: 23 };
locationChart.width =
  document.getElementById("crimes-by-location-chart").clientWidth -
  locationChart.margin.left -
  locationChart.margin.right;
locationChart.height =
  document.getElementById("crimes-by-location-chart").clientHeight -
  (locationChart.margin.top + locationChart.margin.bottom);

// NOTE Crimes by Law Category SVG
const lawChart = {
  margin: {},
  width: 0,
  height: 0,
  svg: {},
  x: {},
  xAxis: {},
  y: {},
  yAxis: {},
};

lawChart.margin = { top: 10, right: 5, bottom: 20, left: 23 };
lawChart.width =
  document.getElementById("crimes-by-law-chart").clientWidth -
  lawChart.margin.left -
  lawChart.margin.right;
lawChart.height =
  document.getElementById("crimes-by-law-chart").clientHeight -
  lawChart.margin.top -
  lawChart.margin.bottom;

// Create the SVG object for Location Chart
locationChart.svg = d3
  .select("#crimes-by-location-chart")
  .append("svg")
  .attr(
    "width",
    locationChart.width + locationChart.margin.left + locationChart.margin.right
  )
  .attr(
    "height",
    locationChart.height +
      locationChart.margin.top +
      locationChart.margin.bottom
  )
  .append("g")
  .attr(
    "transform",
    `translate(${locationChart.margin.left},${locationChart.margin.top})`
  );

// Create X axis
locationChart.x = d3.scaleBand().range([0, locationChart.width]).padding(0.2);
locationChart.xAxis = locationChart.svg
  .append("g")
  .attr("transform", `translate(0,${locationChart.height})`);

//Create Y axis
locationChart.y = d3.scaleLinear().range([locationChart.height, 0]);
locationChart.yAxis = locationChart.svg
  .append("g")
  .attr("class", "yAxis")
  .style("font-size", "9px");

// Update
function updateCrimesBylocationChart(filteredData) {
  let data = filteredData.map((entry) => {
    return { attr: entry[0], value: entry[1] };
  });
  // X axis
  locationChart.x.domain(data.map((d) => d.attr));
  locationChart.xAxis
    .transition()
    .duration(1000)
    .call(d3.axisBottom(locationChart.x));

  // Y axis
  locationChart.y.domain([0, d3.max(data, (d) => +d.value)]);
  locationChart.yAxis
    .transition()
    .duration(1000)
    .call(
      d3
        .axisLeft(locationChart.y)
        .scale(locationChart.y)
        .tickSize(1)
        .tickFormat(function (d) {
          if (d / 1000 >= 1) {
            d = d / 1000 + "K";
          }
          return d;
        })
    );

  const k = locationChart.svg.selectAll("rect").data(data);
  k.join("rect")
    .attr("x", (d) => locationChart.x(d.attr))
    .attr("width", locationChart.x.bandwidth())
    .attr("fill", "#C9BEFF")
    .transition()
    .duration(1000)
    .attr("y", (d) => locationChart.y(d.value))
    .attr("height", (d) => locationChart.height - locationChart.y(d.value))
    .attr("fill", "#7259FF");
}

// Create the SVG object
lawChart.svg = d3
  .select("#crimes-by-law-chart")
  .append("svg")
  .attr("width", lawChart.width + lawChart.margin.left + lawChart.margin.right)
  .attr(
    "height",
    lawChart.height + lawChart.margin.top + lawChart.margin.bottom
  )
  .append("g")
  .attr(
    "transform",
    `translate(${lawChart.margin.left},${lawChart.margin.top})`
  );

// Create X axis
lawChart.x = d3.scaleBand().range([0, lawChart.width]).padding(0.2);
lawChart.xAxis = lawChart.svg
  .append("g")
  .attr("transform", `translate(0,${lawChart.height})`);

//Create Y axis
lawChart.y = d3.scaleLinear().range([lawChart.height, 0]);
lawChart.yAxis = lawChart.svg
  .append("g")
  .attr("class", "yAxis")
  .style("font-size", "9px");

// Update
function updateCrimesByLawChart(filteredData) {
  let data = [];
  for (let key in filteredData) {
    data.push({ attr: key, value: filteredData[key] });
  }
  // X axis
  lawChart.x.domain(data.map((d) => d.attr));
  lawChart.xAxis.transition().duration(1000).call(d3.axisBottom(lawChart.x));

  // Y axis
  lawChart.y.domain([0, d3.max(data, (d) => +d.value)]);
  lawChart.yAxis
    .transition()
    .duration(1000)
    .call(
      d3
        .axisLeft(lawChart.y)
        .scale(lawChart.y)
        .tickSize(1)
        .tickFormat(function (d) {
          if (d / 1000 >= 1) {
            d = d / 1000 + "K";
          }
          return d;
        })
    );

  const u = lawChart.svg.selectAll("rect").data(data);
  u.join("rect")
    .attr("x", (d) => lawChart.x(d.attr))
    .attr("width", lawChart.x.bandwidth())
    .attr("fill", "#C9BEFF")
    .transition()
    .duration(1000)
    .attr("y", (d) => lawChart.y(d.value))
    .attr("height", (d) => lawChart.height - lawChart.y(d.value))
    .attr("fill", "#7259FF");
}
