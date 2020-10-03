const data = require('../data/fileTree.json');

// console.log(data);

const points = [];

// const data_format = {
//   Id: 'unique_number',
//   name: 'display_name',
//   parent: 'parent_id',
//   value: 'function_declaration, imported, exported',
// };

const traverse = (data, parentId) => {
  //   `${data[item].depth.doString()}_${item}`;
  for (const item in data) {
    let id = `id_${item.toString()}`;

    const newPoint = {
      id: id,
      name: data[item].name,
      //   color: Highcharts.getOptions().colors(item),
    };
    if (parentId) {
      newPoint.parent = `${parentId}`;
    }
    points.push(newPoint);
    if (data[item].isDirectory) {
      traverse(data[item].content, newPoint.id);
    }
  }
  return points;
};

module.exports = { points };
