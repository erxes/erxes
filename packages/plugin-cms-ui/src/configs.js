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
      text: 'Post',
      url: '/cms/posts',
      icon: 'icon-star',
      location: 'mainNavigation',
      scope: 'cms',
    },
    {
      text: 'Posts',
      to: '/cms/posts',
      image: '/images/icons/erxes-25.png',
      location: 'settings',
      scope: 'cms',
      action: '',
      permissions: [

      ],
    },
  ],
};
