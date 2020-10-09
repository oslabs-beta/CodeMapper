import data from '../data/dependencies.js';

Highcharts.chart('dependency-wheel-container', {
  title: {
    text: 'Project Dependency Wheel',
  },

  accessibility: {
    point: {
      valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.',
    },
  },

  chart: {
    displayErrors: true,
  },

  series: [{
    keys: ['from', 'to', 'weight'],
    data,
    type: 'dependencywheel',
    name: 'Dependency wheel',
    dataLabels: {
      color: '#333',
      style: {
        fontSize: '12px',
        textOverflow: 'ellipsis',
      },
      textPath: {
        enabled: true,
        attributes: {
          dy: 4,
          textAnchor: 'start',
          startOffset: '3%',
        },
      },
      distance: 10,
    },
    size: '95%',
  }],
});

Highcharts.getOptions().colors.push('#d1f510', '#856677', '#ae9ef0', '#0f687a', '#ceaf73', '#18425d', '#8f2392', '#d17715', '#a10475', '307fc9', '#53A4EF', '#21212D', '#90ED7D', '#D37D37', '#4F57EA', '#DD5676', '#F2D82E', '#117271', '#CE3D3D', '#65C6BE');
