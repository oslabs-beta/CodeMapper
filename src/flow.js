// temporary, for seeing the output
const fs = require('fs');
const PATH = require('path');
const { generateTree } = require('./generateFileTree');
const { filterAndParse } = require('./filterAndParse');
// const buildResults = require('./buildResults');
// const createStructureResult = require('./createStructureResult');
// const createDependencyResult = require('./createDependencyResult');
// const createFunctionalityResult = require('./createFunctionalityResult');

// we collect root and options from the user using the command line, and then call flow from there
async function flow(root, include, exclude) {
  
  // call generateTree with the root path passed in
  const fileTree = await generateTree(root, include, exclude);

  // these two could be concurrent
    // call createStructureResult with the file tree passed in
    // to generate the file/folder structure result
    // createStructureResult(fileTree);

    // call filter, passing in the file tree, to get an array of pointers to the JS file objects
    // this will also pass all the js files to the parser
  filterAndParse(fileTree);
  fs.writeFileSync('../data/finalTree.json', JSON.stringify(fileTree, null, 2));
  console.log('All done! look in data/finalTree.json to see the current result.');

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

// flow();
module.exports = flow;
