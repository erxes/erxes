module.exports = {
  name: 'riskassessment',
  port: 3012,
  scope: 'riskassessment',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'riskassessment',
    module: './routes'
  },
  menus: [
    {
      text: 'Riskassessments',
      to: '/riskassessments',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'riskassessment'
    }
  ]
};