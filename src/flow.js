// temporary, for seeing the output
const fs = require('fs');
const PATH = require('path');
const { generateTree } = require('./generateFileTree');
const { filterAndParse } = require('./filterAndParse');
const { writeFoamTreeData } = require('./generateFoamTreeData');
const { writeTreeMapData } = require('./generateTreeMapData');
// const createDependencyResult = require('./createDependencyResult');
// const createFunctionalityResult = require('./createFunctionalityResult');
// const buildResults = require('./buildResults');

async function flow(root, include, exclude) {
  // call generateTree with the root path passed in
  const fileTree = await generateTree(root, include, exclude);

  // these two could be concurrent
  // call createStructureResult with the file tree passed in
  // to generate the file/folder structure result
  // createStructureResult(fileTree);

  // call filter, passing in the file tree, to get an array of pointers to the JS file objects
  // this will also pass all the js files to the parser
  try {
    if (fileTree !== undefined) {
      filterAndParse(fileTree);
      writeTreeMapData(fileTree);
      // create foamTree data for browser project tree data visualization
      writeFoamTreeData(fileTree);

      fs.writeFileSync(
        PATH.resolve(__dirname, '../data/finalTree.json'),
        JSON.stringify(fileTree, null, 2)
      );
      console.log(
        '\x1b[32m',
        'All done! look in data/finalTree.json to see the current result.\x1b[37m'
      );
    }
  } catch (err) {
    console.error(
      `\n\x1b[31mError in flow.js with filterAndParse(fileTree): ${err.message}\x1b[37m`
    );
  }

  // our original fileTree should now be modified to give us what we need for generating other results
  // so we'll pass it to our other results-generating functions
  // these can happen concurrently
  // const dependencies = createDependencyResult(fileTree);
  // const functionality = createFunctionalityResult(fileTree);

  // put all the results into an array
  // const results = [structure, dependencies, functionality];

  // and then call something like this to build the page:
  // buildResults(results);
}

module.exports = flow;
