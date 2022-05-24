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
      to: '/processes/flows',
      image: '/images/icons/erxes-31.png',
      location: 'settings',
      scope: 'processes',
      action: 'processesAll',
      permissions: []
    }
  ]
};
