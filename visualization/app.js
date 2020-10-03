/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import treeMapData from '../data/treeMapData.js';
// console.log(treeMapData);

const templateExample = `
<img class="avatar" src="<%- owner.avatar_url %>"/>
<div class="info">
  <h2><a target="_blank" href="<%- owner.html_url %>"><%- owner.login %></a>/&#8203;<a target="_blank" href="<%- html_url %>"><%- name %></a></h2>
  <div class="stats">
    <img src="assets/svg/star.svg"/> <span><%- stargazers_count %></span>
    <img class="watchers" src="assets/svg/eye.svg"/> <span><%- watchers_count %></span>
    <img class="forks" src="assets/svg/fork.svg"/> <span><%- forks_count %></span>
  </div>

  <div class="description"><%- description %></div>
  <a target="_blank" href="<%- homepage %>"><%- homepage %></a>

  <hr/>

  <div style="color: #888">
    created: <span><%- moment(created_at).fromNow() %></span><br/>
    last push: <span><%- moment(pushed_at).fromNow() %></span><br/>
    last update: <span><%- moment(updated_at).fromNow() %></span>
  </div>
</div>
<div class="close">&times;</div>
`;
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

// Apply the theme
// Highcharts.setOptions(Highcharts.theme);
// window.addEventListener('load', () => {
//   // Perform FoamTree embedding here
//   if (CarrotSearchFoamTree.supported) {
//     const foamtree = new CarrotSearchFoamTree({
//       id: 'data-vis',
//       dataObject: foamTreeDataObj,
//       layout: 'ordered',
//       layoutByWeightOrder: true,
//       stacking: 'flattened',
//       descriptionGroupSize: 0.12,
//       descriptionGroupDistanceFromCenter: 0,
//       groupLabelFontFamily: 'Oxygen',
//       groupLabelMinFontSize: 16,
//       groupLabelMaxFontSize: 24,
//       groupLabelVerticalPadding: 0.1,
//       groupLabelHorizontalPadding: 0.8,
//       groupLabelLineHeight: 1.3,
//       groupBorderRadius: 0,
//       groupBorderWidth: 1,
//       groupInsetWidth: 0,
//       groupStrokeWidth: 1,
//       maxGroupLevelsDrawn: 4,
//       maxGroupLabelLevelsDrawn: 4,
//     });

//     window.addEventListener('resize', (function () {
//       let timeout;
//       return function () {
//         window.clearTimeout(timeout);
//         timeout = window.setTimeout(foamtree.resize, 300);
//       };
//     }()));

//     // set some additional properties for the foamTree object
//     foamtree.set({
//       groupFillType: 'plain',
//       groupLabelColorThreshold: -1,
//       groupLabelDarkColor: '#192a56',
//       rainbowStartColor: '#f5f6fa',
//       rainbowEndColor: '#f5f6fa',
//       rainbowLightnessCorrection: 0,
//       rainbowColorDistribution: 'linear',
//       groupBorderRadius: 0,
//       onGroupClick(event) {
//         console.log({ event });
//         if (event.group.unselectable) {
//           event.preventDefault();
//         }
//       },
//     });
//     foamtree.redraw();
//   } else {
//     console.log('Unsupported browser for FoamTree visualizations');
//   }
// // });
// Highcharts.getJSON(
//   'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/world-mortality.json',
//   function (data) {
//     var points = [],
//       regionP,
//       regionVal,
//       regionI = 0,
//       countryP,
//       countryI,
//       causeP,
//       causeI,
//       region,
//       country,
//       cause,
//       causeName = {
//         'Communicable & other Group I': 'Communicable diseases',
//         'Noncommunicable diseases': 'Non-communicable diseases',
//         Injuries: 'Injuries',
//       };

//     for (region in data) {
//       if (data.hasOwnProperty(region)) {
//         regionVal = 0;
//         regionP = {
//           id: 'id_' + regionI,
//           name: region,
//           color: Highcharts.getOptions().colors[regionI],
//         };
//         countryI = 0;
//         for (country in data[region]) {
//           if (data[region].hasOwnProperty(country)) {
//             countryP = {
//               id: regionP.id + '_' + countryI,
//               name: country,
//               parent: regionP.id,
//             };
//             points.push(countryP);
//             causeI = 0;
//             for (cause in data[region][country]) {
//               if (data[region][country].hasOwnProperty(cause)) {
//                 causeP = {
//                   id: countryP.id + '_' + causeI,
//                   name: causeName[cause],
//                   parent: countryP.id,
//                   value: Math.round(+data[region][country][cause]),
//                 };
//                 regionVal += causeP.value;
//                 points.push(causeP);
//                 causeI = causeI + 1;
//               }
//             }
//             countryI = countryI + 1;
//           }
//         }
//         regionP.value = Math.round(regionVal / countryI);
//         points.push(regionP);
//         regionI = regionI + 1;
//       }
//     }

//     console.log(points);
//     Highcharts.chart('container', {
//       series: [
//         {
//           type: 'treemap',
//           layoutAlgorithm: 'squarified',
//           allowDrillToNode: true,
//           animationLimit: 1000,
//           dataLabels: {
//             enabled: false,
//           },
//           levelIsConstant: false,
//           levels: [
//             {
//               level: 1,
//               dataLabels: {
//                 enabled: true,
//               },
//               borderWidth: 3,
//             },
//           ],
//           data: points,
//         },
//       ],
//       subtitle: {
//         text:
//           'Click points to drill down. Source: <a href="http://apps.who.int/gho/data/node.main.12?lang=en">WHO</a>.',
//       },
//       title: {
//         text: 'Global Mortality Rate 2012, per 100 000 population',
//       },
//     });
//   }
// );
