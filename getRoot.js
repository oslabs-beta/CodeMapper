const fs = require('fs');
const path = require('path');

const data = `const modulePath = '${path.resolve(process.argv[1], '..', '..', 'visualization')}';`;
console.log('data is ', data);
const writePath = path.resolve(process.argv[1], '..', '..', 'node-module-path.js');
console.log('writePath is ', writePath);

try {
  fs.writeFileSync(
    path.resolve(writePath),
    data,
    'utf8',
  );
} catch (err) {
  console.log('shoot', err);
}

console.log('our path is ', path.resolve(process.argv[1], '..', '..', 'visualization'));

module.exports = path.resolve(process.argv[1], '..', '..', 'visualization');
