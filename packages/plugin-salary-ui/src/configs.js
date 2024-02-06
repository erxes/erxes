module.exports = {
  srcDir: __dirname,
  name: 'salary',
  port: 3031,
  scope: 'salary',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3031/remoteEntry.js',
    scope: 'salary',
    module: './routes'
  },
  menus:[{"text":"Salaries","to":"/salaries","image":"/images/icons/erxes-18.svg","location":"settings","scope":"salary"}]
};
