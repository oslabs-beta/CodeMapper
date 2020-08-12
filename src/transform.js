// for dev us if needed since fs can write results to a file for us to look over
// const fs = require('fs');
// this file will transform the data from the babel traversing a file into
// a usable structure by giving the visitor useful methods for traversal

const transform = {};

const stringifyFunction = (functionDefinition) => {
  JSON.stringify(functionDefinition.toString());
};

transform.function = (path, fileObject) => {
  // add the function to a file (temporary, for dev use only)
  // fs.appendFileSync('./testfiles/functions.js', path);

  // create the object we want to add to the filetree for this function
  const functionInfo = {};
  // check for the name
  // if it exists, save it. Otherwise save name as 'anonymous'
  // functionInfo.name = "stat || unknown";

  // check for the type and set the properties in this object based on it
  // functionInfo.type = {
  //   'async': true,
  //   'arrowFunction': false,
  //   'anonymous': true
  // }

  // check for the arguments and add them to an array
  // functionInfo.arguments: [
  //    'file'
  // ]

  // check for any inner function calls
  // functionInfo.innerFunctionCalls: [
  // {
  //   'name': 'fs.stat',
  //   'arguments': [
  //     'file',
  //     stringifyFunction(callback)
  //   ],
  //   "functionText": stringifyFunction(definition);
  // }]

  // and then add it into the file tree
  if (fileObject.functionDeclarations) {
    fileObject.functionDeclarations.push(functionInfo);
  } else {
    fileObject.functionDeclarations = [];
    fileObject.functionDeclarations.push(functionInfo);
  }
};

transform.import = (path, fileObject) => {

};

transform.export = (path, fileObject) => {

};

module.exports = { transform };
