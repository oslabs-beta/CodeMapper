const { parser } = require('./parser');

// this filters the whole tree recursively to create an flat array of JS file objects
// each time we come to the top of this function, we'll be looking at a new directory
// it goes over one level of one directory at a time
const filterAndParse = (folder, jsFileArray = []) => {
  // iterate over the array of objects
  for (let i = 0; i < folder.length; i += 1) {
    // save a reference to the current file or folder object
    const current = folder[i];
    // if "isDirectory" is true for this object...
    // check to see if content is an array with at least one element
    if (current.isDirectory === true && current.content.length >= 1) {
      // if so, pass the folders contents into handleFolder recursively, along with the file array
      filterAndParse(current.content, jsFileArray);
      // if there are no contents we move on because it's an empty folder
    } else if (current.extension === '.js') {
      // if isDirectory was false, this is a file, so check if this object has extension ".js"
      // if it does, add the object to our jsFileArray
      jsFileArray.push(current);
      // we could call parse because it's a JS file
      parser(current);
    }
  }
};

// this allows this whole piece of functionality to be called from another place
module.exports = { filterAndParse };
