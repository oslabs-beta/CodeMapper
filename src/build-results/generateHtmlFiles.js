const fs = require('fs').promises;
const path = require('path');

const generateHTMLfiles = async (pathToSource, pathToDestination) => {
  const files = await fs.readdir(pathToSource);

  files.forEach(async (file) => {
    try {
      const data = await fs.readFile(path.resolve(pathToSource, file));

      await fs.writeFile(
        path.resolve(pathToDestination, file),
        data,
        'utf8',
        (err) => {
          if (err) throw err;
        }
      );
    } catch (error) {
      console.log('The problem comes from here', error);
    }
  });
};

module.exports = generateHTMLfiles;
