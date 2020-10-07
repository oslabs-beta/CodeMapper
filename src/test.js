// const { readdir } = require('fs').promises;
// const path = require('path');
// // const { resolve, delimiter } = require('path');

// const buildEntireList = async function (dir, includeList) {
//   //   const rootFiles = await readdir(dir, { withFileTypes: true });
//   const getOneLevel = async (pathToFile) =>
//     await pathToFile(dir, { withFileTypes: true });
//   const result = [];
//   includeList.forEach((el) => {
//     const res = path.resolve(dir, el);
//     console.log(res);
//   });

//   //   const files = await Promise.all(
//   //     rootFiles.forEach((file) => {
//   //       const res = resolve(dir, file.name);
//   //       if (includeList.includes(file.name)) {
//   //         return file.isDirectory()
//   //           ? buildEntireList(res, includeList, result)
//   //           : result.push(res);
//   //       }
//   //     })
//   //   ).catch((err) => console.log(err));
//   //   while (rootFiles.length) {}
//   //   console.log(rootFiles);
//   return result;
// };
const { resolve } = require('path');
const { readdir, stat } = require('fs').promises;

async function* getFiles(rootPath) {
  const fileNames = await readdir(rootPath);
  for (const fileName of fileNames) {
    const path = resolve(rootPath, fileName);
    if ((await stat(path)).isDirectory()) {
      yield* getFiles(path);
    } else {
      yield path;
    }
  }
}

(async () => {
  for await (const f of getFiles(
    'D:\\Lessons\\Lectures\\UNIT 08 _ Node\\Unit 8\\approach-node-pages'
  )) {
    console.log(f);
  }
})();

// const included = ['dirname-demo.js', 'README.md', 'server', 'test'];
// buildEntireList(
//   'D:\\Lessons\\Lectures\\UNIT 08 _ Node\\Unit 8\\approach-node-pages',
//   included
// );
