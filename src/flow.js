const fs = require('fs');
const PATH = require('path');
const { generateTree } = require('./generateFileTree');
const { filterAndParse } = require('./filterAndParse');
const { writeFoamTreeData } = require('./build-results/generateFoamTreeData');
const { generateDependencyData } = require('./build-results/generateDependencyData');
const { writeTreeMapData } = require('./build-results/generateTreeMapData');

async function flow(root, include, exclude) {
  // call generateTree with the root path passed in
  const fileTree = await generateTree(root, include, exclude);

  // make the data folder if it doesn't exist
  const data = PATH.resolve(__dirname, '../data');
  if (!fs.existsSync(data)) {
    fs.mkdirSync(data);
  }

  try {
    if (fileTree !== undefined) {
      // call filter, passing in the file tree, to get an array of pointers to the JS file objects
      // this will also pass all the js files to the parser
      filterAndParse(fileTree);
    }
  } catch (err) {
    console.error(
      `\n\x1b[31mError in flow.js with filterAndParse(fileTree): ${err.message}\x1b[37m`,
    );
  }

  try {
    // create treemap data for highcharts version of the treemap
    writeTreeMapData(fileTree);
    // create treemap data for foamtree version of the treemap
    writeFoamTreeData(fileTree);
  } catch (err) {
    console.error(
      `\n\x1b[31mError in flow.js with filterAndParse(fileTree): ${err.message}\x1b[37m`,
    );
  }

  // our original fileTree should now be modified to give us what we need for generating other results
  // we're going to pass that into generateDependencyData so that we can convert it into the correct type
  // for the dependency wheel
  generateDependencyData(fileTree);
}

module.exports = flow;
