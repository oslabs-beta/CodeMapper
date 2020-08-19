const { parse } = require('@babel/parser');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
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
  // fs.writeFileSync('testfiles/data.json', JSON.stringify(ast, null, 2));
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

    // This is a simple example
    Function(path) {
      console.log({ path });
      // it currently saves each function to a file
      // we need to rewrite it to save the info we need as a property on the object
      // for the file we're currently looking at
      transform.function(path, fileObject);
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
