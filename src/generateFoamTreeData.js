const fs = require('fs');
const PATH = require('path');

let fileTree = require('../data/fileTree.json');
// create return data object
const foamTreeData = {};

// helper function to format relative path
function relativePath(fullPath, depth) {
  // create relative path
  const pathArr = fullPath.split('/');
  const idxToSplice = pathArr.length - depth;
  const rPath = (depth === 0) ? '/' : `/${pathArr.splice(idxToSplice).join('/')}`;

  return rPath;
}

// add output object properties
function outputObjProps(obj) {
  const {
    name, path, depth, size, isDirectory, content,
  } = obj;
  const newObj = {};

  if (!isDirectory) {
    newObj.label = `${name}\n${(size / 1000).toFixed(1)} kB`;
  } else {
    newObj.label = name;
  }
  newObj.rPath = relativePath(path, depth);
  newObj.size = size;
  // replace content property name with groups
  if (content !== undefined && content.length > 0) {
    newObj.groups = content;
  }

  return newObj;
}

function processObj(obj) {
  // format object
  const {
    name, path, depth, isDirectory, size, content,
  } = obj;
  const outputObj = outputObjProps({
    name, path, depth, isDirectory, size, content,
  });

  return outputObj;
}

// create a function that will be used to recursively iterate over the fileTree.json
function generateFoamTreeArray(fileTreeArr) {
  const foamTreeArr = [];

  fileTreeArr.forEach(obj => {
    let outputObj = processObj(obj);

    // does the newly created object have a groups property?
    // if yes recursively iterate over the groups array until there are no more nested objects with content
    if (outputObj.groups) {
      outputObj.groups = generateFoamTreeArray(outputObj.groups);
    }

    foamTreeArr.push(outputObj);
  });

  // return newly created foam tree array
  return foamTreeArr;
}

// add generateFoamTreeArray to foamTreeData object
foamTreeData.groups = generateFoamTreeArray(fileTree);

// write to the result foam tree object
fs.writeFile(PATH.resolve(__dirname, '../data/foamTreeDataObj.js'), `export default ${JSON.stringify(foamTreeData, null, 2)}`, 'utf8', err => {
  if (err) throw err;

  console.log('foamTreeDataObj.json was created in /data\n');
});
