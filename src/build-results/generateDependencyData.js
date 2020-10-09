const fs = require('fs');
const path = require('path');

// create a function that can accept the tree and iterate over it
// to generate import and export data as an array of arrays
// where each inner array has the exporting file first, the importing file second
// and the number 1 (necessary to represent the weight of the line
// we want to draw between the two - for now we'll have them all be equal)
const generateDependencyData = (finalTree, importExportData = []) => {
  // iterate over the array in the final tree
  for (let i = 0; i < finalTree.length; i += 1) {
    // if the object has an imports property, iterate over the array in imports
    if (finalTree[i].imported && finalTree[i].imported.length > 0) {
      // for each item in imports, add to the import export array a new array with the name of the exporting file,
      // importing file, and the number 1 (required by the dependency wheel chart, represents the thickness of the line
      // connecting the two lines)
      for (let j = 0; j < finalTree[i].imported.length; j += 1) {
        importExportData.push([finalTree[i].imported[j].fileName, finalTree[i].name, 1]);
      }
    }
    // if the object is a directory with content, recursively look over the contents
    if (finalTree[i].isDirectory === true && finalTree[i].content && finalTree[i].content.length > 0) {
      generateDependencyData(finalTree[i].content, importExportData);
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, '../../data/dependencies.js'),
    `export default ${JSON.stringify(importExportData, null, 2)}`,
    'utf8',
    (err) => {
      if (err) throw err;
    },
  );
};

module.exports = { generateDependencyData };
