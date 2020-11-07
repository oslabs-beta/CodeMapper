const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const open = require('open');

const { filterAndParse } = require('./filterAndParse');
const { generateDependencyData } = require('./build-results/generateDependencyData');
const { writeTreeMapData } = require('./build-results/generateTreeMapData');
const generateHTMLfiles = require('./build-results/generateHtmlFiles');
const modulePath = require('../getRoot');

async function flow(fileTree, pathToDir) {
  // make container folders for required CodeMapper files so we can put them in a person's project
  if (!fs.existsSync(`${pathToDir}/CodeMapper`)) {
    fs.mkdirSync(`${pathToDir}/CodeMapper`);
  }
  if (!fs.existsSync(`${pathToDir}/CodeMapper/Data`)) {
    fs.mkdirSync(`${pathToDir}/CodeMapper/Data`);
  }
  if (!fs.existsSync(`${pathToDir}/CodeMapper/Visualization`)) {
    fs.mkdirSync(`${pathToDir}/CodeMapper/Visualization`);
  }

  // generate html files for the Visualization directory
  try {
    const pathToSource = modulePath;
    const dirPath = `${pathToDir}/CodeMapper/Visualization`;
    await generateHTMLfiles(pathToSource, dirPath);
  } catch (e) {
    console.log('Error while trying to generate the html files: ', e);
  }

  try {
    if (fileTree !== undefined) {
      // call filterAndParse on the fileTree to get an array of pointers to the objects
      // that represent the JS files in the project
      // this will also pass all the JS files to the parser
      filterAndParse(fileTree);
    }
  } catch (err) {
    // ** we need to show a user friendly error to the CLI here
    // but for now, this will do **
    console.error(`\n\x1b[31mError in flow.js with filterAndParse(fileTree): ${err.message}\x1b[37m`);
  }

  try {
    // add the data about all the files to our file tree in the Data directory
    // since we filtered out the JS files and parsed them, this will include
    // extra details about any JS files
    fs.writeFile(
      `${pathToDir}/CodeMapper/Data/fileTree.js`,
      `const treeMapData = ${JSON.stringify(fileTree, null, 2)}`,
      (err) => {
        if (err) throw err;
      }
    );
    // our original fileTree variable is also modified now to give us what we need for generating other results
    // so we're going to pass that into generateDependencyData so that we can convert it into the correct type
    // for treeMap chart, and into writeTreeMapData to give us the things we need for the TreeMap 
    await Promise.all([
      writeTreeMapData(fileTree, pathToDir),
      generateDependencyData(fileTree, [], pathToDir),
    ]);
  } catch (err) {
    console.error(
      // ** we need to show a user friendly error to the CLI here
      // but for now, this will do **
      `\n\x1b[31mError in flow.js with creating visualisation data fileTree): ${err.message}\x1b[37m`
    );
  }

  // once we've generated all the data and front-end files, we open the "home page" for the person in their browser
  (async () => {
    await open(`${pathToDir}/CodeMapper/Visualization/index.html`, {
      wait: false,
    });
  })();

  // ** also, spoiler, this only works half the time, so also let them know to do it manually just in case
  console.log(
    chalk.greenBright(
      `And we're done! To view the results, open the index.html file we've generated in the ${pathToDir}/CodeMapper/Visualization folder in any up-to-date browser.`
    )
  );
}

module.exports = flow;
