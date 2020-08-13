// temporary, for seeing the output
const fs = require('fs');
const PATH = require('path');
const { generateTree } = require('./generateFileTree');
// const createStructureResult = require('./createStructureResult');
const { filterAndParse } = require('./filterAndParse');
// const createDependencyResult = require('./createDependencyResult');
// const createFunctionalityResult = require('./createFunctionalityResult');
// const buildResults = require('./buildResults');

async function flow() {
  // collect root and options from the user using the command line


  // this will be set by the user later. setting it manually for now
  const root = PATH.resolve(__dirname, './');
  console.log('flow.js root =', root);
  const include = [];
  const exclude = ['node_modules', '.git', 'testfiles', '.vscode'];

  // call generateTree with the root path passed in
  const fileTree = await generateTree(root, include, exclude);

  // these two could be concurrent
    // call createStructureResult with the file tree passed in
    // const structure = createStructureResult(fileTree);

    // call filter, passing in the file tree, to get an array of pointers to the JS file objects
    // this will also pass all the js files to the parser
  filterAndParse(fileTree);
  fs.writeFileSync('testfiles/finalTree.json', JSON.stringify(fileTree));
  console.log('All done! look in testfiles/finalTree.json to see the current result.');

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

flow();
