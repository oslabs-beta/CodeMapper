const testStr = '/Users/tariq/Documents/CodeSmith/PTRI-Beta/Production-Project/Data-Visualization/Foam-Tree/my-foam-tree-demo/.vscode/settings.json';

const arr = testStr.split('/');
const rootIdx = arr.indexOf('my-foam-tree-demo');
console.log(arr.slice(rootIdx + 1).join('/'));
