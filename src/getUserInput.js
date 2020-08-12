const readline = require('readline');
const PATH = require('path');
const { generateTree } = require('./generateFileTree');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// include and exclude arrays that the user can input to and that are passed as parameters to the generateTree function
const includeArr = [];
const excludeArr = ['node_modules', 'LICENSE', '.git', '.DS_Store', '.vscode', 'package.json', '-lock.json', '.lock', '.md'];

// set root path, I feel this could be another option given to the user but a default of root can be set if no value is input or input is invalid
let rootDir = PATH.resolve(__dirname, '../');

// modify the include and exclude options based on user input
// Function creates REPL to push files and folders to options include array
function addToInclude() {
  rl.question('Add to include in mapping, or \'m\' to map: ', userInput => {
    if (userInput === 'q') process.exit();
    if (userInput === 'm') {
      rl.close();
      return generateTree(rootDir, includeArr, excludeArr);
    }
    includeArr.push(userInput);
    return addToInclude();
  });
}

// Function creates REPL to push files and folders to options exclude array
function addToExclude() {
  rl.question('Add to exclude from mapping, or \'m\' to map: ', input => {
    if (input === 'q') process.exit();
    if (input === 'm') {
      rl.close();
      return generateTree(rootDir, includeArr, excludeArr);
    }
    excludeArr.push(input);
    return addToExclude();
  });
}

function getUserChoices() {
  const message = '\nPlease type \'i\' to choose the include option, or type \'e\' for the exclude option: ';
  rl.question(message, userInput => {
    if (userInput === 'q') process.exit();
    if (userInput.toLowerCase() === 'i') addToInclude();
    if (userInput.toLowerCase() === 'e') addToExclude();
    getUserChoices();
  });
}

// Function to create a REPL to get user input through the command line
function rootDirOption() {
  // need to come up with a general path validation pattern test using regex
  const message = 'You can set a root directory to start the mapping process, or just hit return \nto stick with the default as this folder\'s root path: ';
  rl.question(message, userInput => {
    if (userInput === 'q') process.exit();
    if (userInput.length > 0) {
      rootDir = PATH.resolve(__dirname, userInput);
      return getUserChoices();
    }
    if (userInput === '') {
      return getUserChoices();
    }
  });
}

// modify options based on user input
const greeting = `Welcome to CodeMapper!\n
You can choose to include or exclude folders or files to create a
visualization of. If you use the include option, only those folders or
files will be included. If you want to map everything simply choose the
type \'i\', and then type \'m\' at the first prompt.
\nFolders and Files that are excluded by default include:

['node_modules', 'LICENSE', '.git*', '.DS_Store', '.vscode',
'package.json', 'package-lock.json', 'yarn.lock', '*.md']

If you choose the exclude option, you can add more folders or files to
the default list.

Type 'q' to exit the program.
`;

// Ask if user wants to clear their console before proceeding
rl.question('If you like to clear the console before proceeding, enter \'c\': ', userInput => {
  if (userInput.toLowerCase() === 'c') process.stdout.write('\033c');

  console.log(greeting);

  return rootDirOption();
});
