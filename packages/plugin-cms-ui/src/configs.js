module.exports = {
  srcDir: __dirname,
  name: 'cms',
  port: 3126,
  scope: 'cms',
  exposes: {
    './routes': './src/routes.tsx',
  },
  routes: {
    url: 'http://localhost:3126/remoteEntry.js',
    scope: 'cms',
    module: './routes',
  },
  menus: [
    {
      text: 'CMS',
      url: '/cms/posts',
      icon: 'icon-star',
      location: 'mainNavigation',
      scope: 'cms',
    },
    {
      text: 'Web builder',
      url: '/cms/web-builder/pages',
      icon: 'icon-star',
      location: 'mainNavigation',
      scope: 'cms',
    },

  ],
};
