const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { filterAndParse } = require('./filterAndParse');
const { writeFoamTreeData } = require('./build-results/generateFoamTreeData');
const {
  generateDependencyData,
} = require('./build-results/generateDependencyData');
const { writeTreeMapData } = require('./build-results/generateTreeMapData');
const generateHTMLfiles = require('./build-results/generateHTMLfiles.js');
const open = require('open');

async function flow(fileTree, pathToDir) {
  // call generateTree with the root path passed in
  // const fileTree = await generateTree(root, include, exclude);
  // make a container folders for reqiured CodeMapper's files
  if (!fs.existsSync(`${pathToDir}/CodeMapper`)) {
    fs.mkdirSync(`${pathToDir}/CodeMapper`);
  }
  if (!fs.existsSync(`${pathToDir}/CodeMapper/Data`)) {
    fs.mkdirSync(`${pathToDir}/CodeMapper/Data`);
  }
  if (!fs.existsSync(`${pathToDir}/CodeMapper/Visualization`)) {
    fs.mkdirSync(`${pathToDir}/CodeMapper/Visualization`);
  }

  //generates html files for the visualization in the project directory
  // console.log(path.resolve(process.cwd(), `visualization`));
  await generateHTMLfiles(
    path.resolve(process.cwd(), `visualization`),
    `${pathToDir}/CodeMapper/Visualization`
  );

  try {
    if (fileTree !== undefined) {
      // call filter, passing in the file tree, to get an array of pointers to the JS file objects
      // this will also pass all the js files to the parser
      filterAndParse(fileTree);
    }
  } catch (err) {
    console.error(
      `\n\x1b[31mError in flow.js with filterAndParse(fileTree): ${err.message}\x1b[37m`
    );
  }
  try {
    // our original fileTree should now be modified to give us what we need for generating other results
    // we're going to pass that into generateDependencyData so that we can convert it into the correct type
    // for treeMap chart
    await Promise.all([
      writeTreeMapData(fileTree, pathToDir),
      generateDependencyData(fileTree, [], pathToDir),
    ]);
    // writeTreeMapData(fileTree, pathToDir);
    // // for the dependency wheel
    // generateDependencyData(fileTree, [], pathToDir);
    // create treemap data for foamtree version of the treemap
    // writeFoamTreeData(fileTree);
  } catch (err) {
    console.error(
      `\n\x1b[31mError in flow.js with creating visualisation data fileTree): ${err.message}\x1b[37m`
    );
  }

  (async () => {
    await open(`${pathToDir}/CodeMapper/Visualization/index.html`, {
      wait: true,
    });
  })();
  console.log(
    chalk.greenBright(
      `And we're done! To view the results, open the index.html file we've generated in the ${pathToDir}/CodeMapper folder in any up-to-date browser.`
    )
  );
}
// flow();
module.exports = flow;
