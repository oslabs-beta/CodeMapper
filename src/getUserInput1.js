#!/usr/bin/env node
'use strict';

const { readdir } = require('fs').promises;
// const { resolve } = require('path');
const inquirer = require('inquirer');
const figlet = require('figlet');
const cwd = process.cwd();
// const normalizePath = require('./normalizePath');
const chalk = require('chalk');
// const emoji = require('node-emoji');
// const getFiles = require('./readFiles');

const excludes = [
  'LICENSE',
  '.git',
  '.DS_Store',
  '.vscode',
  '.babelrc',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  '.md',
  '__MACOSX',
  '.gitignore',
  'node_modules',
];

const questions = [
  {
    name: 'projectDirectory',
    type: 'input',
    message: 'Now it is the time to select the ptoject folder to analyze?',
    // default: cwd,
    default:
      'D:\\Lessons\\Lectures\\UNIT 08 _ Node\\Unit 8\\approach-node-pages',
  },
];

const askQuestions = (question) => {
  return inquirer.prompt(question);
};

const init = () => {
  console.log(chalk.yellow('\n\n\n W E L C O M E    to'));
  console.log(
    chalk.green(
      figlet.textSync('CodeMapper!', {
        // font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
  console.log(
    chalk.yellow(
      '                             the one and only code analyser! \n\n'
    )
  );
  console.log(
    `How does it work?
    1. Point the folder of your codebase
    2. Add/remove files or folders from project root directory
    3. Blink and enjoy the result!


    `
  );
};

const buildRootList = async (pathToDir) => {
  const list = [];
  // const pathToDir1 = pathToDir;
  const rootList = await readdir(pathToDir, { withFileTypes: true });
  rootList.map((el) => {
    const temp = {
      name: ` ${el.name}`,
      checked: true,
    };
    if (excludes.includes(el.name)) {
      temp.checked = false;
    }
    list.push(temp);
  });

  questions.push({
    type: 'checkbox',
    pageSize: list.length || 20,
    message:
      'Select files/folders to include? Press <enter> to continue with the default selection',
    name: 'includes',
    choices: list,
    // showHelpTip: true,
  });
  return rootList;
};

const run = async () => {
  // show script introduction
  init();

  // ask question 1
  console.log(
    chalk.blue('Press <enter> to continue with the current working directory')
  );
  //prompt q1-> selection of project directory
  const answers = await askQuestions(questions[0]);

  //get the project directory from user input
  const { projectDirectory } = answers;

  //get the files from the root level
  const rootListFiles = await buildRootList(projectDirectory);
  //prompt q2-> precise included and excluded files
  const includes = await askQuestions(questions[1]);

  //modify the answers object with excluded and included files of folders
  answers.included = includes.includes.map((el) => el.trim());

  answers.excluded = rootListFiles
    .map((el) => el.name)
    .filter((el) => answers.included.indexOf(el) == -1);
  console.log(answers);
};

run();

// const run = async () => {
//   init();
//   // console.log('\n\n\n W E L C O M E    to')

//   // figlet('CodeMapper!', function (err, data) {
//   //   if (err) {
//   //     console.log('Ups! i did it again');
//   //     console.dir(err);
//   //     return;
//   //   }
//   //   console.log(data);
//   //   console.log(
//   //     '                             the one and only code analyser! \n\n\n'
//   //   );
//   //   console.log(
//   //     `How does it work?
//   //     1. Point the folder to your codebase
//   //     2. Add/remove files or folders from your root directory
//   //     3. Blink and enjoy the result!
//   //     `
//   //   );
//   // });
//   // collectSomeData();
// };

// function collectSomeData() {
//   inquirer
//     .prompt(questions[0])
//     .then((answers) => {
//       console.log(answers);
//       // buildRootList(answers.projectDirectory);
//     })
//     .catch((error) => console.log(error));
// }

//   inquirer
//     .prompt({
//       type: 'checkbox',
//       pageSize: list.length || 20,
//       message:
//         'Select files/folders to include? Press <enter> to continue with the default selection',
//       name: 'includes',
//       choices: list,
//       showHelpTip: true,
//     })
//     .then((answers, pathToDir) =>
//       buildEntireList(pathToDir1, answers.includes)
//     );
// };

// const buildEntireList = async function getFiles(dir, includeList) {
//   const dirents = await readdir(dir, { withFileTypes: true });
//   const files = await Promise.all(
//     dirents.map((dirent) => {
//       if (includeList.includes(dirent.name.toString())) {
//         console.log(dirent.name);
//         const res = resolve(dir, dirent.name);
//         return dirent.isDirectory() ? getFiles(res) : res;
//       }
//     })
//   );
//   console.log(dir);
//   return Array.prototype.concat(...files);
// };
// const included = [' dirname-demo.js', ' README.md', ' server', ' test'];
// buildEntireList(
//   'D:\\Lessons\\Lectures\\UNIT 08 _ Node\\Unit 8\\approach-node-pages',
//   included
// );

// const dirPath = normalizePath(answers.projectDirectory);
// readdir(dirPath, { withFileTypes: true })
//   .then((data) => {
//     const icon = (el) => {
//       if (el.isDirectory()) {
//         return '📁';
//       } else return '📄';
//     };
//     const list = [];
//     data.map((el) => {
//       // console.log(icon(el));
//       return list.push({ name: `${icon(el)}  ${el.name}` });
//     });
//     questions.push({
//       type: 'checkbox',
//       message: 'Select files/folders to include?',
//       name: 'includes',
//       choices: list,
//     });
//     inquirer.prompt(questions[1]).then((answers) => console.log(answers));
//     // console.log(questions);
//   })
//   .catch((error) => console.log(error));
