/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import treeMap from './data/treeMap.js';

window.addEventListener('load', () => {
  // Perform FoamTree embedding here
  if (CarrotSearchFoamTree.supported) {
    const foamtree = new CarrotSearchFoamTree({
      id: 'data-vis',
      dataObject: treeMap,
      groupBorderRadius: 0,
    });
  } else {
    console.log('Unsupported brower for FoamTree visualizations');
  }

  foamtree.set({
    rainbowStartColor: '#f00',
    rainbowEndColor: '#aa0',
    groupBorderRadius: 0,
  });
  foamtree.redraw();
});
