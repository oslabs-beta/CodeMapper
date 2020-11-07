const path = require('path');

console.log(process.env.PWD);

module.exports = path.join(process.env.PWD, 'visualization');
