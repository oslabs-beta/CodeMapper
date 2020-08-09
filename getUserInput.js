const readline = require('readline');
const { generateTree } = require('./generateFileTree');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// call generateResult after getting userinput
const options = {
  mode: TREE,
  recursive: true,
  stats: true,
  ignoreFolders: true,
  extensions: true,
  depth: true,
  realPath: true,
  normalizePath: true,
  include: [],
  exclude: ['node_modules', 'LICENSE', '.git', '.DS_Store', '.vscode', 'package.json', '-lock.json', '.lock', '.md'],
  readContent: false,
  encoding: 'base64',
};

// clear console before getting user input
process.stdout.write('\033c');
// modify options based on user input
const greeting = `Welcome to CodeMapper!\n
You can choose to include or exclude directories or files to create a
visualization of. If you use the include option, only those directories or
files will be included. Files that are excluded by default include:
['node_modules', 'LICENSE', '.git', '.DS_Store', '.vscode', 'package.json',
'-lock.json', '.lock', '.md']
If you choose the exclude option, you can add more directories or files.
Type 'q' to exit the program.
`;
console.log(greeting);

// Function creates REPL to push files and folders to options include array
function addToInclude() {
  rl.question('Add to include in mapping, or \'m\' to map: ', userInput => {
    if (userInput === 'q') process.exit();
    if (userInput === 'm') {
      rl.close();
      return generateResult('./', options);
    }
    options.include.push(userInput);
    return addToInclude();
  });
}

// Function creates REPL to push files and folders to options include array
function addToExclude() {
  rl.question('Add to exclude from mapping, or \'m\' to map: ', exclude => {
    if (exclude === 'q') process.exit();
    if (exclude === 'm') {
      rl.close();
      return generateResult('./', options);
    }
    options.exclude.push(exclude);
    return addToExclude();
  });
}

// Function to create a REPL to get user input through the command line
function getUserChoices() {
  const message = 'Please type \'i\' to choose the include option, or type \'e\' for the exclude option.\n';
  rl.question(message, userInput => {
    if (userInput === 'q') process.exit();
    if (userInput.toLowerCase() === 'i') addToInclude();
    if (userInput.toLowerCase() === 'e') addToExclude();
    getUserChoices();
  });
}

getUserChoices();
