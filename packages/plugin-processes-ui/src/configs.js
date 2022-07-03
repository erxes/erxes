module.exports = {
  name: 'processes',
  port: 3025,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3025/remoteEntry.js',
    scope: 'processes',
    module: './routes'
  },
  menus: [
    {
      text: 'Processes',
      to: '/processes/jobs',
      image: '/images/icons/erxes-31.png',
      location: 'settings',
      scope: 'processes',
      action: 'processesAll',
      permissions: []
    },
    {
      text: 'Processes',
      url: '/processes/performs',
      icon: 'icon-file-check-alt',
      location: 'mainNavigation',
      scope: 'processes',
      permissions: []
    }
  ]
};
