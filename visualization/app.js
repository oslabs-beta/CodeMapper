/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import foamTreeDataObj from '../data/foamTreeDataObj.js';

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
      onGroupClick(event) {
        console.log({ event });
        if (event.group.unselectable) {
          event.preventDefault();
        }
      },
    });
    foamtree.redraw();
  } else {
    console.log('Unsupported browser for FoamTree visualizations');
  }
});
