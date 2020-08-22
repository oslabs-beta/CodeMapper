document.addEventListener('DOMContentLoaded', () => {
  // this should create our dependencies section of the results for the end user
  const dependencyChart = Highcharts.chart('container', {

    title: {
      text: 'Highcharts Dependency Wheel',
    },

    accessibility: {
      point: {
        valueDescriptionFormat: 'From {point.from} to {point.to}: {point.weight}.'
      },
    },

    series: [{
      keys: ['from', 'to', 'imports'],
      data: [
        ['readline', 'getUserInput.js', 1],
        ['path', 'getUserInput.js', 1],
        ['generateFileTree.js', 'getUserInput.js', 1],
        ['flow.js', 'getUserInput.js', 1],
        ['@babel/parser', 'parser.js', 1],
        ['@babel/core', 'parser.js', 1],
        ['@babel/traverse', 'parser.js', 1],
        ['@babel/generator', 'parser.js', 1],
        ['fs', 'parser.js', 1],
        ['transform.js', 'parser.js', 1],
        ['@babel/generator', 'transform.js', 1],
        ['parser.js', 'filterAndParse.js', 1],
        ['fs', 'filewalker.js', 1],
        ['path', 'filewalker.js', 1],
      ],
      type: 'dependencywheel',
      name: 'Dependency wheel series',
      dataLabels: {
        color: '#333',
        textPath: {
          enabled: true,
          attributes: {
            dy: 5,
          },
        },
        distance: 10,
      },
      size: '95%',
    }],

  });
});
