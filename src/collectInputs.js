#!/usr/bin/env node
'use strict';
const path = require('path');
const { readdir, stat } = require('fs').promises;
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
  'README.md',
];

const questions = [
  {
    name: 'projectDirectory',
    type: 'input',
    message: 'Now it is the time to select the ptoject folder to analyze?',
    // default: cwd,
    default: 'C:\\Users\\Lenovo\\Documents\\PTRI program\\unit-8SB-node-pages',
    // validate: validatePath,
  },
  // {
  //   name: 'projectDirectory',
  //   type: 'input',
  //   message: 'Try again with a valid path',
  //   // default: cwd,
  //   // default: 'C:\\Users\\Lenovo\\Documents\\PTRI program\\unit-8SB-node-pages',
  // },
];

const askQuestions = (question) => {
  return inquirer.prompt(question);
};
const validatePath = (input)=>{
  if (input !== 'y' || input !== 'n') {
    return 'Incorrect asnwer';
 }
 return true;
}

const init = () => {
  console.log(chalk.magenta('\n\n\n W E L C O M E    to'));
  console.log(
    chalk.cyan(
      figlet.textSync('CodeMapper!', {
        // font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
  console.log(
    chalk.magenta(
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
      name: `${el.name}`,
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

const buildEntireList = async (dir, excluded, depth = 0) => {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs
      .filter((name) => {
        // console.log(excluded.indexOf(name) === -1);
        return excluded.indexOf(name) === -1;
      })
      .map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        const statistics = await stat(res);
        const item = {
          name: path.basename(res, path.extname(res)),
          path: path.dirname(res),
          fullname: res,
          extension: path.extname(res),
          depth: depth,
          isDirectory: statistics.isDirectory(),
          size: statistics.size,
        };

        // console.log(name);
        if (statistics.isDirectory()) {
          depth++;
          (item.name = path.basename(res, path.extname(res))),
            (item.content = []);
          const subArr = await buildEntireList(res, excluded, depth);
          item.content.push(...subArr);
        } else {
          item.name = path.basename(res);
        }
        return item;
      })
  );
  return files;
};

const collectData = async () => {
  // show script introduction
  init();

  // ask question 1
  console.log(
    chalk.magenta(
      'Press <enter> to continue with the current working directory'
    )
  );
  //prompt q1-> selection of project directory
  const answers = await askQuestions(questions[0]);

  //get the project directory from user input
  const { projectDirectory } = answers;

  //get all files from the root level
  const rootListFiles = await buildRootList(projectDirectory);

  //prompt q2-> precize files that shell be inculed/excluded
  const includes = await askQuestions(questions[questions.length - 1]);

  //modify the answers object with excluded and included files of folders
  answers.included = includes.includes;

  answers.excluded = rootListFiles
    .map((el) => el.name)
    .filter((el) => answers.included.indexOf(el) == -1);
  console.log(
    chalk.magenta(`Ok! We continue the analysis with the following settings`)
  );

  const entireList = await buildEntireList(projectDirectory, answers.excluded);

  console.log(` ${JSON.stringify(entireList, null, 2)}`);
};

collectData();
