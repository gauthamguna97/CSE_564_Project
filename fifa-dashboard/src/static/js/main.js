// console.log = () => {}
var globalfilter = {
    'year': 2022
}

const loadData = (year) => {
    if (!year) return;
    globalfilter = {
        'year': window.year || year || 2022
    }
    var url = 'http://127.0.0.1:5005'
    fetch(url + '/fetchdata', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(globalfilter),
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


window.onload = () => {
    console.log("window loaded")
    loadData(2022);
}

// function reloadPage() {
//     globalfilter = {
//         'year': 2022
//     }
//     loadData(2022)
// }
document.getElementById("resetButton").addEventListener("click", (e) => {
    loadData(2022);
    e.stopPropagation();
})

