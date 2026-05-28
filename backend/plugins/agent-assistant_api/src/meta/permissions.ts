import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'agent-assistant',
  modules: [
    {
      name: 'agentAssistants',
      description: 'Agent assistants management',
      scopes: [
        { name: 'all', description: 'All agent assistants' },
      ],
      actions: [
        {
          title: 'Show agent assistants',
          name: 'showAgentAssistants',
          description: 'View agent assistants',
        },
        {
          title: 'Manage agent assistants',
          name: 'manageAgentAssistants',
          description: 'Create, edit and delete agent assistants',
        },
      ],
    },
  ],
};
