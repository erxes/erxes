module.exports = {
  "plugin-tutorials": [
    'plugin-tutorials/plugin-tutorials',

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
  ]
}