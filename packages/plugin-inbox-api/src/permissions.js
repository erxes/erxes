module.exports = {
  inbox: {
    name: 'inbox',
    description: 'Inbox',
    actions: [
      {
        name: 'inboxAll',
        description: 'All',
        use: [
          'showConversations',
          'changeConversationStatus',
          'assignConversation',
          'conversationMessageAdd',
          'conversationResolveAll'
        ]
      },
      {
        name: 'showConversations',
        description: 'Show conversations'
      },
      {
        name: 'changeConversationStatus',
        description: 'Change conversation status'
      },
      {
        name: 'assignConversation',
        description: 'Assign conversation'
      },
      {
        name: 'conversationMessageAdd',
        description: 'Add conversation message'
      },
      {
        name: 'conversationResolveAll',
        description: 'Resolve all converstaion'
      }
    ]
  },
  integrations: {
    name: 'integrations',
    description: 'Integrations',
    actions: [
      {
        name: 'integrationsAll',
        description: 'All',
        use: [
          'showIntegrations',
          'integrationsCreateMessengerIntegration',
          'integrationsEditMessengerIntegration',
          'integrationsSaveMessengerAppearanceData',
          'integrationsSaveMessengerConfigs',
          'integrationsCreateLeadIntegration',
          'integrationsEditLeadIntegration',
          'integrationsRemove',
          'integrationsArchive',
          'integrationsEdit',
          'integrationsCreateBookingIntegration',
          'integrationsEditBookingIntegration'
        ]
      },
      {
        name: 'showIntegrations',
        description: 'Show integrations'
      },
      {
        name: 'integrationsCreateMessengerIntegration',
        description: 'Create messenger integration'
      },
      {
        name: 'integrationsEditMessengerIntegration',
        description: 'Edit messenger integration'
      },
      {
        name: 'integrationsSaveMessengerAppearanceData',
        description: 'Save messenger appearance data'
      },
      {
        name: 'integrationsSaveMessengerConfigs',
        description: 'Save messenger config'
      },
      {
        name: 'integrationsCreateLeadIntegration',
        description: 'Create lead integration'
      },
      {
        name: 'integrationsEditLeadIntegration',
        description: 'Edit lead integration'
      },
      {
        name: 'integrationsRemove',
        description: 'Remove integration'
      },
      {
        name: 'integrationsArchive',
        description: 'Archive an integration'
      },
      {
        name: 'integrationsEdit',
        description: 'Edit common integration fields'
      },
      {
        name: 'integrationsCreateBookingIntegration',
        description: 'Create booking integration'
      },
      {
        name: 'integrationsEditBookingIntegration',
        description: 'Edit booking integration'
      }
    ]
  },
  skillTypes: {
    name: 'skillTypes',
    description: 'Skill Types',
    actions: [
      {
        name: 'skillTypesAll',
        description: 'All',
        use: [
          'getSkillTypes',
          'createSkillType',
          'updateSkillType',
          'removeSkillType',
          'manageSkillTypes'
        ]
      },
      {
        name: 'getSkillTypes',
        description: 'Get skill types'
      },
      {
        name: 'createSkillType',
        description: 'Create skill type'
      },
      {
        name: 'updateSkillType',
        description: 'Update skill type'
      },
      {
        name: 'removeSkillType',
        description: 'Remove skill type'
      }
    ]
  },
  skills: {
    name: 'skills',
    description: 'Skills',
    actions: [
      {
        name: 'skillsAll',
        description: 'All',
        use: [
          'getSkill',
          'getSkills',
          'createSkill',
          'updateSkill',
          'removeSkill'
        ]
      },
      {
        name: 'getSkill',
        description: 'Get skill'
      },
      {
        name: 'getSkills',
        description: 'Get skills'
      },
      {
        name: 'createSkill',
        description: 'Create skill'
      },
      {
        name: 'updateSkill',
        description: 'Update skill'
      },
      {
        name: 'removeSkill',
        description: 'Remove skill'
      }
    ]
  },
  responseTemplates: {
    name: 'responseTemplates',
    description: 'Response templates',
    actions: [
      {
        name: 'responseTemplatesAll',
        description: 'All',
        use: ['manageResponseTemplate', 'showResponseTemplates']
      },
      {
        name: 'manageResponseTemplate',
        description: 'Manage response template'
      },
      {
        name: 'showResponseTemplates',
        description: 'Show response templates'
      }
    ]
  },
  channels: {
    name: 'channels',
    description: 'Channels',
    actions: [
      {
        name: 'channelsAll',
        description: 'All',
        use: ['showChannels', 'manageChannels', 'exportChannels']
      },
      {
        name: 'manageChannels',
        description: 'Manage channels'
      },
      {
        name: 'showChannels',
        description: 'Show channel'
      },
      {
        name: 'exportChannels',
        description: 'Export channels'
      }
    ]
  },
  scripts: {
    name: 'scripts',
    description: 'Scripts',
    actions: [
      {
        name: 'scriptsAll',
        description: 'All',
        use: ['showScripts', 'manageScripts']
      },
      {
        name: 'manageScripts',
        description: 'Manage scripts'
      },
      {
        name: 'showScripts',
        description: 'Show scripts'
      }
    ]
  },
}