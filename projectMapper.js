/* eslint-disable no-param-reassign */
// #!/usr/bin/env node
// 'use strict';

const fs = require('fs');
const PATH = require('path');

const LIST = 1;
// module.exports.LIST = LIST;

const TREE = 2;
module.exports.TREE = TREE;

/*
 * Variables
 */
let pathSymbol = '/';

async function stat(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}
// module.exports.stat = stat;

async function readFile(file, encoding) {
  if (encoding === undefined) {
    encoding = 'base64';
  }

  return new Promise((resolve, reject) => {
    let encode;

    if (encoding) {
      encode = { encoding };
    } else {
      encode = {};
    }

    fs.readFile(file, encode, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
// module.exports.readFile = readFile;

//  Returns true if an item should be added based on the exclude options.
function include(path, settings) {
  for (let i = 0; i < settings.exclude.length; i += 1) {
    if (path.indexOf(settings.exclude[i]) > -1) {
      return false;
    }
  }
  return true;
}

// Normalizes Windows style paths by replacing double backslahes with single forward slahes (unix style).
function normalizePath(path) {
  return path.toString().replace(/\\/g, '/');
}

// Returns a Promise with an array of objects where each object holds the properties for a file or folder
async function generateOneLevel(path, settings, depth) {
  const data = [];

  // Adds optional keys to item (file extensions and depth level as new properties)
  function addOptionalKeys(obj, file) {
    if (settings.extensions) {
      obj.extension = PATH.extname(file).toLowerCase();
    }
    if (settings.depth) {
      obj.depth = depth;
    }
  }

  return new Promise((resolve, reject) => {
    try {
      // Asynchronously computes the canonical pathname by resolving ".", "..", and symbolic links.
      fs.realpath(path, (err, rpath) => {
        if (err || settings.realPath === false) {
          rpath = path;
        }

        // Normalizes Window's style paths by replacing double backslahes with single forward slahes (unix style).
        if (settings.normalizePath) {
          rpath = normalizePath(rpath);
        }

        // Reading contents of path
        fs.readdir(rpath, (error, files) => {
          // If there's an error, reject them
          if (error) {
            reject(error);
          } else {
            // Otherwise, iterate through elements (files and folders)
            for (let i = 0; i < files.length; i += 1) {
              const obj = {
                name: files[i],
                path: rpath,
                // fullname concatenates the path and file name, adding a "/" if it's not there
                fullname: rpath + (rpath.endsWith(pathSymbol) ? '' : pathSymbol) + files[i],
              };

              // If there are any optional keys to add to the file/folder object, we add them here
              // But first, we check to make sure that file/folder should be included
              if (include(obj.fullname, settings)) {
                addOptionalKeys(obj, files[i]);
                data.push(obj);
              }
            }

            // Finish and return the array of objects (each object is the details for a file or folder from this layer)
            resolve(data);
          }
        });
      });
    } catch (err) {
      // If there's an error, reject instead of resolving
      reject(err);
    }
  });
}

// Returns an array of items in path, starting depth at 0 if it's not yet defined
async function processOneLevel(path, settings, progress, depth = 0) {
  let filesList;

  // Gets the array of file/folder objects and saves it.
  try {
    filesList = await generateOneLevel(path, settings, depth);
  } catch (err) {
    return { error: err, path };
  }

  // If we want to recurse into another layer...
  if (
    settings.stats
    || settings.recursive
    || !settings.ignoreFolders
    || settings.readContent
    || settings.mode === TREE
  ) {
    filesList = await statDir(filesList, settings, progress, depth);
  }

  function onlyInclude() {
    function exists(fullname) {
      for (let j = 0; j < settings.include.length; j++) {
        if (fullname.indexOf(settings.include[j]) > -1) {
          return true;
        }
      }
      return false;
    }

    if (settings.include.length > 0) {
      for (let i = filesList.length - 1; i > -1; i--) {
        let item = filesList[i];

        if (settings.mode === TREE && item.isDirectory && item.content) continue;

        if (!exists(item.fullname)) {
          filesList.splice(i, 1);
        }
      }
    }
  }

  // This makes sure that if the user sets "include" to true, we ignore all other files/folders
  onlyInclude();

  return filesList;
}


// Returns an object with all items with selected options
async function statDir(list, settings, progress, depth) {
  let isOk = true;
  // Iterate over the list from the end to the start, adjusting as needed because we may delete items from the list
  for (let i = list.length - 1; i > -1; i -= 1) {
    try {
      // Pass the list, the index, the user settings, the progress (passed from the function that calls statDir), and the current depth
      list = await statDirItem(list, i, settings, progress, depth);
      // If progress is defined...
      if (progress !== undefined) {
        // Set isOk to the opposite of invoking progress with the current item, the list length minus the current index, and the total list length
        isOk = !progress(list[i], list.length - i, list.length);
      }
    } catch (err) {
      list[i].error = err;
    }
    if (
      (list[i].isDirectory
        && settings.ignoreFolders
        && !list[i].content
        && list[i].error === undefined)
      || !isOk
    ) {
      list.splice(i, 1);
    }
  }
  return list;
}
/**
 * Returns an object with updated item information
 * @param {object} list items list
 * @param {number} i index of item
 * @param {object} settings the options to use
 * @param {function} progress callback progress
 * @param {number} depth folder depth
 * @returns {object[]} array with file information
 * @private
 */
async function statDirItem(list, i, settings, progress, depth) {
  const stats = await stat(list[i].fullname);
  list[i].isDirectory = stats.isDirectory();
  if (settings.stats) {
    list[i].stats = stats;
  }
  if (settings.readContent && !list[i].isDirectory) {
    list[i].data = await readFile(list[i].fullname, settings.encoding);
  }
  if (list[i].isDirectory && settings.recursive) {
    if (settings.mode === LIST) {
      list = list.concat(
        await processOneLevel(list[i].fullname, settings, progress, depth + 1),
      );
    } else {
      list[i].content = await processOneLevel(
        list[i].fullname,
        settings,
        progress,
        depth + 1,
      );
      if (list[i].content.length === 0) {
        list[i].content = null;
      }
    }
  }

  return list;
}

// Outermost function which returns a javascript object with directory items information (non blocking async with Promises)
// progress optional callback defined by the user to handle additional processing for each item
// returns a promise array with file/folder information

// options in this case has mode, recursive, stats, and ignoreFolders properties
// module.exports.list =
async function list(path, options, progress) {
  // If options is skipped, but a callback function is passed in, then set "progress" to be the callback function
  if (typeof options === 'function') {
    progress = options;
  }

  // {LIST|TREE} mode - The list will return an array of items. The tree will return the items structured like the file system. Default: LIST
  // recursive - If true, files and folders of folders and subfolders will be listed. If false, only the files and folders of the select directory will be listed. Default: true
  // stats - If true a stats object (with file information) will be added to every item. If false this info is not added. Default: false.
  // ignoreFolders - If true and mode is LIST, the list will be returned with files only. If true and mode is TREE, the directory structures without files will be deleted. If false, all empty and non empty directories will be listed. Default: true
  // extensions - If true, lowercase extensions will be added to every item in the extension object property (file.TXT => info.extension = ".txt"). Default: false
  // depth - If true, folder depth information will be added to every item starting with 0 (initial path), and will be incremented by 1 in every subfolder. Default: false
  // realPath - Computes the canonical pathname by resolving ., .. and symbolic links. Default: true
  // normalizePath - Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style). Default: true
  // include - Positive filter the items: only items which DO (partially or completely) match one of the strings in the include array will be returned. Default: []
  // exclude - Negative filter the items: only items which DO NOT (partially or completely) match any of the strings in the exclude array will be returned. Default: []
  // readContent -  Adds the content of the file into the item (base64 format). Default: false
  // encoding - Sets the encoding format to use in the readFile FS native node function (ascii, base64, binary, hex, ucs2/ucs-2/utf16le/utf-16le, utf8/utf-8, latin1). Default: 'base64'

  // Setting default settings
  const settings = {
    mode: LIST,
    recursive: true,
    stats: false,
    ignoreFolders: true,
    extensions: false,
    depth: false,
    realPath: true,
    normalizePath: true,
    include: [],
    exclude: [],
    readContent: false,
    encoding: undefined,
  };

  // Applying options (if set)
  setOptions();

  // Setting pathSymbol if normalizePath is disabled
  if (settings.normalizePath === false) {
    pathSymbol = PATH.sep;
  } else {
    pathSymbol = '/';
  }

  // Start the process of reading contents from the root path
  return processOneLevel(path, settings, progress);

  // sets the user settings
  function setOptions() {
    if (options) {
      // iterate over the options keys with for/in
      // for each key, if it's defined, then set the same property on the settings object
      if (options.recursive !== undefined) {
        settings.recursive = options.recursive;
      }
      if (options.mode !== undefined) {
        settings.mode = options.mode;
      }
      if (options.stats !== undefined) {
        settings.stats = options.stats;
      }
      if (options.ignoreFolders !== undefined) {
        settings.ignoreFolders = options.ignoreFolders;
      }
      if (options.depth !== undefined) {
        settings.depth = options.depth;
      }
      if (options.extensions !== undefined) {
        settings.extensions = options.extensions;
      }
      if (options.realPath !== undefined) {
        settings.realPath = options.realPath;
      }
      if (options.normalizePath !== undefined) {
        settings.normalizePath = options.normalizePath;
      }
      if (options.include !== undefined) {
        settings.include = options.include;
      }
      if (options.exclude !== undefined) {
        settings.exclude = options.exclude;
      }
      if (options.readContent !== undefined) {
        settings.readContent = options.readContent;
      }
      if (options.encoding !== undefined) {
        settings.encoding = options.encoding;
      }
    }
  }
}

// This is our internal function to actually run the filewalker with all the options passed in.
// The above filewalker functionality is adapted from recursive-readdir-async repo/npm library
// More details on the options passed in here can be found in that documentation until we add our own
async function generateResult(dirPath, options) {
  // We want to pass in the path first. After that we can pass in options (defined above) if we want, or we can put a callback as the second argument.
  // If we want options and a callback, we can pass in the callback as the third argument, with the second argument as the options object
  // The callback can have three parameters - object, index, and total
  // Index is the item number for the item in the specific folder that we're looking at
  // Object is the object with the details about the file
  // Total is how many files are in the folder
  // It seems like we can use properties like object.path in our callback because all properties are accessible once the object is available
  const listFiles = await list(dirPath, options, (obj, index, total) => {
    // console.log(`${index} of ${total} ${obj.path}`);
  });

  if (listFiles.error) console.error(listFiles.error);
  else {
    // create a data file if it doesn't exist
    const dataFile = './data';
    if (!fs.existsSync(dataFile)) fs.mkdirSync(dataFile);
    fs.writeFile('./data/foamtreeData.js', `module.exports = ${JSON.stringify(listFiles, null, 2)};\n`, err => {
      if (err) console.error(`Error writing ${err}`);
      console.log(JSON.stringify(listFiles, null, 2));

      process.exit();
    });
  }
}

module.exports.generateResult = generateResult;