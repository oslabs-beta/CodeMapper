const fs = require('fs').promises;
const path = require('path');

// this creates all the html files so the end user can see the results of their codebase analysis
const generateHTMLfiles = async (pathToSource, pathToDestination) => {
  console.log('got into generateHTMLfiles');
  const files = await fs.readdir(pathToSource);

  files.forEach(async (file) => {
    try {
      const data = await fs.readFile(path.resolve(pathToSource, file));

      await fs.writeFile(
        path.resolve(pathToDestination, file),
        data,
        'utf8',
        (err) => {
          if (err) console.log('error is ', err);
        }
      );
    } catch (error) {
      console.log('Error while generating final html files: ', error);
    }
  });
};

module.exports = generateHTMLfiles;
