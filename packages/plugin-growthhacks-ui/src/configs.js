module.exports = {
  srcDir: __dirname,
  name: 'growthhacks',
  port: 3055,
  scope: 'growthhacks',
  url: 'http://localhost:3055/remoteEntry.js',
  exposes: {
    './routes': './src/routes.tsx',
    './settings': './src/Settings.tsx',
    './activityLog': './src/activityLogs/activityLog.tsx',
    './selectRelation': './src/common/SelectRelation.tsx',
  },
  routes: {
    url: 'http://localhost:3055/remoteEntry.js',
    scope: 'growthhacks',
    module: './routes',
  },
  activityLog: './activityLog',
  selectRelation: './selectRelation',
  menus: [
    {
      text: 'Growth Hacking',
      url: '/growthHack',
      icon: 'icon-idea',
      location: 'mainNavigation',
      permission: 'showGrowthHacks',
    },
    {
      text: 'Growth Hacking Templates',
      to: '/settings/boards/growthHackTemplate',
      image: '/images/icons/erxes-12.svg',
      location: 'settings',
      scope: 'growthhacks',
      action: 'growthHacksAll',
      permissions: [
        'growthHackTemplatesAdd',
        'growthHackTemplatesEdit',
        'growthHackTemplatesRemove',
        'growthHackTemplatesDuplicate',
        'showGrowthHackTemplates',
      ],
    },
  ],
};
