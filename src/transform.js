// for dev us if needed since fs can write results to a file for us to look over
// const fs = require('fs');
// this file will transform the data from the babel traversing a file into
// a usable structure by giving the visitor useful methods for traversal

const transform = {};

const stringifyFunction = (functionDefinition) => {
  JSON.stringify(functionDefinition.toString());
};

transform.function = (fileObject, name, params, async, type, method, definition) => {
  // add the function to a file (temporary, for dev use only)
  // fs.appendFileSync('./testfiles/functions.js', definition);

  // create the object we want to add to the filetree for this function
  const functionInfo = {};

  // check for the name
  if (name) {
    // if it exists, save it. Otherwise save name as 'anonymous'
    functionInfo.name = name;
  } else {
    functionInfo.name = 'anonymous';
  }

  // add whether it's async or not
  functionInfo.async = async;

  // add type - function declaration, arrow function, or function expression
  functionInfo.type = type;

  // add whether it's a class method or not
  functionInfo.method = method;

  // check for the arguments and add them to an array
  if (params.length) {
    functionInfo.parameters = [];
    for (let i = 0; i < params.length; i += 1) {
      // this is for simple parameter names
      if (params[i].name) {
        functionInfo.parameters.push(params[i].name);
      } else if (params[i].left.name) {
        // this is for parameters that have a default assignment
        functionInfo.parameters.push(`${params[i].left.name} = ${JSON.stringify(params[i].right.elements)}`);
      }
    }
  }

  // add function definition
  if (definition) {
    try {
      functionInfo.definition = definition;
    } catch (error) {
      console.log(`Catch statement - error adding definition for ${functionInfo.name}`);
    }
  } else {
    console.log(`Else statement - error adding definition for ${functionInfo.name}`);
  }

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

  // check for general function calls

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
