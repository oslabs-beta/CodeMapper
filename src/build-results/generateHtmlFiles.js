const fs = require('fs').promises;
const path = require('path');

// this creates all the html files so the end user can see the results of their codebase analysis
const generateHTMLfiles = async (pathToSource, pathToDestination) => {
  // make container folders for required CodeMapper files so we can put them in a person's project
  // if (!fs.existsSync(`${pathToDestination}/CodeMapper`)) {
  //   fs.mkdirSync(`${pathToDestination}/CodeMapper`);
  // }
  // if (!fs.existsSync(`${pathToDestination}/CodeMapper/Data`)) {
  //   fs.mkdirSync(`${pathToDestination}/CodeMapper/Data`);
  // }
  // if (!fs.existsSync(`${pathToDestination}/CodeMapper/Visualization`)) {
  //   fs.mkdirSync(`${pathToDestination}/CodeMapper/Visualization`);
  // }

  // const pathToViz = `${pathToDestination}/CodeMapper/Visualization`;

  let files;
  try {
    console.log('path to source is ', pathToSource);
    files = await fs.readdir(pathToSource);
    console.log('got files successfully');
  } catch (err) {
    console.log('Had trouble getting the source folder. Error: ', err);
  }

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

console.log('process.env.INIT_CWD is ', process.env.INIT_CWD, ' and process argv[1] is ', process.argv[1]);

module.exports = generateHTMLfiles;

// generateHTMLfiles(path.resolve(process.env.INIT_CWD, 'visualization'), process.cwd());
