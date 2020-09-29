#!/usr/bin/env node
'use strict';

// const program = require('commander');
const { readdir } = require('fs').promises;
// const { resolve } = require('path');
const inquirer = require('inquirer');
// const figlet = require('figlet');
const cwd = process.cwd();
// const normalizePath = require('./normalizePath');
// const chalk = require('chalk');
// const emoji = require('node-emoji');
// const getFiles = require('./readFiles');

// figlet('CodeMapper!', function (err, data) {
//   if (err) {
//     console.log('Ups! i did it again');
//     console.dir(err);
//     return;
//   }
//   console.log(data);
// });

// const questions = [
//   {
//     name: 'projectDirectory',
//     type: 'input',
//     message: 'Please, a ptoject folder to analyze?',
//     // default: cwd,
//     default:
//       'D:\\Lessons\\Lectures\\UNIT 08 _ Node\\Unit 8\\approach-node-pages',
//   },
//   // {
//   //   name: 'includes',
//   //   type: 'list',
//   //   message: 'You can select specific folders o',
//   //   choices: ['include', 'exclude'],
//   // },
// ];
const excludes = [
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
  '__MACOSX',
  '.gitignore',
];

inquirer
  .prompt({
    name: 'projectDirectory',
    type: 'input',
    message: 'Please, a ptoject folder to analyze?',
    default: cwd,
    // default:
    // 'D:\\Lessons\\Lectures\\UNIT 08 _ Node\\Unit 8\\approach-node-pages',
  })
  .then((answers) => {
    // console.log(answers);
    buildRootList(answers.projectDirectory);
  })
  .catch((error) => console.log(error));

const buildRootList = async (pathToDir) => {
  const list = [];
  const pathToDir1 = pathToDir;
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

  const icon = (el) => {
    if (el.isDirectory()) {
      return 'folder';
    } else return 'file';
  };

  // questions.push({
  //   type: 'checkbox',
  //   pageSize: list.length || 20,
  //   message:
  //     'Select files/folders to include? Press <enter> to continue with the default selection',
  //   name: 'includes',
  //   choices: list,
  //   showHelpTip: true,
  // });

  inquirer
    .prompt({
      type: 'checkbox',
      pageSize: list.length || 20,
      message:
        'Select files/folders to include? Press <enter> to continue with the default selection',
      name: 'includes',
      choices: list,
      showHelpTip: true,
    })
    .then((answers, pathToDir) =>
      buildEntireList(pathToDir1, answers.includes)
    );
};

const buildEntireList = async function getFiles(dir, includeList) {
  // const dirents = await readdir(dir, { withFileTypes: true });
  // const files = await Promise.all(
  //   dirents.map((dirent) => {
  //     if (includeList.includes(dirent.name.toString())) {
  //       console.log(dirent.name);
  //       const res = resolve(dir, dirent.name);
  //       return dirent.isDirectory() ? getFiles(res) : res;
  //     }
  //   })
  // );
  // console.log(dir);
  // return Array.prototype.concat(...files);
};
const included = [' dirname-demo.js', ' README.md', ' server', ' test'];
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
