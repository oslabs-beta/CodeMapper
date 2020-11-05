/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const fs = require('fs');

const points = [];
const colors = [
  '#d1f510',
  '#856677',
  '#ae9ef0',
  '#0f687a',
  '#ceaf73',
  '#18425d',
  '#8f2392',
  '#d17715',
  '#a10475',
  '307fc9',
  '#53A4EF',
  '#21212D',
  '#90ED7D',
  '#D37D37',
  '#4F57EA',
  '#DD5676',
  '#F2D82E',
  '#117271',
  '#CE3D3D',
  '#65C6BE',
];

// this is where we build out all the data for the nested object representing all the files and folders
// in particular we add in extra info about JS files - function calls, function definitions, imports, and exports
const generateTreeMapData = (data, parentId) => {
  for (const item in data) {
    const id = `id_${item.toString()}`;

    const newPoint = {
      name: data[item].name,

      color: colors[Math.round(Math.random() * 20)],
    };
    if (data[item].functionCalls) {
      newPoint.functionCalls = data[item].functionCalls;
    }
    if (data[item].imported) {
      newPoint.imported = data[item].imported;
    }
    if (data[item].functionDeclarations) {
      newPoint.functionDeclarations = data[item].functionDeclarations;
    }
    if (data[item].exported) {
      newPoint.exported = data[item].exported;
    }

    if (parentId) {
      newPoint.parent = `${parentId}`;
      newPoint.id = `${parentId}_${item.toString()}`;
    } else {
      newPoint.id = id;
    }

    points.push(newPoint);
    if (data[item].isDirectory) {
      generateTreeMapData(data[item].content, newPoint.id);
    } else {
      newPoint.value = Math.round(data[item].size / 100);
    }
  }
  return points;
};

// add data series to treeMapData object
async function writeTreeMapData(data, pathToDir) {
  const dataSeries = await generateTreeMapData(data);

  // write to the resulting tree object
  fs.writeFile(
    `${pathToDir}/CodeMapper/Data/treeMapData.js`,
    `const treeMapData = ${JSON.stringify(dataSeries, null, 2)}`,
    (err) => {
      if (err) throw err;
    }
  );
}

module.exports = { writeTreeMapData };
