module.exports = {
  'user-guide': [
    {
      type: 'category',
      label: 'Get Started with User Guide!',
      link: {
        type: 'doc',
        id: 'user-guide/user-guide'
      },
      items: [
        'user-guide/welcome/admin-panel',
        'user-guide/welcome/marketplace'
      ]
    },
    {
      type: 'category',
      label: 'XOS',
      link: {
        type: 'doc',
        id: 'user-guide/xos/xos-intro'
      },
      collapsed: true,
      items: [
        'user-guide/xos/system-configuration',
        'user-guide/xos/permission',
        'user-guide/xos/team-members',
        'user-guide/xos/brands',
        'user-guide/xos/import-export',
        'user-guide/xos/apps',
        'user-guide/xos/channel',
        'user-guide/xos/script-installation'
      ]
    },
    {
      type: 'category',
      label: 'Plugins',
      link: {
        type: 'doc',
        id: 'user-guide/plugins-intro'
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Plugins',
          link: {
            type: 'doc',
            id: 'user-guide/plugins/intro-plugins'
          },
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Team Inbox',
              link: {
                type: 'doc',
                id: 'user-guide/plugins/team-inbox/inbox-intro'
              },
              collapsed: true,
              items: [
                'user-guide/plugins/team-inbox/inbox-channels',
                'user-guide/plugins/team-inbox/inbox-skills',
                'user-guide/plugins/team-inbox/inbox-response-template'
              ]
            }
          ]
        },
        'user-guide/adds-on/intro-addon',
        'user-guide/services/intro-service',
        'user-guide/power-ups/intro-powerup'
      ]
    },
    {
      type: 'category',
      label: 'Use-Cases',
      link: {
        type: 'doc',
        id: 'user-guide/use-case'
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Products',
          link: {
            type: 'doc',
            id: 'user-guide/products/products-intro'
          },
          collapsed: true,
          items: [
            'user-guide/products/pos',
            'user-guide/products/health',
            'user-guide/products/messenger',
            'user-guide/products/knowledgebase',
            'user-guide/products/sentimental',
            'user-guide/products/webbuilder',
            'user-guide/products/script-install',
            'user-guide/products/exm'
          ]
        },
        {
          type: 'category',
          label: 'Industries',
          link: {
            type: 'doc',
            id: 'user-guide/industries/industries-intro'
          },
          collapsed: true,
          items: [
            'user-guide/industries/estate',
            'user-guide/industries/property',
            'user-guide/industries/hospitality',
            'user-guide/industries/yoga',
            'user-guide/industries/dentist',
            'user-guide/industries/carrepair',
            'user-guide/industries/vacation',
            'user-guide/industries/saas',
            'user-guide/industries/banking',
            'user-guide/industries/retail'
          ]
        },
        {
          type: 'category',
          label: 'Teams',
          link: {
            type: 'doc',
            id: 'user-guide/teams/teams-intro'
          },
          collapsed: true,
          items: [
            'user-guide/teams/marketing',
            'user-guide/teams/sales',
            'user-guide/teams/support',
            'user-guide/teams/banking',
            'user-guide/teams/pm',
            'user-guide/teams/rm',
            'user-guide/teams/hr'
          ]
        }
      ]
    }
  ]
};
