const fileTree = {
  groups: [
    {
      id: '1',
      label: '',
      groups: [
        {
          id: '1.1',
          label: '/bundle.js',
        },
        {
          id: '1.2',
          label: '/file-traverser.js',
        },
      ],
    },
    {
      id: '2',
      label: 'src',
      groups: [
        {
          id: '2.1',
          label: 'app.js',
        },
        {
          id: '2.2',
          label: 'd3.js',
        },
        {
          id: '2.3',
          label: 'd3.min.js',
        },
        {
          id: '2.4',
          label: 'index.js',
        },
        {
          id: '2.5',
          label: 'subTest',
        },
      ],
    },
    {
      id: '3',
      label: 'treeMapData',
      groups: [
        {
          id: '3.1',
          label: 'flare-2.json',
        },
        {
          id: '3.2',
          label: 'treeMap.json',
        },
      ],
    },
  ],
};

export default fileTree;
