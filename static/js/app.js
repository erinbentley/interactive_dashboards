function buildMetadata(sample) {

  // Use `d3.json` to fetch the metadata for a sample
  let metadataURL = "/metadata/" + sample;
  // Use d3 to select the panel with id of `#sample-metadata`
  let panelMetadata = d3.select("#sample-metadata");
  // Use `.html("") to clear any existing metadata
  panelMetadata.html("");
  // Use `Object.entries` to add each key and value pair to the panel
  // Hint: Inside the loop, you will need to use d3 to append new
  // tags for each key-value in the metadata.
  d3.json(metadataURL).then(function (data) {
    Object.entries(data).forEach(([key, value]) => {
      panelMetadata.append("h5").text(`${key}: ${value}`);
    });
    
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);

    let GCdata = [{domain: {x: [0, 1], y: [0, 1]}, value: data.WFREQ,
    title: {text: "Belly Button Washing Frequency Scrubs Per Week", font: {size: 14}},
    type: "indicator", mode: "gauge+number+delta",
    delta: {reference: 9, increasing: {color: "green"}},
    gauge:
      {axis: {range: [0, 10]}, steps: [{range: [0, 5], color: "lightgray"},
      {range: [5, 8], color: "gray"}], threshold: {line: {color: "red", width: 4},
      thickness: 0.75, value: 9}}}];

    let gaugeLayout = {width: 400, height: 500, margin: {t: 0, b: 0}};
    Plotly.newPlot("gauge", GCdata, gaugeLayout);

  });

}
var dataVal;
function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots
  let chartsURL = "/samples/" + sample;
  d3.json(chartsURL).then((data) => {
    // Build a Bubble Chart using the sample data
    let trace1 = [{
      x: data.otu_ids,
      y: data.sample_values,
      mode: 'markers',
      text: data.otu_labels,
      marker: {
        color: data.otu_ids,
        size: data.sample_values,
        colorscale: "Earth"
      }
    }];
    let layout = {
      title: "OTU ID",
      showlegend: false,
      height: 600,
      width: 1500
    };
    Plotly.newPlot("bubble", trace1, layout);
    
    // Build a Pie Chart
    // Use slice() to grab the top 10 sample_values
    let beforeData = data.otu_ids.map((e, i) => [e,data.otu_labels[i],data.sample_values[i]])
    beforeData.sort((a,b) =>  b[2] - a[2])
    let afterData = beforeData.slice(0,10)
    let sampleValues = []
    let otuIds = []
    let otuLabels = []
    afterData.forEach((e) => {otuIds.push(e[0]), otuLabels.push(e[1]), sampleValues.push(e[2])})

    let trace2 = [{
      values: sampleValues,
      labels: otuIds,
      hovertext: otuLabels,
      type: "pie",
      marker: {
        colorscale: "Earth"
      }
    }];
    let layout2 = {
      showlegend: true,
      height: 400,
      width: 500
    };
    Plotly.newPlot("pie", trace2, layout2);

  })
}

function init() {
  // Grab a reference to the dropdown select element
  let selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    console.log(firstSample)
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
