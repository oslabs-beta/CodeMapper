const { parse } = require('@babel/parser');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const fs = require('fs');
const { transform } = require('./transform');

// this function is only for dev and can be removed for production
const createAST = filePath => {
  // this gets used by transformSync to generate our AST (only used in dev)
  const source = fs.readFileSync(filePath, 'utf8');

  // create the AST just for us to see and work with temporarily (won't be used for end user)
  const { ast } = babel.transformSync(source, {
    filename: filePath,
    ast: true,
    code: true,
  });

  // write the ast to a file (temporary)
  fs.writeFileSync('../data/data.json', JSON.stringify(ast, null, 2));
};

// we can use this directly if we'd rather pass each file to the parser one at a time
const fileParser = (fileObject, filePath) => {
  // this reads the file so we can parse it
  const readFile = fs.readFileSync(filePath).toString();

  // this parses the file into an AST so we can traverse it
  const parsedFile = parse(readFile, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
    ],
  });

  // this allows us to traverse the AST
  const visitor = {
    // call transform in here to change the results from babel parsing the JS files
    // into what we need for visualization and other types of sharing results
    // and save that info into our fileTree

    // This is for regular function expressions (not anonymous/arrow functions)
    FunctionDeclaration({ node }) {
      const { name } = node.id;
      const { params } = node;
      const { async } = node;
      const { type } = node;
      const method = false;
      const definition = generate(node).code;

      transform.functionDefinition(fileObject, name, params, async, type, method, definition);
    },

    // This handles the arrow functions
    VariableDeclaration({ node }) {
      if (node.declarations[0].init && node.declarations[0].init.type === 'ArrowFunctionExpression') {
        const { name } = node.declarations[0].id;
        const params = node.declarations[0].init.params || [];
        const { async } = node.declarations[0].init;
        const { type } = node.declarations[0].init;
        const method = false;
        const definition = generate(node).code;
        transform.functionDefinition(fileObject, name, params, async, type, method, definition);
      }
    },

    // This handles class methods
    ExpressionStatement({ node }) {
      if (node.expression.right && node.expression.left) {
        const { type } = node.expression.right;
        if (type === 'ArrowFunctionExpression' || type === 'FunctionExpression') {
          const name = `${node.expression.left.object.name}.${node.expression.left.property.name}` || 'anonymousMethod';
          const params = node.expression.right.params || [];
          const { async } = node.expression.right;
          const method = true;
          const definition = generate(node).code;
          transform.functionDefinition(fileObject, name, params, async, type, method, definition);
        }
      }

      // This handles functions' inner function calls
      // if (node.expression === 'CallExpression') {
      // }
    },

    // This handles functions that are defined inside of iffys
    FunctionExpression(path) {
      const { node } = path;
      // ignore any that are assignment expressions because they are handled in the above Expression Statement block
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
        transform.functionDefinition(fileObject, name, params, async, type, method, definition);
      }
    },

    // for outer function calls
    CallExpression(path) {
      // destructuring node from the path
      const { node } = path;

      let name;
      let type;
      // we'll grab the name of the function being called
      // for regular functions
      if (node.callee && node.callee.name) {
        name = node.callee.name;
        type = 'function';
      } else if (node.callee.object && node.callee.object.name) {
        // for regular class methods
        name = `${node.callee.object.name}.${node.callee.property.name}`;
        type = 'method';
      } else if (node.callee.object.object && node.callee.object.property && node.callee.object.object.name && node.callee.object.property.name) {
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
      const args = node.arguments;

      transform.functionCall(fileObject, name, type, args);

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
  };

  // this traverses the AST (parsedFile) using the visitor object to determine what to do with the AST
  traverse(parsedFile, visitor);
  // once this is done, we should see the data in a file called functions.js
  // this is a temporary way to easily look at the data. In the end we will be adding to the fileTree
  // rather than pushing this data to a file
};

// this is just an easy wrapper for calling both of the above functions.
// later we can just export the fileParser and delete all the AST stuff
const parser = fileObject => {
  const filePath = fileObject.fullname;
  createAST(filePath);
  fileParser(fileObject, filePath);
};

module.exports = { parser };
