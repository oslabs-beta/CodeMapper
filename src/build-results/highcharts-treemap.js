/* eslint-disable import/extensions */
/* eslint-disable no-undef */

import treeMapData from '../../data/treeMapData.js';

console.log(treeMapData);
console.log(Highcharts);
Highcharts.chart('container', {
  colorAxis: {
    minColor: Highcharts.getOptions().colors[3],
    maxColor: Highcharts.getOptions().colors[0],
  },
  series: [
    {
      name: 'testName',
      type: 'treemap',
      layoutAlgorithm: 'squarified',

      allowDrillToNode: true,
      animationLimit: 1000,
      dataLabels: {
        enabled: false,
      },
      levelIsConstant: false,
      levels: [
        {
          level: 1,
          dataLabels: {
            enabled: true,
          },
          borderWidth: 1,
        },
      ],
      data: treeMapData,
      size: '120%',
    },
  ],
  // colors: [
  //   '#4572A7',
  //   '#AA4643',
  //   '#89A54E',
  //   '#80699B',
  //   '#3D96AE',
  //   '#DB843D',
  //   '#92A8CD',
  //   '#A47D7C',
  //   '#B5CA92',
  // ],
  subtitle: {
    text: 'Click points to drill down.',
  },
  title: {
    text: 'Project content',
  },
});
