const fs = require('fs');
const PATH = require('path');
var Highcharts = require('highcharts');

// Load module after Highcharts is loaded
// require('highcharts/modules/exporting')(Highcharts);
// require('highcharts/modules/data')(Highcharts);
// require('highcharts/modules/heatmap')(Highcharts);
// require('highcharts/modules/treemap')(Highcharts);

// let data = require('../data/fileTree.json');
// <!-- <script src="https://code.highcharts.com/highcharts.js"></script>
// <script src="https://code.highcharts.com/modules/data.js"></script>
// <script src="https://code.highcharts.com/modules/heatmap.js"></script>
// <script src="https://code.highcharts.com/modules/treemap.js"></script> -->

const points = [];

const generateTeeMapData = (data, parentId) => {
  for (const item in data) {
    let id = `id_${item.toString()}`;

    const newPoint = {
      name: data[item].name,
      // color: Highcharts.defaultOptions.colors[item],
      colorValue: Math.round(Math.random() * 100),
      // colorValue: Math.round(data[item].size / 100),
    };
    if (parentId) {
      newPoint.parent = `${parentId}`;
      newPoint.id = `${parentId}_${item.toString()}`;
    } else {
      newPoint.id = id;
    }

    points.push(newPoint);
    if (data[item].isDirectory) {
      generateTeeMapData(data[item].content, newPoint.id);
    } else {
      newPoint.value = Math.round(data[item].size / 100);
    }
  }
  return points;
};

//add data series to treeMapData object
async function writeTreeMapData(data) {
  const dataSeries = await generateTeeMapData(data);

  // write to the result foam tree object
  const pathToFolder = PATH.resolve(__dirname, '../data');

  if (!fs.existsSync(pathToFolder)) {
    fs.mkdirSync(pathToFolder);
  }

  fs.writeFile(
    PATH.resolve(__dirname, '../data/treeMapData.js'),
    `export default ${JSON.stringify(dataSeries, null, 2)}`,
    'utf8',
    (err) => {
      if (err) throw err;
    }
  );
}

module.exports = { writeTreeMapData };
