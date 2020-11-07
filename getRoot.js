const path = require('path');

console.log(process.env.INIT_CWD);

module.exports = path.join(process.env.INIT_CWD, 'visualization');
