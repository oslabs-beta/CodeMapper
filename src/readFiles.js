// const path = require('path');
// const fs = require('fs');
const normalizePath = require('./normalizePath');

// const directoryPath = path.join(__dirname, 'files');

const dirPath = normalizePath('D:\\Lessons\\Strategies');
const { resolve } = require('path');
const { readdir } = require('fs').promises;

async function* getFiles(dir) {
  const rootLevelList = yield readdir(dir, {
    withFileTypes: true,
  });

  console.log(rootLevelList);

  const getAllFiles = async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* getAllFiles(res);
      } else {
        yield res;
      }
    }
  };
}
const result = getFiles(dirPath);

result.next().then((dirents) => {
  console.log(dirents.value);
});
result.next().then((dirents) => {
  console.log(dirents);
});
// console.log(result.next());

// (async () => {
//   await getFiles(dirPath);
//   for await (const f of getFiles(dirPath)) {
//     console.log(f);
//   }
// })();

// async function getFiles(dir) {
//   const dirents = await readdir(dir, { withFileTypes: true });
//   const files = await Promise.all(
//     dirents.map((dirent) => {
//       const res = resolve(dir, dirent.name);
//       return dirent.isDirectory() ? getFiles(res) : res;
//     })
//   );
//   return files;
// }

// getFiles(dirPath)
//   .then((files) => console.log(files))
//   .catch((e) => console.error(e));

// var walk = function (dir, done) {
//   var results = [];
//   fs.readdir(dir, function (err, list) {
//     if (err) return done(err);
//     var pending = list.length;
//     if (!pending) return done(null, results);
//     list.forEach(function (file) {
//       file = path.resolve(dir, file);
//       fs.stat(file, function (err, stat) {
//         if (stat && stat.isDirectory()) {
//           walk(file, function (err, res) {
//             results = results.concat(res);
//             if (!--pending) done(null, results);
//           });
//         } else {
//           results.push(file);
//           if (!--pending) done(null, results);
//         }
//       });
//     });
//   });
// };

// walk(dirPath, (err, res) => {
//   console.log(res);
// });

// console.log(dirPath);
// fs.readdir(dirPath, function (err, files) {
//   if (err) {
//     console.log('Error getting directory information.');
//   } else {
//     files.forEach(function (file) {
//       console.log(file);
//     });
//   }
// });

// const oneLevelPromise = (dirPath) => {
//   return new Promise((resolve, reject) => {
//     fs.readdir(dirPath, (error, content) => {
//       if (error) {
//         reject(error);
//       } else {
//         return resolve(content);
//       }
//     });
//   });
// };

// oneLevelPromise(dirPath)
//   .then((list) => {
//     list.forEach((file, index) => {
//       let tempPath = path.join(dirPath, file);
//       let temp = list[index];
//       list[index] = {};
//       list[index].isDirectory = false;
//       list[index].name = temp;

//       fs.stat(tempPath, (err, statsObj) => {
//         if (statsObj.isDirectory()) {
//           list[index].isDirectory = true;
//         }
//       });
//       // return list;
//     });
//   })
//   .then((data) => console.log(data));

// function getAllLevels(dirPath, ignore = [], result = []) {
//   debugger;
//   oneLevelPromise(dirPath)
//     .then((fileList) => {
//       fileList.forEach((file, i) => {
//         let tempPath = path.join(dirPath, file);

//         if (fs.statSync(tempPath).isDirectory() && !ignore.includes(file)) {
//           getAllLevels(tempPath, ignore, result);
//         } else if (!fs.statSync(tempPath).isDirectory()) {
//           return result.push(tempPath);
//         }
//       });
//       console.log('content of the result ->', result);

//       return result;
//     })

//     .catch((err) => console.log('ERROR_->', err));
//   console.log('content of the result s->', result);

//   return result;
// }
// getAllLevels(dirPath, (ignore = []), (result = []));

module.exports = getFiles;
