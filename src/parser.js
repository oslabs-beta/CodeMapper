/* eslint-disable max-len */
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const fs = require('fs');
const { transform } = require('./transform');

// we can use this directly if we'd rather pass each file to the parser one at a time
const fileParser = (fileObject, filePath) => {
  // this reads the file so we can parse it
  let readFile;
  try {
    readFile = fs.readFileSync(filePath).toString();
  } catch (err) {
    console.log(`Found an error while reading a file to generate the official AST for it: ${err}. File is ${fileObject.name}`);
  }

  // this parses the file into an AST so we can traverse it
  let parsedFile;
  try {
    parsedFile = parse(readFile, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (err) {
    console.log(`Error while creating ast for traversing. Error is ${err} and relevant file is ${fileObject.name}`);
  }

  // this allows us to traverse the AST
  const visitor = {
    // call transform in here to change the results from babel parsing the JS files
    // into what we need for visualization and other types of sharing results
    // and save that info into our fileTree

    // This is for regular function expressions (not anonymous/arrow functions)
    FunctionDeclaration({ node }) {
      try {
        let name = 'anonymous';
        if (node.id) {
          name = node.id.name;
        }
        const { params } = node;
        const { async } = node;
        const { type } = node;
        const method = false;
        const definition = generate(node).code;
        transform.functionDefinition(fileObject, name, params, async, type, method, definition);
      } catch (err) {
        console.log(`Found an error while parsing a function declaration node: ${err}`);
      }
    },

    VariableDeclaration({ node }) {
      // This handles the arrow functions
      try {
        if (node.declarations[0].init && node.declarations[0].init.type === 'ArrowFunctionExpression') {
          const { name } = node.declarations[0].id;
          const params = node.declarations[0].init.params || [];
          const { async } = node.declarations[0].init;
          const { type } = node.declarations[0].init;
          const method = false;
          const definition = generate(node).code;
          transform.functionDefinition(fileObject, name, params, async, type, method, definition);
        }
      } catch (err) {
        console.log(`Found an error while parsing an arrow function definition in a variable declaration node: ${err}`);
      }

      // This handles the require statements without any extra details added on to the require invocation
      // (like a '.default' or settings object)
      if (node.declarations && node.declarations[0].init) {
        // We'll handle imports assigned to variables here
        // for example var promise = import("module-name");
        try {
          if (node.declarations[0].init.callee && node.declarations[0].init.callee.type === 'Import') {
            const variable = {};
            const variableSet = [];
            variable.name = node.declarations[0].id.name;
            variable.type = 'local name';
            variableSet.push(variable);
            const fileName = node.declarations[0].init.arguments[0].value;
            fileName.trim();

            let fileType = '';
            if (fileName.charAt(0) === '.') {
              fileType = 'local module';
            } else {
              fileType = 'node module';
            }

            const methodUsed = 'dynamic import';

            transform.import(fileObject, fileName, fileType, methodUsed, variableSet);
          }
        } catch (err) {
          console.log(`Found an error while parsing an import statement in a variable declaration node: ${err}`);
        }

        try {
          if ((node.declarations[0].init.type === 'CallExpression' && node.declarations[0].init.callee.name === 'require') || (node.declarations[0].init.type === 'MemberExpression' && node.declarations[0].init.object.callee && node.declarations[0].init.object.callee.name === 'require')) {
            const variableSet = [];

            // when we're naming the default we're bringing in
            if (node.declarations[0].id.type === 'Identifier') {
              const variable = {};
              variable.name = node.declarations[0].id.name;
              variable.type = 'local name';
              variableSet.push(variable);
            }

            // for when we destructure the things we're importing
            // when we're destructuring a specific thing we're importing
            if (node.declarations[0].id.type === 'ObjectPattern' && node.declarations[0].id.properties.length) {
              for (let i = 0; i < node.declarations[0].id.properties.length; i += 1) {
                const variable = {};
                variable.name = node.declarations[0].id.properties[i].value.name;
                variable.type = 'original name';
                variableSet.push(variable);
              }
            }

            // we may need to adjust this later if it's possible to chain more than one thing after the require invocation
            let fileName;
            if (node.declarations[0].init.arguments) {
              fileName = node.declarations[0].init.arguments[0].value;
            } else {
              fileName = node.declarations[0].init.object.arguments[0].value;
              // console.log(`No arguments property on init. Init is ${JSON.stringify(node.declarations[0].init)}`);
            }
            fileName.trim();

            let fileType = '';
            if (fileName.charAt(0) === '.') {
              fileType = 'local module';
            } else {
              fileType = 'node module';
            }

            const methodUsed = 'require';

            // console.log(`file name is ${fileName} and file type is ${fileType} and method used is ${methodUsed} and variable set looks like ${JSON.stringify(variableSet)}`);

            transform.import(fileObject, fileName, fileType, methodUsed, variableSet);
          }
        } catch (err) {
          console.log(`Found an error while trying to parse a require statement that's a call or member expression: ${err}`);
        }
      }
    },

    // This handles class methods
    ExpressionStatement({ node }) {
      try {
        if (node.expression.right && node.expression.left) {
          let name;
          const { type } = node.expression.right;
          if (
            type === 'ArrowFunctionExpression' ||
            type === 'FunctionExpression'
          ) {
            if (node.expression.left.object && node.expression.left.property) {
              name = `${node.expression.left.object.name}.${node.expression.left.property.name}`;
            } else {
              name = 'anonymousMethod';
            }
            const params = node.expression.right.params || [];
            const { async } = node.expression.right;
            const method = true;
            const definition = generate(node).code;
            transform.functionDefinition(
              fileObject,
              name,
              params,
              async,
              type,
              method,
              definition
            );
          }
        }
      } catch (err) {
        console.log(`Found an error while parsing a class method: ${err}.`);
      }

      // this handles module exports
      try {
        if (node.expression.type === 'AssignmentExpression' && node.expression.left && node.expression.left.object) {
          if (node.expression.left.object && node.expression.left.object.name === 'module' && node.expression.left.property && node.expression.left.property.name === 'exports') {
            let originalName = 'anonymous';
            let exportName = originalName;
            // in the case that we're creating an object to export things in
            if (node.expression.right.type === 'ObjectExpression') {
              for (let i = 0; i < node.expression.right.properties.length; i += 1) {
                const current = node.expression.right.properties[i];
                originalName = current.value.name;
                exportName = current.key.name;
                const value = 'unknown';
                const type = 'module export';
                let exportSource = 'current file';
                if (node.source) {
                  exportSource = node.source.value;
                }
                // in this case we have to loop through the object to get all the exports
                transform.export(fileObject, originalName, exportName, value, type, exportSource);
              }
            } else { // in the case that we have a simple named export
              if (node.expression.right && node.expression.right.name) {
                originalName = node.expression.right.name;
              }
              exportName = originalName;
              const value = 'unknown';
              const type = 'module export';
              let exportSource = 'current file';
              if (node.source) {
                exportSource = node.source.value;
              }
              transform.export(fileObject, originalName, exportName, value, type, exportSource);
            }
          }
        }
      } catch (err) {
        console.log(`Found an error while parsing a module export: ${err}`);
      }
    },

    // This handles functions that are defined inside of iffys
    FunctionExpression(path) {
      const { node } = path;
      // ignore any that are assignment expressions because they are handled in the above Expression Statement block
      try {
        if (path.parent.type !== 'AssignmentExpression') {
          let name;
          if (node.id) {
            name = node.id.name;
          } else {
            name = 'anonymousFunction';
          }
          const params = node.params || [];
          const { async } = node;
          const { type } = node;
          const method = false;
          const definition = generate(node).code;
          transform.functionDefinition(
            fileObject,
            name,
            params,
            async,
            type,
            method,
            definition
          );
        }
      } catch (err) {
        console.log(`Found an error while parsing a function defined inside an iffy: ${err}`);
      }
    },

    // for outer function calls
    CallExpression({ node }) {
      let name;
      let type;

      // for regular functions
      try {
        if (node.callee && node.callee.type !== 'Import') {
          if (node.callee && node.callee.name) {
            // handling all regular function calls except require statements here
            if (node.callee.name) {
              name = node.callee.name;
              type = 'function';
            }
          } else if (node.callee.object && node.callee.object.name) {
            // for regular class methods
            name = `${node.callee.object.name}.${node.callee.property.name}`;
            type = 'method';
          } else if (
            node.callee.object &&
            node.callee.object.object &&
            node.callee.object.property &&
            node.callee.object.object.name &&
            node.callee.object.property.name
          ) {
            // for methods called on object properties
            name = `${node.callee.object.object.name}.${node.callee.object.property.name}.${node.callee.property.name}`;
            type = 'method';
          } else if (node.callee.property && node.callee.property.name) {
            // and for class/prototype methods we can't identify the object of
            name = `anonymous.${node.callee.property.name}`;
            type = 'anonymous method';
          } else if (node.callee && node.callee.id && node.callee.id.name) {
            name = node.callee.id.name;
            type = 'immediately invoked function expression';
          } else {
            name = 'anonymous';
            type = 'anonymous function';
          }
          // grab the arguments (this will be an empty array if no arguments are there)
          // we should revisit this because we should be handling the node logic here instead
          // or actually... perhaps this is how we should be handling all the node visitor patterns
          // and letting transform do the parsing out of the details for each thing

          const args = node.arguments;

          // console.log('type in parser is ', type);
          transform.functionCall(fileObject, name, type, args);
        }
      } catch (err) {
        console.log(`Found an error while gettings details of a regular function/method call that is not an import statement: ${err}.`);
      }

      // or if object type is call expression, then it's in a chain of methods, so we won't have the object name but we still get the method name
      // arguments are always at path.node.arguments

      // check the parent to see if it is program.body (something like that)
      // if it is, then it's an outer function call so we can process it here
      // console.log(path.contexts[0].scope.block.body);

      // // define a function that can look inside a call expression for more call expressions
      // if (path.parent.type === 'MemberExpression') {
      //   console.log(`path.parent.type is MemberExpression for the node: ${JSON.stringify(path.node)}`);
      // }
    },

    // This handles import statements
    ImportDeclaration({ node }) {
      const variableSet = [];

      try {
        if (node.specifiers) {
          for (let i = 0; i < node.specifiers.length; i += 1) {
            const variable = {};
            const current = node.specifiers[i];
            variable.name = current.local.name;

            // for when we select specific things to bring in
            if (current.type === 'ImportSpecifier') {
              variable.type = 'original name';
              variable.originalName = variable.name;
            } else if (current.type === 'ImportDefaultSpecifier') {
              // if we only import one variable and it's not destructured
              variable.type = 'local name';
            } else if (current.type === 'ImportNamespaceSpecifier') {
              variable.type = 'local name';
              variable.originalName = '*';
            }

            // if we know the original name because we're using an alias, add it
            if (current.imported && current.imported.name) {
              variable.originalName = current.imported.name;
            } else if (!variable.originalName) {
              variable.originalName = 'unknown';
            }

            variableSet.push(variable);
          }
          const fileName = node.source.value.trim();
          let fileType;
          if (fileName.charAt(0) === '.') {
            fileType = 'local module';
          } else {
            fileType = 'node module';
          }
          const methodUsed = 'import';

          transform.import(
            fileObject,
            fileName,
            fileType,
            methodUsed,
            variableSet,
          );
        }
      } catch (err) {
        console.log(`Found an error while parsing an import declaration node: ${err}`);
      }
    },

    ExportNamedDeclaration({ node }) {
      if (node.declaration) {
        // for function declarations being exported
        try {
          if (node.declaration.type === 'FunctionDeclaration') {
            const originalName = node.declaration.id.name;
            const exportName = originalName;
            const value = generate(node.declaration).code || 'unknown';
            const type = 'named export';
            let exportSource = 'current file';
            if (node.source) {
              exportSource = node.source.value;
            }
            transform.export(fileObject, originalName, exportName, value, type, exportSource);
          }
        } catch (err) {
          console.log(`Found an error while parsing a function declaration export: ${err}`);
        }

        // for class declarations being exported
        try {
          if (node.declaration.type === 'ClassDeclaration') {
            const originalName = node.declaration.id.name;
            const exportName = originalName;
            const value = generate(node.declaration).code || 'unknown';
            const type = 'named export';
            let exportSource = 'current file';
            if (node.source) {
              exportSource = node.source.value;
            }
            transform.export(fileObject, originalName, exportName, value, type, exportSource);
          }
        } catch (err) {
          console.log(`Found an error while parsing a class declaration export: ${err}`);
        }

        // for variable declarations being exported
        try {
          if (node.declaration.declarations) {
            for (let i = 0; i < node.declaration.declarations.length; i += 1) {
              const originalName = node.declaration.declarations[i].id.name;
              const exportName = originalName;
              // default value
              let value = 'unknown';
              // if we can get it though, set it here
              if (node.declaration.declarations[i].init) {
                value = node.declaration.declarations[i].init.name;
              }
              const type = 'named export';
              let exportSource = 'current file';
              if (node.source) {
                exportSource = node.source.value;
              }
              transform.export(fileObject, originalName, exportName, value, type, exportSource);
            }
          }
        } catch (err) {
          console.log(`Found an error while parsing a variable declaration export: ${err}`);
        }
      }

      // for object exports with variables passed in to build the object
      try {
        if (node.specifiers) {
          for (let i = 0; i < node.specifiers.length; i += 1) {
            const originalName = node.specifiers[i].local.name;
            let exportName = originalName;
            let type = 'named export';
            if (node.specifiers[i].exported.name === 'default') {
              type = 'default export';
            } else if (node.specifiers[i].exported.name) {
              exportName = node.specifiers[i].exported.name;
            }
            const value = 'unknown';
            let exportSource = 'current file';
            if (node.source) {
              exportSource = node.source.value;
            }
            transform.export(fileObject, originalName, exportName, value, type, exportSource);
          }
        }
      } catch (err) {
        console.log(`Found an error while parsing an object export with variables passed in to build the object: ${err}`);
      }
    },

    ExportDefaultDeclaration({ node }) {
      if (node.declaration) {

        // for simple default exports with a variable name
        try {
          if (node.declaration.type === 'Identifier') {
            const originalName = node.declaration.name;
            const exportName = originalName;
            const value = 'unknown';
            const type = 'default export';
            const exportSource = 'current file';
            transform.export(fileObject, originalName, exportName, value, type, exportSource);
          }
        } catch (err) {
          console.log(`Found an error while parsing a default export with a variable name: ${err}`);
        }

        // for default exports that are function definitions
        try {
          if (node.declaration.type === 'FunctionDeclaration') {
            let originalName = 'anonymous';
            if (node.declaration.id) {
              originalName = node.declaration.id.name;
            }
            const exportName = originalName;
            const value = generate(node.declaration).code || 'unknown';
            const type = 'default export';
            const exportSource = 'current file';
            transform.export(fileObject, originalName, exportName, value, type, exportSource);
          }
        } catch (err) {
          console.log(`Found an error while parsing a function definition as a default export: ${err}`);
        }

        // for default exports that are class declarations
        try {
          if (node.declaration.type === 'ClassDeclaration') {
            const originalName = node.declaration.id.name || 'anonymous';
            const exportName = originalName;
            const value = generate(node.declaration).code || 'unknown';
            const type = 'default export';
            const exportSource = 'current file';
            transform.export(fileObject, originalName, exportName, value, type, exportSource);
          }
        } catch (err) {
          console.log(`Found an error while parsing a class declaration as a default export: ${err}`);
        }
      } else {
        console.log('found a default export we couldn\'t process');
      }
    },

    ExportAllDeclaration({ node }) {
      try {
        const originalName = '*';
        const exportName = originalName;
        const value = 'unknown';
        const type = 'export all';
        let exportSource = 'current file';
        if (node.source) {
          exportSource = node.source.value;
        }
        transform.export(fileObject, originalName, exportName, value, type, exportSource);
      } catch (err) {
        console.log(`Found an error while parsing an export all declaration node: ${err}`);
      }
    },
  };

  // this traverses the AST (parsedFile) and uses the visitor object to determine what to do
  // with each part of the AST. this data all gets added to the fileTree
  traverse(parsedFile, visitor);
};

// this is just an easy wrapper for calling the fileParser
const parser = (fileObject) => {
  const filePath = fileObject.fullname;
  fileParser(fileObject, filePath);
};

module.exports = { parser };
