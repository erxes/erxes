module.exports = {
  name: 'dac',
  port: 3017,
  scope: 'dac',
  exposes: {
    './routes': './src/routes.tsx',
    './extendSystemConfig': './src/components/Config.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'dac',
    module: './routes'
  },
  extendSystemConfig: './extendSystemConfig',
  menus: [
    {
      text: 'Doctor Auto Chain',
      to: '/dac',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'dac'
    }
  ]
};
