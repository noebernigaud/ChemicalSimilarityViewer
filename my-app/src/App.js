import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import logo from './logo.svg';
import './App.css';

const ALLOWED_FILE = 'csv'

var selected_column;
var selected_columnName;
var jsonResult;
var myChart;

function App() {
  const [selectedFile, setSelectedFile] = useState();
  const [disable, setDisable] = useState(true);

  const changeHandler = (event) => {
    if (!event.target.files[0] || event.target.files[0].name.split('.')[1] != ALLOWED_FILE) {
      document.getElementById("graphMenu").innerHTML = "";
      document.getElementById("chartDiv").innerHTML = "The file extension is not correct, please submit a .csv file";
      return;
    }

    setSelectedFile(event.target.files[0]);
    setDisable(true)
    // let text = document.createTextNode("Select the column containing SMILES code")
    let text = document.createElement("p")
    text.innerHTML = "Select the column containing SMILES code"
    text.setAttribute("id", "selectionText");
    let strong = document.createElement("strong")
    let p = document.createElement("p")
    strong.appendChild(text)
    p.appendChild(strong)
    let reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = function () {
      document.getElementById("graphMenu").innerHTML = "";
      document.getElementById("chartDiv").innerHTML = "";
      document.getElementById("chartDiv").appendChild(p);
      document.getElementById("chartDiv").appendChild(jsonToHTMLTable(csvToJson(reader.result.split('\n').slice(0, 10).join('\n'))));
      select_column(setDisable)
    }


  };

  const handleSubmission = () => {
    if (!selectedFile || selectedFile.name.split('.')[1] != ALLOWED_FILE) return

    const formData = new FormData();
    formData.append('File', selectedFile);
    // var url = new URL("/file")
    // var params = { index: selected_column }
    // url.search = new URLSearchParams(params).toString();
    // console.log(url)
    var url = updateQueryStringParameter("/file", "index", selected_column)
    url = updateQueryStringParameter(url, "nameIndex", selected_columnName)
    var algo1 = + document.getElementById("algo1").checked
    var algo2 = + document.getElementById("algo2").checked
    url = updateQueryStringParameter(url, "algo1", algo1)
    url = updateQueryStringParameter(url, "algo2", algo2)
    var d1 = + document.getElementById("d1").checked
    var d2 = + document.getElementById("d2").checked
    var d3 = + document.getElementById("d3").checked
    url = updateQueryStringParameter(url, "d1", d1)
    url = updateQueryStringParameter(url, "d2", d2)
    url = updateQueryStringParameter(url, "d3", d3)
    createMenu([algo1, algo2, d1, d2, d3])
    fetch(
      url,
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.blob())
      .then(res => {
        res.text().then(res => {
          var divRes = document.getElementById("chartDiv");
          divRes.innerHTML = "";
          let canvas = document.createElement("canvas");
          canvas.setAttribute("id", "myChart");
          divRes.appendChild(canvas);
          // canvas.width = divRes.offsetWidth;
          // canvas.height = divRes.offsetHeight;

          // document.getElementById("name").appendChild(jsonToHTMLTable(csvToJson(res)));
          // document.getElementById("name").appendChild(jsonToGraph(csvToJson(res)));
          jsonToGraph(csvToJson(res));

        });
        let href = window.URL.createObjectURL(res)
        document.getElementById('dlButton').style.display = "block"
        document.getElementById('dlButton').addEventListener('click', () => {
          //window.open(href, 'result.csv')
          window.location.assign(href)
        })
        //document.getElementById('download').innerHTML = `<hr/> <a class='btn btn-danger' role='button' href=${href} download='result.csv'>Download</a>`;
        // document.getElementById('btn-circle-download').setAttribute('href', href)
        // document.getElementById('btn-circle-download').setAttribute('download', 'result.csv')

      })
      .catch((error) => {
        document.getElementById('chartDiv').innerHTML = "Erreur";
      });
    let loader = document.createElement("div")
    loader.setAttribute('class', 'loader')
    document.getElementById("chartDiv").innerHTML = "";
    document.getElementById("chartDiv").appendChild(loader)
  };

  return (
    <div>
      <input className="form-control-file" type="file" name="file" onChange={changeHandler} />
      <br />
      <div>
        <button id="submitButton" className="btn btn-primary" disabled={disable} onClick={handleSubmission}>Submit</button>
      </div>
    </div>
  )
};


function createMenu(checkList) {

  // let comb = [['X_tsne_DiceDist', 'Y_tsne_DiceDist'], // 1, 0, 1, 0, 0 0
  // ['X_tsne_CosDist', 'Y_tsne_CosDist'],//1, 0, 0, 1, 0 1
  // ['X_tsne_TanimotoDist', 'Y_tsne_TanimotoDist'],//1, 0, 0, 0, 1
  // ['X_umap_DiceDist', 'Y_umap_DiceDist'],// 0, 1, 1, 0, 0
  // ['X_umap_CosDist', 'Y_umap_CosDist'],// 0, 1, 0, 1, 0
  // ['X_umap_TanimotoDist', 'Y_umap_TanimotoDist']]// 0, 1, 0, 0, 1



  //   <label for="algoGr">Choose algo:</label>

  // <select name="algoGr" id="algoGr">
  //     <option value="0">Dog</option>
  //     <option value="1">Cat</option>
  //     <option value="2">Hamster</option>
  //     <option value="parrot">Parrot</option>
  //     <option value="spider">Spider</option>
  //     <option value="goldfish">Goldfish</option>
  // </select>
  let selectAlgo = document.createElement('select')
  selectAlgo.setAttribute('name', 'algoGr')
  selectAlgo.setAttribute('id', 'algoGr')
  selectAlgo.addEventListener('change', () => {
    myChart.destroy();
    jsonToGraph(jsonResult);
  })

  // selectAlgo.setAttribute('onChange', "jsonToGraph(jsonResult)")
  // selectAlgo.onChange = function () { jsonToGraph(jsonResult); };

  let selectDistance = document.createElement('select')
  selectDistance.setAttribute('name', 'distGr')
  selectDistance.setAttribute('id', 'distGr')
  selectDistance.addEventListener('change', () => {
    myChart.destroy();
    jsonToGraph(jsonResult);
  })
  // selectDistance.setAttribute('onChange', "jsonToGraph(jsonResult)")

  // selectDistance.onChange = function () { jsonToGraph(jsonResult); };

  let option1 = document.createElement('option')
  option1.setAttribute('value', 'tsne')
  option1.innerHTML = "tSNE"
  let option2 = document.createElement('option')
  option2.setAttribute('value', 'umap')
  option2.innerHTML = "UMAP"


  let option3 = document.createElement('option')
  option3.setAttribute('value', 'DiceDist')
  option3.innerHTML = "Dice"
  let option4 = document.createElement('option')
  option4.setAttribute('value', 'CosDist')
  option4.innerHTML = "Cosine"
  let option5 = document.createElement('option')
  option5.setAttribute('value', 'TanimotoDist')
  option5.innerHTML = "Tanimoto"

  if (checkList[0]) selectAlgo.appendChild(option1)
  if (checkList[1]) selectAlgo.appendChild(option2)
  if (checkList[2]) selectDistance.appendChild(option3)
  if (checkList[3]) selectDistance.appendChild(option4)
  if (checkList[4]) selectDistance.appendChild(option5)


  document.getElementById('graphMenu').innerHTML = ""
  document.getElementById('graphMenu').appendChild(selectAlgo)
  document.getElementById('graphMenu').appendChild(selectDistance)


}

function jsonToGraph(jsonFile) {
  jsonResult = jsonFile;

  var dataDict = []
  var labelsList = []
  let algo = document.getElementById("algoGr").value
  let distance = document.getElementById("distGr").value

  for (var i = 0; i < jsonFile.length; i++) {
    dataDict.push({ x: parseFloat(jsonFile[i][`X_${algo}_${distance}`]), y: parseFloat(jsonFile[i][`Y_${algo}_${distance}`]) });
    labelsList.push(jsonFile[i]["names"])
  }

  const colors = [
    "rgb(176,224,230)", "rgb(135,206,250)", "rgb(0,191,255)", "rgb(30,144,255)", "rgb(95,158,160)", "rgb(106,90,205)", "rgb(0,0,255)",
    "rgb(0,0,139)", "rgb(100,149,237)", "rgb(240,248,255)", "rgb(0, 0, 34)"
  ]
  const data = {
    datasets: [{
      // label: 'tSNE - Dice distance',
      labels: labelsList,
      backgroundColor: colors,
      borderColor: colors,
      data: dataDict,
      pointRadius: jsonFile.length <= 100 ? 5 : (jsonFile.length <= 1000 ? 2 : 1),
      pointHoverRadius: jsonFile.length <= 100 ? 7 : (jsonFile.length <= 1000 ? 3 : 2)
    }]
  };

  const config = {
    type: 'scatter',
    data: data,
    options: {
      plugins: {
        legend: {
          display: false
        },
        // title: {
        //   display: true,
        //   text: `${algo} - ${distance}`,
        //   font: {
        //     size: 18,
        //     weight: 'bold',
        //     lineHeight: 1.2,
        //   },
        // },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              let label = ctx.dataset.labels[ctx.dataIndex];
              label += " (" + ctx.parsed.x + ", " + ctx.parsed.y + ")";
              return label;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'x',
            color: 'rgb(211,211,211)',
            font: {
              size: 15,
              weight: 'bold',
              lineHeight: 1.2,
            },
            padding: { top: 10, left: 0, right: 0, bottom: 0 }
          }
        },
        y: {
          title: {
            display: true,
            text: 'y',
            color: 'rgb(211,211,211)',
            font: {
              size: 15,
              weight: 'bold',
              lineHeight: 1.2,
            },
            padding: { top: 0, left: 0, right: 0, bottom: 10 }
          }
        }

      }
    }
  };
  let ind = 0;
  let list = document.getElementById("moleculesList");
  list.innerHTML = ""
  labelsList.forEach((item) => {
    let li = document.createElement("li");
    ind++;
    li.setAttribute('onclick', `console.log(${ind})`)
    li.innerText = item;
    list.appendChild(li);
  })


  myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
}


function csvToJson(csv) {
  const lines = csv.split(/\r\n|\r|\n/)
  const result = []

  const headers = lines[0].split(/,|;/)

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i])
      continue
    const obj = {}
    const currentline = lines[i].split(/,|;/)

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j]
    }
    result.push(obj)
  }
  return result
}

function jsonToHTMLTable(json) {
  var col = [];
  for (var i = 0; i < json.length; i++) {
    for (var key in json[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }

  var table = document.createElement("table");


  var tr = table.insertRow(-1);

  for (var i = 0; i < col.length; i++) {
    var th = document.createElement("th");
    th.innerHTML = col[i];
    tr.appendChild(th);
  }

  for (var i = 0; i < json.length; i++) {

    tr = table.insertRow(-1);

    for (var j = 0; j < col.length; j++) {
      var tabCell = tr.insertCell(-1);
      tabCell.innerHTML = json[i][col[j]];
    }
  }


  table.setAttribute('class', 'table table-bordered table-striped mb-0');
  table.setAttribute('id', 'sentCSV');

  var div = document.createElement("div")

  div.setAttribute('style', 'max-height:570px; max-width:1000px;')
  div.setAttribute('class', 'table-responsive text-nowrap scrollbar-primary')
  div.appendChild(table)
  var styles = `
        .scrollbar - primary:: -webkit - scrollbar {
          width: 17px;
          background- color: #F5F5F5;
    }

      .scrollbar - primary:: -webkit - scrollbar - thumb {
        border- radius: 10px;
    -webkit - box - shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    background - color: #4285F4;
  }
    
    .scrollbar - primary {
    scrollbar - color: #4285F4 #F5F5F5;
  }
  `

  var styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)



  return div;
}

export default App;

function select_column(setDisable) {
  var table = document.getElementById("sentCSV");
  var cells = table.getElementsByTagName("td");
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];

    cell.onclick = function () {
      clickEvent(this)
      document.getElementById("selectionText").innerHTML = "Select the column containing molecule names"
      select_columnName(setDisable)
    }

    cell.onmouseover = function () {
      mouseEvent(this, true)
    }

    cell.onmouseleave = function () {
      mouseEvent(this, false)
    }

  }

}

function select_columnName(setDisable) {
  var table = document.getElementById("sentCSV");
  var cells = table.getElementsByTagName("td");
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];

    cell.onclick = function () {
      clickEventName(this)
      setDisable(false)
    }
  }

}

function mouseEvent(cell, isEntering) {
  const parentTds = cell.parentElement.children;
  const clickedTdIndex = [...parentTds].findIndex(td => td == cell);
  const columns = document.querySelectorAll(`td:nth-child(${clickedTdIndex + 1}), th:nth-child(${clickedTdIndex + 1})`);
  document.querySelectorAll('.highlighted').forEach(col => col.classList.remove('highlighted'));
  if (isEntering) columns.forEach(col => { col.classList.add('highlighted'); });
}

function clickEvent(cell) {
  const parentTds = cell.parentElement.children;
  const clickedTdIndex = [...parentTds].findIndex(td => td == cell);
  selected_column = clickedTdIndex;
  const columns = document.querySelectorAll(`td:nth-child(${clickedTdIndex + 1}), th:nth-child(${clickedTdIndex + 1})`);
  document.querySelectorAll('.selected').forEach(col => col.classList.remove('selected'));
  columns.forEach(col => { col.classList.add('selected'); });
}

function clickEventName(cell) {
  const parentTds = cell.parentElement.children;
  const clickedTdIndex = [...parentTds].findIndex(td => td == cell);
  selected_columnName = clickedTdIndex;
  const columns = document.querySelectorAll(`td:nth-child(${clickedTdIndex + 1}), th:nth-child(${clickedTdIndex + 1})`);
  document.querySelectorAll('.selectedName').forEach(col => col.classList.remove('selectedName'));
  columns.forEach(col => { col.classList.add('selectedName'); });
}

function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}
