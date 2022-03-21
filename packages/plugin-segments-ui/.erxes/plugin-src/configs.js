module.exports = {
  name: 'segments',
  port: 3013,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3013/remoteEntry.js',
    scope: 'segments',
    module: './routes'
  },
  menus: [
    {
      text: 'Segments',
      url: '/segments',
      icon: 'icon-chart-pie-alt',
      location: 'mainNavigation',
      permission: 'showSegments'
    }
  ]
};
