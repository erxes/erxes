module.exports = {
  name: 'tags',
  port: 3012,
  scope: 'tags',
  exposes: {
    './routes': './src/routes.tsx',
    './activityLog': './src/activityLogs/activityLog.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'tags',
    module: './routes'
  },
  activityLog: './activityLog',
  menus: [
    {
<<<<<<< HEAD
      text: 'Tags',
      to: '/tags/inbox:conversation',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'tags',
      action: 'tagsAll',
      permissions: ['showTags', 'manageTags']
    }
  ]
=======
      text: "Tags",
      to: "/tags",
      image: "/images/icons/erxes-18.svg",
      location: "settings",
      scope: "tags",
      action: "tagsAll",
      permissions: ["showTags", "manageTags"],
    },
  ],
>>>>>>> c64b801b877151d283d64bfe23ec9317fe53734f
};
