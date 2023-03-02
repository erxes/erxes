module.exports = {
  name: 'bichil',
  port: 3017,
  scope: 'bichil',
  exposes: {
    './routes': './src/routes.tsx',
    './bichilReportTable': './src/containers/report/ReportList.tsx',
    './bichilExportReportBtn': './src/components/report/ExportBtn.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'bichil',
    module: './routes'
  },
  bichilReportTable: './bichilReportTable',
  bichilExportReportBtn: './bichilExportReportBtn',
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
