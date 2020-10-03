const fs = require('fs');
const PATH = require('path');

// create return data object
const foamTreeData = {};

// helper function to format relative path
function relativePath(fullPath, depth) {
  // create relative path
  const pathArr = fullPath.split('/');
  const idxToSplice = pathArr.length - depth;
  const rPath = depth === 0 ? '/' : `/${pathArr.splice(idxToSplice).join('/')}`;

  return rPath;
}

// add output object properties
function outputObjProps(obj) {
  const {
    name,
    path,
    depth,
    size,
    isDirectory,
    content,
    functionDeclarations,
    imported,
    functionCalls,
  } = obj;

  const newObj = {};

  if (!isDirectory) {
    newObj.label = `${name}\n${(size / 1000).toFixed(1)} kB`;
  } else {
    newObj.label = name;
  }
  newObj.rPath = relativePath(path, depth);
  newObj.size = size;

  if (functionDeclarations) {
    newObj.functionDeclarations = functionDeclarations;
  }
  if (imported) {
    newObj.imported = imported;
  }
  if (functionCalls) {
    newObj.functionCalls = functionCalls;
  }

  // replace content property name with groups
  if (content !== undefined && content.length > 0) {
    newObj.groups = content;
  }

  return newObj;
}

function processObj(obj) {
  const {
    name,
    path,
    depth,
    size,
    isDirectory,
    content,
    functionDeclarations,
    imported,
    functionCalls,
  } = obj;
  const outputObj = outputObjProps({
    name,
    path,
    depth,
    isDirectory,
    size,
    content,
    functionDeclarations,
    imported,
    functionCalls,
  });

  return outputObj;
}

// create a function that will be used to recursively iterate over the fileTree.json
function generateFoamTreeArray(fileTreeArr) {
  const foamTreeArr = [];

  fileTreeArr.forEach((obj) => {
    const outputObj = processObj(obj);

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
async function writeFoamTreeData(tree) {
  foamTreeData.groups = await generateFoamTreeArray(tree);

  // write to the result foam tree object
  const data = PATH.resolve(__dirname, '../data');

  if (!fs.existsSync(data)) {
    fs.mkdirSync(data);
  }

  fs.writeFile(
    PATH.resolve(__dirname, '../../data/foamTreeDataObj.js'),
    `export default ${JSON.stringify(foamTreeData, null, 2)}`,
    'utf8',
    (err) => {
      if (err) throw err;

      console.log(
        '\x1b[32m\n\t*** Data for visualization created ***\n The Project Structure can now be viewed in the browser\x1b[37m\n'
      );
    }
  );
}

module.exports = { writeFoamTreeData };
