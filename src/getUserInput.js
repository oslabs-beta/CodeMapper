const readline = require('readline');
const PATH = require('path');
const flow = require('./flow');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// include and exclude arrays that the user can input to and that are passed as parameters to the generateTree function
const includeArr = [];
const excludeArr = [
  'node_modules',
  'LICENSE',
  '.git',
  '.DS_Store',
  '.vscode',
  '.babelrc',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  '.md',
  'app.js',
  'foamtree.js',
];

// set default root path to the same level as this file's folder
let rootDir = PATH.resolve(__dirname, '../');

// modify the include and exclude options based on user input
// Function creates REPL to push files and folders to options include array
function addToInclude() {
  rl.question("Add to include in mapping, or 'm' to map: ", (userInput) => {
    userInput = userInput.trim();

    if (userInput === 'q') process.exit();
    if (userInput === 'm') {
      rl.close();
      console.log(
        '\x1b[32m\n CodeMapper Activated and Processing 📁 🚀...\n\x1b[37m'
      );
      return flow(rootDir, includeArr, excludeArr);
    }
    includeArr.push(userInput);
    return addToInclude();
  });
}

// Function creates REPL to push files and folders to options exclude array
function addToExclude() {
  rl.question("Add to exclude from mapping, or 'm' to map: ", (input) => {
    input = input.trim();

    if (input === 'q') process.exit();
    if (input === 'm') {
      rl.close();
      console.log(
        '\x1b[32m\n CodeMapper Activated and Processing 📁 🚀...\n\x1b[37m'
      );
      return flow(rootDir, includeArr, excludeArr);
    }
    excludeArr.push(input);
    return addToExclude();
  });
}

function getUserChoices() {
  const message =
    "\nPlease type 'i' to choose the include option, or type 'e' for the exclude option: ";
  rl.question(message, (userInput) => {
    userInput = userInput.trim();

    if (userInput === 'q') process.exit();
    if (userInput.toLowerCase() === 'i') addToInclude();
    if (userInput.toLowerCase() === 'e') addToExclude();
    getUserChoices();
  });
}

// Function to create a REPL to get user input through the command line
function rootDirOption() {
  // need to come up with a general path validation pattern test using regex
  const message =
    "You can set a root directory to start the mapping process, or just hit return \nto stick with this folder as the root path.\n\nYou can also type 'm' to map this directory with the default excludes: ";
  rl.question(message, (userInput) => {
    userInput = userInput.trim();

    if (userInput === 'q') process.exit();
    if (userInput === 'm') {
      rl.close();
      console.log(
        '\x1b[32m\n CodeMapper Activated and Processing this directory with defaults 📁 🚀...\x1b[37m'
      );
      return flow(rootDir, includeArr, excludeArr);
    }
    if (userInput.length > 0) {
      rootDir = PATH.resolve(__dirname, userInput);
      rootDir = userInput;
      return getUserChoices();
    }
    if (userInput === '') {
      return getUserChoices();
    }

    return 0;
  });

  return 0;
}

// modify the include or exclude property array in the options object based on user input
const greeting = `Welcome to CodeMapper!\n
  You can choose to include or exclude folders or files to create a
  visualization of. If you use the include option, only those folders or
  files will be included. If you want to map everything with the default
  excluded folders and files, type 'm' at the first prompt.
  \nFolders and Files that are excluded by default are listed below:

  ['node_modules', 'LICENSE', '.git', '.DS_Store', '.vscode', '.babelrc',
  'package.json', 'package-lock.json', 'yarn.lock', '.md']

  If you choose the exclude option, you can add more folders or files to
  the default list.

  Type 'q' to exit the program.
  `;

// Ask if user wants to clear their console before proceeding
rl.question(
  "If you like to clear the console before proceeding, enter 'c': ",
  (userInput) => {
    userInput = userInput.trim();

    if (userInput === 'q') return process.exit();
    if (userInput.toLowerCase() === 'c') process.stdout.write('\x1Bc');

    console.log(greeting);

    return rootDirOption();
  }
);
