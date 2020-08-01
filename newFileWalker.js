/* eslint-disable no-param-reassign */
// #!/usr/bin/env node
// 'use strict';

const fs = require('fs');
const dPath = require('path');

const LIST = 1;
// module.exports.LIST = LIST;

const TREE = 2;
// module.exports.TREE = TREE;

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

//  Returns if an item should be added based on include/exclude options.

function checkItem(path, settings) {
  for (let i = 0; i < settings.exclude.length; i++) {
    if (path.indexOf(settings.exclude[i]) > -1) {
      return false;
    }
  }
  return true;
}

//  Returns a Promise with an objects info array

async function myReaddir(path, settings, deep) {
  const data = [];

  return new Promise(((resolve, reject) => {
    try {
      // Asynchronously computes the canonical pathname by resolving ., .. and symbolic links.
      fs.realpath(path, (err, rpath) => {
        if (err || settings.realPath === false) {
          rpath = path;
        }

        // Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style).
        if (settings.normalizePath) {
          rpath = normalizePath(rpath);
        }

        // Reading contents of path
        fs.readdir(rpath, (err, files) => {
          // If error reject them
          if (err) {
            reject(err);
          } else {
            // Iterate through elements (files and folders)
            for (let i = 0; i < files.length; i++) {
              // const baseFolder = dPath.dirname(path);
              const pathArr = path.split('/');
              const rootDir = dPath.resolve(__dirname).split('/').pop();
              const rootIdx = pathArr.indexOf(rootDir);
              let folderPath = pathArr.slice(rootIdx + 1).join('/');
              // format root path from './' to '/', or add '/' at beginning
              if (folderPath === './') folderPath = '/';
              else folderPath = `/${folderPath};`
              // create object for each path
              const obj = {
                name: files[i],
                folder: `${folderPath}`,
                path: rpath,
                fullname:
                  rpath
                  + (rpath.endsWith(pathSymbol) ? '' : pathSymbol)
                  + files[i],
              };

              if (checkItem(obj.fullname, settings)) {
                addOptionalKeys(obj, files[i]);
                data.push(obj);
              }
            }

            // Finish, returning content
            resolve(data);
          }
        });
      });
    } catch (err) {
      // If error reject them
      reject(err);
    }
  }));

  /**
   * Adds optional keys to item
   * @param {object} obj the item object
   * @param {string} file the filename
   * @private
   */
  function addOptionalKeys(obj, file) {
    if (settings.extensions) {
      obj.extension = PATH.extname(file).toLowerCase();
    }
    if (settings.deep) {
      obj.deep = deep;
    }
  }
}
/**
 * Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style).
 * @param  {string} path windows/unix path
 * @return {string} normalized path (unix style)
 * @private
 */
function normalizePath(path) {
  return path.toString().replace(/\\/g, '/');
}

//  * Returns an array of items in path

async function listDir(path, settings, progress, deep) {
  let list;
  deep = deep === undefined ? 0 : deep;
  try {
    list = await myReaddir(path, settings, deep);
  } catch (err) {
    return { error: err, path };
  }

  if (
    settings.stats
    || settings.recursive
    || !settings.ignoreFolders
    || settings.readContent
    || settings.mode === TREE
  ) {
    list = await statDir(list, settings, progress, deep);
  }

  onlyInclude();

  return list;

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
      for (let i = list.length - 1; i > -1; i--) {
        let item = list[i];

        if (settings.mode === TREE && item.isDirectory && item.content) { continue; }

        if (!exists(item.fullname)) {
          list.splice(i, 1);
        }
      }
    }
  }
}
/**
 * Returns an object with all items with selected options
 * @param {object} list items list
 * @param {object} settings the options to use
 * @param {function} progress callback progress
 * @param {number} deep folder depth
 * @returns {object[]} array with file information
 * @private
 */
async function statDir(list, settings, progress, deep) {
  let isOk = true;
  for (let i = list.length - 1; i > -1; i--) {
    try {
      list = await statDirItem(list, i, settings, progress, deep);
      if (progress !== undefined) {
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
 * @param {number} deep folder depth
 * @returns {object[]} array with file information
 * @private
 */
async function statDirItem(list, i, settings, progress, deep) {
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
        await listDir(list[i].fullname, settings, progress, deep + 1),
      );
    } else {
      list[i].content = await listDir(
        list[i].fullname,
        settings,
        progress,
        deep + 1,
      );
      if (list[i].content.length === 0) {
        list[i].content = null;
      }
    }
  }

  return list;
}

/**
 * Returns a javascript object with directory items information (non blocking async with Promises)
 * @param {string} path the path to start reading contents
 * @param {Options=} options options (mode, recursive, stats, ignoreFolders)
 * @param {CallbackFunction=} progress callback with item data and progress info for each item
 * @returns {Promise<File[]|Folder[]>} promise array with file/folder information
 * @async
 */
// module.exports.list =
async function list(path, options, progress) {
  // options skipped?
  if (typeof options === 'function') {
    progress = options;
  }

  /**
   *  @typedef Options
   *  @type {object}
   *  @property {LIST|TREE} mode - The list will return an array of items. The tree will return the items structured like the file system. Default: LIST
   *  @property {boolean} recursive - If true, files and folders of folders and subfolders will be listed. If false, only the files and folders of the select directory will be listed. Default: true
   *  @property {boolean} stats - If true a stats object (with file information) will be added to every item. If false this info is not added. Default: false.
   *  @property {boolean} ignoreFolders - If true and mode is LIST, the list will be returned with files only. If true and mode is TREE, the directory structures without files will be deleted. If false, all empty and non empty directories will be listed. Default: true
   *  @property {boolean} extensions - If true, lowercase extensions will be added to every item in the extension object property (file.TXT => info.extension = ".txt"). Default: false
   *  @property {boolean} deep - If true, folder depth information will be added to every item starting with 0 (initial path), and will be incremented by 1 in every subfolder. Default: false
   *  @property {boolean} realPath - Computes the canonical pathname by resolving ., .. and symbolic links. Default: true
   *  @property {boolean} normalizePath - Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style). Default: true
   *  @property {string[]} include - Positive filter the items: only items which DO (partially or completely) match one of the strings in the include array will be returned. Default: []
   *  @property {string[]} exclude - Negative filter the items: only items which DO NOT (partially or completely) match any of the strings in the exclude array will be returned. Default: []
   *  @property {boolean} readContent -  Adds the content of the file into the item (base64 format). Default: false
   *  @property {string} encoding - Sets the encoding format to use in the readFile FS native node function (ascii, base64, binary, hex, ucs2/ucs-2/utf16le/utf-16le, utf8/utf-8, latin1). Default: 'base64'
   */
  // Setting default settings
  const settings = {
    mode: LIST,
    recursive: true,
    stats: false,
    ignoreFolders: true,
    extensions: false,
    deep: false,
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

  // Reading contents
  return listDir(path, settings, progress);

  // sets the user settings
  function setOptions() {
    if (options) {
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
      if (options.deep !== undefined) {
        settings.deep = options.deep;
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

async function generateResult(dirPath) {
  const options = {
    mode: LIST,
    recursive: true,
    stats: false,
    ignoreFolders: true,
    extensions: false,
    deep: false,
    realPath: true,
    normalizePath: true,
    include: [],
    exclude: ['node_modules', '.git'],
    readContent: false,
    encoding: 'base64',
  };
  const listFiles = await list(dirPath, options);
  if (listFiles.error) console.error(listFiles.error);
  else console.log(listFiles);
}

// console.clear(process.stdout.write('\033c'));
process.stdout.write('\033c');

const sourceFoldr = './';
generateResult(sourceFoldr);
