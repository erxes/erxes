module.exports = {
  name: 'inbox',
  port: 3009,
  scope: 'inbox',
  exposes: {
    './routes': './src/routes.tsx',
    './activityLog': './src/activityLogs/activityLog.tsx',
    './automation': './src/automations/automation.tsx',
    './unreadCount': './src/inbox/containers/UnreadCount.tsx',
    './actionForms': './src/settings/integrations/containers/ActionForms',
    './emailWidget': './src/inbox/containers/EmailWidget.tsx',
  },
  routes: {
    url: 'http://localhost:3009/remoteEntry.js',
    scope: 'inbox',
    module: './routes'
  },
  activityLog: './activityLog',
  automation: './automation',
  actionForms: './actionForms',
  menus: [
    {
      text: 'Team Inbox',
      url: '/inbox',
      icon: 'icon-chat',
      location: 'mainNavigation',
      permission: 'showConversations'
    },
    {
      text: 'Bookings',
      url: '/bookings',
      icon: 'icon-paste',
      location: 'mainNavigation',
      permission: 'showIntegrations'
    },
    {
      text: 'Forms',
      url: '/forms',
      icon: 'icon-laptop',
      location: 'mainNavigation',
      permission: 'showForms'
    },
    {
      text: 'Skills',
      to: '/settings/skills',
      image: '/images/icons/erxes-29.png',
      location: 'settings',
      scope: 'inbox',
      action: 'skillTypesAll',
      permissions: [
        'getSkillTypes',
        'getSkill',
        'getSkills',
        'manageSkills',
        'manageSkillTypes'
      ]
    },
    {
      text: 'Channels',
      to: '/settings/channels',
      image: '/images/icons/erxes-05.svg',
      location: 'settings',
      scope: 'inbox',
      action: 'channelsAll',
      permissions: ['showChannels', 'manageChannels']
    },
    {
      text: 'Integrations',
      to: '/settings/integrations',
      image: '/images/icons/erxes-04.svg',
      location: 'settings',
      scope: 'inbox',
      action: 'integrationsAll',
      permissions: [
        'showIntegrations',
        'integrationsCreateMessengerIntegration',
        'integrationsEditMessengerIntegration',
        'integrationsSaveMessengerAppearanceData',
        'integrationsSaveMessengerConfigs',
        'integrationsCreateLeadIntegration',
        'integrationsEditLeadIntegration',
        'integrationsRemove',
        'integrationsArchive',
        'integrationsEdit'
      ]
    },
    {
      text: 'Integrations config',
      to: '/settings/integrations-config',
      image: '/images/icons/erxes-24.svg',
      location: 'settings',
      scope: 'inbox',
      action: 'generalSettingsAll',
      permissions: ['manageGeneralSettings', 'showGeneralSettings']
    },
    {
      text: 'Responses',
      to: '/settings/response-templates',
      image: '/images/icons/erxes-10.svg',
      location: 'settings',
      scope: 'inbox',
      action: 'responseTemplatesAll',
      permissions: ['manageResponseTemplate', 'showResponseTemplates']
    },
    {
      text: 'Widget Script Manager',
      to: '/settings/scripts',
      image: '/images/icons/erxes-34.png',
      location: 'settings',
      scope: 'inbox',
      action: 'scriptsAll',
      permissions: ['manageScripts', 'showScripts']
    },
    {
      text: "Send an Email",
      url: "/emailWidget",
      icon: "icon-envelope",
      location: "topNavigation",
      scope: "inbox",
      component: "./emailWidget",
    }
  ],
  customNavigationLabel: [
    {
      text: "unreadCount",
      component: "./unreadCount",
      scope: "inbox",
    }
  ],
};
