window.onload = () => {
    console.log("window loaded")
    loadData();
}

const loadData = () => {
    var url = 'http://127.0.0.1:5005'
    fetch(url + '/fetchdata', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ val: 'all' }),
    })
        .then(data => data.json())
        .then(response => {
            // plot_table(response.data)
            // var attributes = response.data.map(d => d["Attributes"]);
            // plot_scatter(attributes);
            var data = JSON.parse(response.data)
            GeoMap(response.geoData, data)
            plotSunBurst(response.sunburst, data)
            // var ndata = data.filter(s => s.nationality_name == "Brazil")
            BarChart(data, [])
            wordCloud(response.wordcloud)
            // PcpChart(data)
            PcpChart(response.pcpdata,d3.keys(response.pcpdata[0]))
            // GeoMap(response.geoData)
            setTimeout(() => {
                document.getElementById('loader').style.display = 'none'
                document.getElementById('wholebody').style.display = 'block'
            }, 1000)
    });
}