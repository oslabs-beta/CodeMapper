/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import foamTreeDataObj from '../CodeMapper/Data.js';

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

    window.addEventListener(
      'resize',
      (() => {
        let timeout;
        return () => {
          window.clearTimeout(timeout);
          timeout = window.setTimeout(foamtree.resize, 300);
        };
      })()
    );

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
        event.preventDefault();
        const data = event.group;

        console.log(data);
        const html = ejs.render(
          ` <h3>
          <%= data.label %>
          </h3>
          <% if (data.imported) { %>
            <h4>Imports</h4>
            <ul>
              <% data.imported.forEach((obj)=>{ %>
                <li class="pink">
                  <%= obj.fileName %>
                </li>
                <% }) %>
            </ul>
          <% } %>
    
          <% if (data.functionDeclarations) { %>
            <h4>Function Declarations</h4>
            <ul>
              <% data.functionDeclarations.forEach((obj)=>{ %>
                <li class="blue">
                  <%= obj.name %>
                 <span>
                  (
                  <%= obj.parameters %>
                  )
                  </span>
                </li>
                <% }) %>
            </ul>
          <% } %>
          <% if (data.functionCalls) { %>
            <h4>Function Calls</h4>
            <ul>
              <% data.functionCalls.forEach((obj)=>{ %>
                <li class="green">
                  <%= obj.name %>
                  <span>
                    (
                      <% obj.arguments.forEach((el)=>{ %>
                        <%  console.log(el) %>
                        <% if( el === null ) { 'null'  %>
                          <% } else if (typeof el === 'object') { %>
                            
                            <%= el.callbackName %> 
                            
                          
                            <% } else {%>
                              <%= el %>
                              <% } %>
                          <% }) %>
                        
                    )
                    </span>
                </li>
                <% }); %>
            </ul>
          <% } %>
          
          
          
          
          
          
          `,

          { data }
        );
        document.getElementById('details').innerHTML = html;
        document.getElementById('details').classList.add('opened');

        const closeBtn = document.getElementById('container');
        console.log(closeBtn);
      },
    });
    foamtree.redraw();
  } else {
    console.log('Unsupported browser for FoamTree visualizations');
  }
});
