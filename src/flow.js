// temporary, for seeing the output
const fs = require('fs');
const PATH = require('path');
const { exec } = require('child_process');
const { generateTree } = require('./generateFileTree');
const { filterAndParse } = require('./filterAndParse');
const { writeFoamTreeData } = require('./build-results/generateFoamTreeData');
const { generateDependencyData } = require('./build-results/generateDependencyData');
const { writeTreeMapData } = require('./generateTreeMapData');

async function flow(root, include, exclude) {
  // call generateTree with the root path passed in
  const fileTree = await generateTree(root, include, exclude);

  // these two could be concurrent
  // call createStructureResult with the file tree passed in
  // to generate the file/folder structure result
  // createStructureResult(fileTree);

  // call filter, passing in the file tree, to get an array of pointers to the JS file objects
  // this will also pass all the js files to the parser
  let finalTree;
  try {
    if (fileTree !== undefined) {
      console.log(fileTree);
      filterAndParse(fileTree);
      writeTreeMapData(fileTree);
      // create foamTree data for browser project tree data visualization
      writeFoamTreeData(fileTree);

      // now that the fileTree has been fully updated in filterAndParse, lets make that obvious
      // by saving it in a new variable
      finalTree = fileTree;

      fs.writeFileSync(
        PATH.resolve(__dirname, '../data/finalTree.json'),
        JSON.stringify(fileTree, null, 2)
      );
      // create foamTree data for browser project tree data visualization
      writeFoamTreeData(finalTree);

      // console.log(
      //   '\x1b[32m',
      //   'All done! look in data/finalTree.json to see the current result.\x1b[37m'
      // );
    }
  } catch (err) {
    console.error(
      `\n\x1b[31mError in flow.js with filterAndParse(fileTree): ${err.message}\x1b[37m`
    );
  }

  // our original fileTree should now be modified to give us what we need for generating other results
  // we're going to pass that into generateDependencyData so that we can convert it into the correct type
  // for the dependency wheel
  const dependencies = generateDependencyData(finalTree);

  fs.writeFileSync(
    PATH.resolve(__dirname, '../data/dependencies.json'),
    JSON.stringify(dependencies, null, 2)
  );

  // bundle up the dependency result with all of its data so it can easily be used on the front end
  // this solves issues with require as well
  exec('browserify src/build-results/createDependencyResult.js -o bundle.js');
}
// flow();

module.exports = flow;
