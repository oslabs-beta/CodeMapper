const generate = require('@babel/generator').default;
// for dev us if needed since fs can write results to a file for us to look over
// const fs = require('fs');
// this file will transform the data from the babel traversing a file into
// a usable structure by giving the visitor useful methods for traversal

const transform = {};

// turns function definitions into the data we need and adds it to the file tree
transform.functionDefinition = (
  fileObject,
  name,
  params,
  async,
  type,
  method,
  definition
) => {
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

  // check for the parameters and add them to an array
  if (params.length) {
    functionInfo.parameters = [];
    for (let i = 0; i < params.length; i += 1) {
      // this is for simple parameter names
      if (params[i].name) {
        functionInfo.parameters.push(params[i].name);
      } else if (params[i].left.name) {
        // this is for parameters that have a default assignment
        functionInfo.parameters.push(
          `${params[i].left.name} = ${JSON.stringify(params[i].right.elements)}`
        );
      } else {
        functionInfo.parameters.push(JSON.stringify(generate(params[i]).code));
      }
    }
  }

  // add function definition
  if (definition) {
    try {
      functionInfo.definition = definition;
    } catch (error) {
      console.log(
        `Catch statement - error adding definition for ${functionInfo.name}`
      );
    }
  } else {
    console.log(
      `Else statement - error adding definition for ${functionInfo.name}`
    );
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
    if (right.operator) {
      if (right.type === 'UnaryExpression') {
        if (result) {
          result = `${operator} ${right.operator} ${right.argument.value}`;
        }
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

  if (left.type === 'MemberExpression') {
    // put together the name and return the result
    result = `${left.object.name}.${left.property.name} ${result}`;
    return result;
  }

  // otherwise, recurse
  return handleLogicalExpressions(left, result);
};

// turns function calls into the data we need and adds it to the file tree
transform.functionCall = (fileObject, name, type, args) => {
  const functionInfo = {};

  // check for the name
  if (name) {
    // if it exists, save it. Otherwise save name as 'anonymous'
    functionInfo.name = name;
  } else {
    functionInfo.name = 'anonymous';
  }

  try {
    // add type - function, method, or anonymous method
    functionInfo.type = type;
  } catch (error) {
    console.log(`Ran into issues with adding the type to the function info. Type is ${type}. Error is ${error}`);
  }

  functionInfo.arguments = [];

  try {
    if (args.length) {
      for (let i = 0; i < args.length; i += 1) {
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
        } else if (arg.type === 'NullLiteral') {
          label = 'null';
        } else if (arg.type === 'NumericLiteral') {
          label = arg.value;
        } else if (arg.type === 'TemplateLiteral') {
          label = JSON.stringify(generate(args[i]).code);
        } else if (arg.type === 'LogicalExpression') {
          label = handleLogicalExpressions(arg);
        } else if (arg.callee && arg.callee.name) {
          label = arg.callee.name;
        } else if (arg.name) {
          label = arg.name;
        } else if (arg.type === 'ArrowFunctionExpression') {
          const node = arg;
          let callbackName;
          if (node.id) {
            callbackName = node.id.name;
          } else {
            // this adds a whole object for the function definition
            callbackName = 'anonymousFunction';
            const nodeParams = node.params || [];

            // check for the arguments and add them to an array
            const callbackParams = [];
            if (nodeParams.length) {
              for (let i = 0; i < nodeParams.length; i += 1) {
                // this is for simple parameter names
                if (nodeParams[i].name) {
                  callbackParams.push(nodeParams[i].name);
                } else if (nodeParams[i].left.name) {
                  // this is for parameters that have a default assignment
                  callbackParams.push(
                    `${nodeParams[i].left.name} = ${JSON.stringify(
                      nodeParams[i].right.elements
                    )}`
                  );
                }
              }
            }

            const { async } = node;
            const argType = node.type;
            const method = false;
            const definition = generate(node).code;
            argObject = {
              callbackName,
              callbackParams,
              async,
              type: argType,
              method,
              definition,
            };
          }
        } else if (arg.type === 'LogicalExpression') {
          // call helper function
          label = handleLogicalExpressions(arg);
        } else if (arg.type === 'CallExpression') {
          if (arg.callee && arg.callee.name) {
            label = arg.callee.name;
          } else if (arg.callee.object && arg.callee.property) {
            if (args.arguments) {
              // grab the inner arguments
              const innerArgs = [];
              for (let j = 0; i < args.arguments.length; j += 1) {
                innerArgs.push(JSON.stringify(generate(innerArgs[j]).code));
              }
              label = `${arg.callee.object.name}.${arg.callee.property.name}(${innerArgs.slice(1, -1)})`;
            } else {
              label = `${arg.callee.object.name}.${arg.callee.property.name}()`;
            }
          }
        } else if (arg.type === 'MemberExpression') {
          label = JSON.stringify(generate(args[i]).code);
        }
        functionInfo.arguments.push(label || argObject);
      }
    }
  } catch (err) {
    console.log(`Error while trying to save arguments into filetree. Error is ${err}`);
    
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

transform.import = (
  fileObject,
  fileName,
  fileType,
  methodUsed,
  variableSet,
) => {
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
  if (!fileObject.imported) {
    fileObject.imported = [];
  }
  fileObject.imported.push(importInfo);

  // we could also check if it's being used?
};

transform.export = (fileObject, originalName, exportName, value, type, exportSource) => {
  const exportInfo = {};
  exportInfo.originalName = originalName;
  exportInfo.exportName = exportName;
  exportInfo.value = value;
  exportInfo.type = type;
  exportInfo.exportSource = exportSource;
  // and then add it into the file tree
  if (!fileObject.exports) {
    fileObject.exported = [];
  }
  fileObject.exported.push(exportInfo);
};

module.exports = { transform };
