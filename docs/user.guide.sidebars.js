module.exports = {
  "plugin-tutorials": [
    'plugin-tutorials/plugin-tutorials',

    {
      type: 'category',
      label: 'XOS features',
      collapsed: true,
      items: [  
       'plugin-tutorials/xos-features/systemconfig',
       'plugin-tutorials/xos-features/permission',
       'plugin-tutorials/xos-features/teammembers',
       'plugin-tutorials/xos-features/brands',
       'plugin-tutorials/xos-features/importexport',
       'plugin-tutorials/xos-features/apps',
       'plugin-tutorials/xos-features/marketplace',
      ]
    },
    {
      type: 'category',
      label: 'Core plugins',
      collapsed: true,
      items: [   
       {
        "Inbox": [
          'plugin-tutorials/core-plugins/inbox/inbox',
          { "Dependent plugins": [
            'plugin-tutorials/core-plugins/inbox/channels',
            'plugin-tutorials/core-plugins/inbox/skills',
            'plugin-tutorials/core-plugins/inbox/response-template',
            'plugin-tutorials/core-plugins/inbox/scripts',
          ]}
        ],
       
       },
       'plugin-tutorials/core-plugins/sales',
       'plugin-tutorials/core-plugins/products',
       'plugin-tutorials/core-plugins/tasks',
       'plugin-tutorials/core-plugins/tickets',
       'plugin-tutorials/core-plugins/growth-hacks',
       'plugin-tutorials/core-plugins/contacts',
       'plugin-tutorials/core-plugins/segments',
       'plugin-tutorials/core-plugins/campaign',
       'plugin-tutorials/core-plugins/knowledge-base',
       'plugin-tutorials/core-plugins/reports',
       'plugin-tutorials/core-plugins/automations',
       'plugin-tutorials/core-plugins/leadscore',
       'plugin-tutorials/core-plugins/loyalty',
       'plugin-tutorials/core-plugins/clientportal',
       'plugin-tutorials/core-plugins/webbuilder',
       'plugin-tutorials/core-plugins/logs',
       'plugin-tutorials/core-plugins/tags',
       'plugin-tutorials/core-plugins/notifications',
       'plugin-tutorials/core-plugins/property',
       'plugin-tutorials/core-plugins/internalnotes',
       'plugin-tutorials/core-plugins/emailtemplate',
     ]
    },
    {
      type: 'category',
      label: 'More plugins',
      collapsed: true,
      items: [  
       'plugin-tutorials/more-plugins/payment',
       'plugin-tutorials/more-plugins/pos',
       'plugin-tutorials/more-plugins/ebarimt',
       'plugin-tutorials/more-plugins/calendar',
       'plugin-tutorials/more-plugins/neighbor',
       'plugin-tutorials/more-plugins/library',
       'plugin-tutorials/more-plugins/neighbor',
       'plugin-tutorials/more-plugins/car',
       'plugin-tutorials/more-plugins/delivery',
       'plugin-tutorials/more-plugins/contractloan',
       'plugin-tutorials/more-plugins/mobileapps',
       'plugin-tutorials/more-plugins/exmcore',
       'plugin-tutorials/more-plugins/exmfeed',
       'plugin-tutorials/more-plugins/chat',
       'plugin-tutorials/more-plugins/reaction',
       'plugin-tutorials/more-plugins/gallery',
      ]
    },
    {
      type: 'category',
      label: 'Adds ons',
      collapsed: true,
      items: [  
       'plugin-tutorials/adds-on/forms',
       'plugin-tutorials/adds-on/messenger',
       'plugin-tutorials/adds-on/fbmessenger',
       'plugin-tutorials/adds-on/fbpost',
       'plugin-tutorials/adds-on/callpro',
       'plugin-tutorials/adds-on/videocall',
      ]
    },
  ]
}