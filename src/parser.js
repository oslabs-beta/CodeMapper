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
  fs.writeFileSync('testfiles/data.json', JSON.stringify(ast, null, 2));
};

// we can use this directly if we'd rather pass each file to the parser one at a time
const fileParser = (fileObject, filePath) => {
  // this reads the file so we can parse it
  const readFile = fs.readFileSync(filePath).toString();

  // this parses the file into an AST so we can traverse it
  const parsedFile = parse(readFile, {
    sourceType: 'module',
  });

  // this allows us to traverse the AST
  const visitor = {
    // call transform in here to change the results from babel parsing the JS files
    // into what we need for visualization and other types of sharing results
    // and save that info into our fileTree

    // This is for regular function expressions (not anonymous/arrow functions)
    FunctionDeclaration({ node }) {
      const name = node.id.name;
      const params = node.params;
      const async = node.async;
      const type = node.type;
      const method = false;
      const definition = generate(node).code;
      transform.function(fileObject, name, params, async, type, method, definition);
    },

    // This handles the arrow functions
    VariableDeclaration({ node }) {
      if (node.declarations[0].init && node.declarations[0].init.type === 'ArrowFunctionExpression') {
        const name = node.declarations[0].id.name;
        const params = node.declarations[0].init.params || [];
        const async = node.declarations[0].init.async;
        const type = node.declarations[0].init.type;
        const method = false;
        const definition = generate(node).code;
        transform.function(fileObject, name, params, async, type, method, definition);
      }
    },

    ExpressionStatement({ node }) {
      // This handles class methods
      if (node.expression.right && node.expression.left) {
        const type = node.expression.right.type;
        if (type === 'ArrowFunctionExpression' || type === 'FunctionExpression') {
          const name = `${node.expression.left.object.name}.${node.expression.left.property.name}`;
          const params = node.expression.right.params || [];
          const async = node.expression.right.async;
          const method = true;
          const definition = generate(node).code;
          transform.function(fileObject, name, params, async, type, method, definition);
        }
      }

      // This handles functions' inner function calls
      // if (node.expression === 'CallExpression') {

      // }
    },

    CallExpression(path) {
      console.log(`path.parent.type is ${path.parent.type} for the node path.`);
    }
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
