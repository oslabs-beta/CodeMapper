const generate = require('@babel/generator').default;
// for dev us if needed since fs can write results to a file for us to look over
// const fs = require('fs');
// this file will transform the data from the babel traversing a file into
// a usable structure by giving the visitor useful methods for traversal

const transform = {};

// turns function definitions into the data we need and adds it to the file tree
transform.functionDefinition = (fileObject, name, params, async, type, method, definition) => {
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
  //  {
  //    'name': 'fs.stat',
  //    'type': 'function', 'method', or 'anonymous method'
  //    'arguments': [
  //    'file',
  //     'stringifyFunction'
  //    ],
  //    'parent': {
  //      'name': 'nameOfThing',
  //    }
  //    'leftSibling': 
  //    scope: 'something',
  //    recursiveCall: true
  //  }
  // ]

  // check for general function calls
    // check whether it's an import or was defined in the file
    // how it communicates with the environment -
    // what data it takes in
    // what data it returns
    // check whether it's a pre-built function

  // and then add it into the file tree
  if (fileObject.functionDeclarations) {
    fileObject.functionDeclarations.push(functionInfo);
  } else {
    fileObject.functionDeclarations = [];
    fileObject.functionDeclarations.push(functionInfo);
  }
};

// helper function for logical expressions
const handleLogicalExpressions = (parent, result = '') => {
  const { left } = parent;
  const { right } = parent;
  const { operator } = parent;

  // console.log(`right is ${JSON.stringify(right)} and left is ${JSON.stringify(left)} and result is ${result}`);
  // we always start by adding the right side to the beginning
  if (right) {
    if (right.value) {
      if (right.type === 'NumericLiteral') {
        if (result) {
          result = `${operator} ${right.value} ${result}`;
        } else {
          result = `${operator} ${right.value}`;
        }
      }
      if (right.type === 'StringLiteral') {
        if (result) {
          result = `${operator} '${right.value}' ${result}`;
        } else {
          result = `${operator} '${right.value}'`;
        }
      }
    }
    if (right.name) {
      if (result) {
        result = `${operator} ${right.name} ${result}`;
      } else {
        result = `${operator} ${right.name}`;
      }
    }
  }

  // termination case
  if (left.type === 'Identifier') {
    // add the name and then return the result
    result = `${left.name} ${result}`;
    return result;
  }

  if (left.type === 'NumericLiteral') {
    // add the name and then return the result
    result = `${left.value} ${result}`;
    return result;
  }

  if (left.type === 'StringLiteral') {
    // add the name and then return the result
    result = `'${left.value}' ${result}`;
    return result;
  }

  // otherwise, recurse
  return handleLogicalExpressions(left, result);
};

// turns function calls into the data we need and adds it to the file tree
transform.functionCall = (fileObject, name, type, args) => {
  // console.log('got into function call');
  const functionInfo = {};

  // check for the name
  if (name) {
    // if it exists, save it. Otherwise save name as 'anonymous'
    functionInfo.name = name;
  } else {
    functionInfo.name = 'anonymous';
  }

  // add type - function, method, or anonymous method
  functionInfo.type = type;
  functionInfo.arguments = [];

  if (args.length) {
    for (let i = 0; i < args.length; i += 1) {
      // console.log(args[i]);
      const arg = args[i];
      let label;
      let argObject;
      // number or function call or variable
      if (arg.value) {
        if (arg.type === 'StringLiteral') {
          label = `'${arg.value}'`;
        } else {
          label = arg.value;
        }
      } else if (arg.callee && arg.callee.name) {
        label = arg.callee.name;
      } else if (arg.name) {
        label = arg.name;
      } else if (arg.type === 'ArrowFunctionExpression') {
        const node = arg;
        let callbackName;
        if (node.id) {
          callbackName = node.id.name;
        } else { // this adds a whole object for the function definition
          callbackName = 'anonymousFunction';
          const nodeParams = node.params || [];

          // check for the arguments and add them to an array
          const callbackParams = [];
          if (nodeParams.length) {
            for (let i = 0; i < nodeParams.length; i += 1) {
              // this is for simple parameter names
              if (nodeParams[i].name) {
                callbackParams.push(nodeParams[i].name);
              } else if (nodeParamss[i].left.name) {
                // this is for parameters that have a default assignment
                callbackParams.push(`${nodeParams[i].left.name} = ${JSON.stringify(nodeParams[i].right.elements)}`);
              }
            }
          }

          const async = node.async;
          const type = node.type;
          const method = false;
          const definition = generate(node).code;
          argObject = {
            callbackName,
            callbackParams,
            async,
            type,
            method,
            definition,
          };
        }
      } else if (arg.type === 'LogicalExpression') {
        // console.log('got into logical expression for arg ', arg);
        // call helper function
        label = handleLogicalExpressions(arg);
      }
      functionInfo.arguments.push(label || argObject);
    }
  }

  // and then add it into the file tree
  if (fileObject.functionCalls) {
    fileObject.functionCalls.push(functionInfo);
  } else {
    fileObject.functionCalls = [];
    fileObject.functionCalls.push(functionInfo);
  }

  // idea for other things that could be handy to add
  //  {
  //    'name': 'fs.stat',
  //    'type': 'function', 'method', or 'anonymous method'
  //    'arguments': [
  //    'file',
  //     'stringifyFunction'
  //    ],
  //    'parent': {
  //      'name': 'nameOfThing',
  //    }
  //    'siblings': '',
  //    scope: 'something',
  //    recursiveCall: true
  //  }
};

transform.import = (fileObject, fileName, fileType, methodUsed, variableSet) => {
  const importInfo = {};

  // fileType will either be node module or local module
  importInfo.fileType = fileType;

  // name of the file or module being imported
  importInfo.fileName = fileName;

  // methodUsed will either be require or import
  importInfo.methodUsed = methodUsed;

  // variableSet will always be an array of objects with a name and type property on each
  importInfo.namedImports = variableSet;

  // and then add it into the file tree
  if (!fileObject.imports) {
    fileObject.imports = [];
  }
  fileObject.imports.push(importInfo);

  // we could also check if it's being used?
};

transform.export = (path, fileObject) => {
  // name
  // default: true or false
};

module.exports = { transform };
