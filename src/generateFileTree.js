const { list } = require('./filewalker');

// This is our internal function to run the filewalker with all the options passed in.
// When we replace the filewalker with Nadya's new version, we can get rid of this file completely
// The filewalker functionality is adapted from recursive-readdir-async repo/npm library
// More details on the options passed in here can be found in that documentation until we add our own
async function generateTree(rootPath, include = [], exclude = []) {
  // commenting list out as we are not using it
  // const LIST = 1;
  const TREE = 2;
  // until we have user input we are manually setting all the options here
  // we will only expose the include and exclude options to the user
  const options = {
    mode: TREE,
    recursive: true,
    stats: false,
    size: true,
    ignoreFolders: true,
    extensions: true,
    depth: true,
    realPath: true,
    normalizePath: true,
    include,
    exclude,
    readContent: false,
    encoding: 'base64',
  };

  // We want to pass in the path first. After that we can pass in options (defined above) if we want, or we can put a callback as the second argument.
  // If we want options and a callback, we can pass in the callback as the third argument, with the second argument as the options object
  // The callback can have three parameters - object, index, and total
  // Index is the item number for the item in the specific folder that we're looking at
  // Object is the object with the details about the file
  // Total is how many files are in the folder
  // This is an example of a callback we could use as the third argument to "list" to keep track of the progress of the filewalker process
  // It's totally optional though, there doesn't have to be a callback passed into the list function
  // (obj, index, total) => {
  // console.log(`${index} of ${total} ${obj.path}`);
  // }
  // It seems like we can use properties like object.path in our callback because all properties are accessible once the object is available

  // We start by getting a list of the files using the options and the root path
  const fileTree = await list(rootPath, options);

  return fileTree;
}

module.exports = { generateTree };
