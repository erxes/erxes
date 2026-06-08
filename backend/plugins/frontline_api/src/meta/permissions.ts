import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'frontline',

  modules: [
    {
      name: 'inbox',
      description: 'Inbox & conversations',
      scopeField: null,
      ownerFields: ['assignedUserId'],
      scopes: [
        { name: 'own', description: 'Conversations assigned to user' },
        { name: 'group', description: 'Conversations in user departments' },
        { name: 'all', description: 'All conversations' },
      ],
      actions: [
        {
          title: 'View conversations',
          name: 'showConversations',
          description: 'View inbox conversations',
          always: true,
        },
        {
          title: 'Send message',
          name: 'conversationMessageAdd',
          description: 'Send messages in conversations',
        },
        {
          title: 'Edit message',
          name: 'conversationMessageEdit',
          description: 'Edit sent messages',
        },
        {
          title: 'Assign conversations',
          name: 'conversationsAssign',
          description: 'Assign conversations to agents',
        },
        {
          title: 'Unassign conversations',
          name: 'conversationsUnassign',
          description: 'Remove agent assignment',
        },
        {
          title: 'Change conversation status',
          name: 'conversationsChangeStatus',
          description: 'Open or close conversations',
        },
        {
          title: 'Resolve conversations',
          name: 'conversationsResolve',
          description: 'Mark conversations as resolved',
        },
        {
          title: 'Convert to ticket',
          name: 'conversationConvertToCard',
          description: 'Convert a conversation into a ticket',
        },
        {
          title: 'Edit custom fields',
          name: 'conversationEditCustomFields',
          description: 'Edit custom field values on conversations',
        },
      ],
    },
    {
      name: 'channel',
      description: 'Channel management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All channels' }],
      actions: [
        {
          title: 'View channels',
          name: 'showChannels',
          description: 'View own channels (membership-filtered)',
          always: true,
        },
        {
          title: 'View all channels',
          name: 'showAllChannels',
          description: 'View every channel regardless of membership',
        },
        {
          title: 'Add channel',
          name: 'channelAdd',
          description: 'Create a new channel',
        },
        {
          title: 'Edit channel',
          name: 'channelUpdate',
          description: 'Edit channel settings',
        },
        {
          title: 'Remove channel',
          name: 'channelRemove',
          description: 'Delete a channel',
        },
        {
          title: 'Manage channel members',
          name: 'channelManageMembers',
          description: 'Add, remove or update channel members',
        },
      ],
    },
    {
      name: 'integration',
      description: 'Integration management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All integrations' }],
      actions: [
        {
          title: 'View integrations',
          name: 'showIntegrations',
          description: 'View integrations list',
          always: true,
        },
        {
          title: 'Add integration',
          name: 'integrationsAdd',
          description: 'Create integrations',
        },
        {
          title: 'Edit integration',
          name: 'integrationsEdit',
          description: 'Edit integration settings',
        },
        {
          title: 'Remove integration',
          name: 'integrationsRemove',
          description: 'Delete integrations',
        },
      ],
    },
    {
      name: 'ticket',
      description: 'Ticket management',
      scopeField: null,
      ownerFields: ['assignedUserIds'],
      scopes: [
        { name: 'own', description: 'Tickets assigned to user' },
        { name: 'group', description: 'Tickets in user departments' },
        { name: 'all', description: 'All tickets' },
      ],
      actions: [
        {
          title: 'View tickets',
          name: 'showTickets',
          description: 'View tickets',
          always: true,
        },
        {
          title: 'Add ticket',
          name: 'createTicket',
          description: 'Create tickets',
        },
        {
          title: 'Edit ticket',
          name: 'updateTicket',
          description: 'Edit tickets',
        },
        {
          title: 'Remove ticket',
          name: 'removeTicket',
          description: 'Delete tickets',
        },
        {
          title: 'Export tickets',
          name: 'ticketsExportManage',
          description: 'Export tickets to file',
        },
        {
          title: 'Import tickets',
          name: 'ticketsImportManage',
          description: 'Import tickets from file',
        },
      ],
    },
    {
      name: 'form',
      description: 'Form management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All forms' }],
      actions: [
        {
          title: 'View forms',
          name: 'showForms',
          description: 'View forms list',
          always: true,
        },
        { title: 'Add form', name: 'formsAdd', description: 'Create forms' },
        { title: 'Edit form', name: 'formsEdit', description: 'Edit forms' },
        {
          title: 'Remove form',
          name: 'formsRemove',
          description: 'Delete forms',
        },
        {
          title: 'Duplicate form',
          name: 'formsDuplicate',
          description: 'Duplicate an existing form',
        },
        {
          title: 'Toggle form status',
          name: 'formsToggleStatus',
          description: 'Activate or deactivate forms',
        },
        {
          title: 'View form submissions',
          name: 'showFormSubmissions',
          description: 'View form submission data',
          always: true,
        },
        {
          title: 'Remove form submissions',
          name: 'formSubmissionsRemove',
          description: 'Delete form submissions',
        },
        {
          title: 'Export form submissions',
          name: 'formSubmissionsExportManage',
          description: 'Export form submissions to file',
        },
      ],
    },
    {
      name: 'responseTemplate',
      description: 'Response template management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All response templates' }],
      actions: [
        {
          title: 'View response templates',
          name: 'showResponseTemplates',
          description: 'View response templates',
          always: true,
        },
        {
          title: 'Add response template',
          name: 'responseTemplatesAdd',
          description: 'Create response templates',
        },
        {
          title: 'Edit response template',
          name: 'responseTemplatesEdit',
          description: 'Edit response templates',
        },
        {
          title: 'Remove response template',
          name: 'responseTemplatesRemove',
          description: 'Delete response templates',
        },
      ],
    },
    {
      name: 'knowledgeBase',
      description: 'Knowledge base management',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All knowledge base content' }],
      actions: [
        {
          title: 'View knowledge base',
          name: 'showKnowledgeBase',
          description: 'View knowledge base topics and articles',
          always: true,
        },
        {
          title: 'Manage topics',
          name: 'knowledgeBaseTopicsManage',
          description: 'Add, edit and remove knowledge base topics',
        },
        {
          title: 'Manage categories',
          name: 'knowledgeBaseCategoriesManage',
          description: 'Add, edit and remove knowledge base categories',
        },
        {
          title: 'Manage articles',
          name: 'knowledgeBaseArticlesManage',
          description: 'Add, edit and remove knowledge base articles',
        },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'frontline:admin',
      name: 'Frontline Admin',
      description: 'Full access to all Frontline modules',
      permissions: [
        {
          plugin: 'frontline',
          module: 'inbox',
          actions: [
            'showConversations',
            'conversationMessageAdd',
            'conversationMessageEdit',
            'conversationsAssign',
            'conversationsUnassign',
            'conversationsChangeStatus',
            'conversationsResolve',
            'conversationConvertToCard',
            'conversationEditCustomFields',
          ],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'channel',
          actions: [
            'showChannels',
            'showAllChannels',
            'channelAdd',
            'channelUpdate',
            'channelRemove',
            'channelManageMembers',
          ],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'integration',
          actions: [
            'showIntegrations',
            'integrationsAdd',
            'integrationsEdit',
            'integrationsRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'ticket',
          actions: [
            'showTickets',
            'createTicket',
            'updateTicket',
            'removeTicket',
            'ticketsExportManage',
            'ticketsImportManage',
          ],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'form',
          actions: [
            'showForms',
            'formsAdd',
            'formsEdit',
            'formsRemove',
            'formsDuplicate',
            'formsToggleStatus',
            'showFormSubmissions',
            'formSubmissionsRemove',
            'formSubmissionsExportManage',
          ],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'responseTemplate',
          actions: [
            'showResponseTemplates',
            'responseTemplatesAdd',
            'responseTemplatesEdit',
            'responseTemplatesRemove',
          ],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'knowledgeBase',
          actions: [
            'showKnowledgeBase',
            'knowledgeBaseTopicsManage',
            'knowledgeBaseCategoriesManage',
            'knowledgeBaseArticlesManage',
          ],
          scope: 'all',
        },
      ],
    },
    {
      id: 'frontline:user',
      name: 'Frontline User',
      description: 'Standard support user — inbox, tickets and templates',
      permissions: [
        {
          plugin: 'frontline',
          module: 'inbox',
          actions: [
            'showConversations',
            'conversationMessageAdd',
            'conversationMessageEdit',
            'conversationsAssign',
            'conversationsChangeStatus',
            'conversationsResolve',
            'conversationEditCustomFields',
          ],
          scope: 'group',
        },
        {
          plugin: 'frontline',
          module: 'ticket',
          actions: ['showTickets', 'createTicket', 'updateTicket'],
          scope: 'group',
        },
        {
          plugin: 'frontline',
          module: 'responseTemplate',
          actions: ['showResponseTemplates'],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'form',
          actions: ['showForms', 'showFormSubmissions'],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'knowledgeBase',
          actions: ['showKnowledgeBase'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'frontline:viewer',
      name: 'Frontline Viewer',
      description:
        'Read-only access to conversations, tickets and knowledge base',
      permissions: [
        {
          plugin: 'frontline',
          module: 'inbox',
          actions: ['showConversations'],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'ticket',
          actions: ['showTickets'],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'form',
          actions: ['showForms', 'showFormSubmissions'],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'knowledgeBase',
          actions: ['showKnowledgeBase'],
          scope: 'all',
        },
        {
          plugin: 'frontline',
          module: 'responseTemplate',
          actions: ['showResponseTemplates'],
          scope: 'all',
        },
      ],
    },
  ],
};
