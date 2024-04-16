module.exports = {
  srcDir: __dirname,
  name: 'burenscoring',
  port: 3017,
  scope: 'burenscoring',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'burenscoring',
    module: './routes'
  },
  menus:[
    {
      "text":"Burenscorings",
      "url":"/burenscorings","icon":"icon-star",
      "location":"mainNavigation"
    },
    {
      text: 'scoring config',
      to: '/erxes-plugin-burenscoring/settings/general',
      image: '/images/icons/erxes-04.svg',
      location: "settings",
      scope: "burenscoring"
    }
],
customerRightSidebarSection: [
  {
    text: 'customerRightSidebarSection',
    component: './contractSection',
    scope: 'loans'
  }
]
};
