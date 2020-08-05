const { parse } = require('@babel/parser');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const fs = require('fs');

const readFile = fs.readFileSync('fileWalker.js').toString();
const parsedFile = parse(readFile, {
  sourceType: 'module',
});
const filename = 'fileWalker.js';
const source = fs.readFileSync(filename, 'utf8');
const { ast } = babel.transformSync(source, {
  filename,
  ast: true,
  code: true,
});

const visitor = {
  enter(path) {
    if (path.type !== 'ObjectPattern') return;
    path.traverse({
      noScope: true,
      Property(path) {
        // fs.writeFileSync('data1.js', path);
        // console.log('Property: only get here using babel', path);
      },
      ObjectProperty(path) {
        // fs.writeFileSync('dataFromObject.js', path);
      },
    });
  },
};
traverse(parsedFile, visitor);

fs.writeFileSync('data.json', JSON.stringify(ast));
console.log(ast);
