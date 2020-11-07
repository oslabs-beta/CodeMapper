const path = require('path');

console.log('initial path is process.argv[1], and then our path is ', path.resolve(process.argv[1], '..', '..', 'visualization'));

module.exports = path.resolve(process.argv[1], '..', '..', 'visualization');
