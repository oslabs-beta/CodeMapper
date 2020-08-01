const fs = require('fs-extra');
// requiring path and fs modules
const path = require('path');
// joining path of directory
const directoryPath = path.resolve(__dirname);
const allPaths = [];
async function getPaths(dir) {
  const allFiles = await fs.readdir('./');
  console.log(allFiles);
  if (dir !== 'node_modules' && fs.statSync(dir) && fs.lstatSync(dir).isDirectory()) {
    getPaths(dir);
  } else {
    allPaths.push(dir);
  }
  console.log(allPaths);
}
getPaths('./');

// allFiles.then(getPaths);
// allFiles.catch(err => console.error(`An error occured getting the paths: ${err}`));
