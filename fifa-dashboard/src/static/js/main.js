window.onload = () => {
    console.log("window loaded")
    var url = 'http://127.0.0.1:5005'
    fetch(url + '/fetchdata', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: 'all' }),
    })
        .then(data => data.json())
        .then(response => {
            // plot_table(response.data)
            // var attributes = response.data.map(d => d["Attributes"]);
            // plot_scatter(attributes);
            GeoMap(response.geoData)
            plotSunBurst(response.sunburst)
            BarChart(JSON.parse(response.data))
            // GeoMap(response.geoData)
        });
    // barchart()
    // GeoMap()
    // PcpChart()
    // slider()
    // sunburst()
}