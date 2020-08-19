/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import foamTreeDataObj from '../data/foamTreeDataObj.js';

window.addEventListener('load', () => {
  // Perform FoamTree embedding here
  if (CarrotSearchFoamTree.supported) {
    const foamtree = new CarrotSearchFoamTree({
      id: 'data-vis',
      dataObject: foamTreeDataObj,
      layout: 'ordered',
      layoutByWeightOrder: true,
      stacking: 'flattened',
      descriptionGroupSize: 0.12,
      descriptionGroupDistanceFromCenter: 0,
      groupLabelFontFamily: 'Oxygen',
      groupLabelMinFontSize: 16,
      groupLabelMaxFontSize: 24,
      groupLabelVerticalPadding: 0.1,
      groupLabelHorizontalPadding: 0.8,
      groupLabelLineHeight: 1.3,
      groupBorderRadius: 0,
      groupBorderWidth: 1,
      groupInsetWidth: 0,
      groupStrokeWidth: 1,
      maxGroupLevelsDrawn: 4,
      maxGroupLabelLevelsDrawn: 4,
    });

    window.addEventListener('resize', (function () {
      let timeout;
      return function () {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(foamtree.resize, 300);
      };
    }()));

    // set some additional properties for the foamTree object
    foamtree.set({
      groupFillType: 'plain',
      groupLabelColorThreshold: -1,
      groupLabelDarkColor: '#192a56',
      rainbowStartColor: '#f5f6fa',
      rainbowEndColor: '#f5f6fa',
      rainbowLightnessCorrection: 0,
      rainbowColorDistribution: 'linear',
      groupBorderRadius: 0,
    });
    foamtree.redraw();
  } else {
    console.log('Unsupported brower for FoamTree visualizations');
  }
});
