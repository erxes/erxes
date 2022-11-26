module.exports = {
  name: 'das',
  port: 3017,
  scope: 'das',
  exposes: {
    './routes': './src/routes.tsx',
    './extendSystemConfig': './src/components/Config.tsx',
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'das',
    module: './routes',
  },
  extendSystemConfig: './extendSystemConfig',
  menus: [
    {
      text: 'Doctor Auto Service',
      to: '/das',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'das',
    },
  ],
};
