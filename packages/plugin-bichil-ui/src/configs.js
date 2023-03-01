module.exports = {
  name: 'bichil',
  port: 3017,
  scope: 'bichil',
  exposes: {
    './routes': './src/routes.tsx',
    './bichilReportTableHeaders': './src/components/report/TableHeaders.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'bichil',
    module: './routes'
  },
  bichilReportTableHeaders: './bichilReportTableHeaders',
  menus: [
    {
      text: 'Bichils',
      to: '/bichils',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'bichil'
    }
  ]
};
