import {
  IPermissionConfig,
  IPermissionScope,
} from 'erxes-api-shared/core-types';

// Permission map for the erxes-agent plugin. Every GraphQL mutation/query and
// the user-facing /chat/stream route is gated by exactly one action below.
//
// Action naming: `<module><Verb>`. `View` actions read; `Create/Edit/Remove`
// write; `Run`/`Chat`/`Sync`/`Manage` are the special verbs. `always: true`
// means every logged-in user keeps the action regardless of group — used only
// for non-sensitive reads (it mirrors the convention in the loyalty/sales
// plugins). Reads that can leak secrets (provider credentials, the settings
// document with `erxesApiToken`) are NOT `always` and must be granted.
//
// Standard scopes are declared on every module for consistency with the rest of
// the platform, but agent config (agents, providers, settings, workflows,
// schedules, learnings) is global rather than per-owner, so default groups use
// the `all` scope. Per-user ownership for chat threads/feedback is enforced
// inside the resolvers (resourceId scoping), independent of these scopes.

const STANDARD_SCOPES: IPermissionScope[] = [
  { name: 'own', description: 'Records the user created' },
  { name: 'all', description: 'All records' },
];

export const permissions: IPermissionConfig = {
  plugin: 'erxes-agent',

  modules: [
    {
      name: 'agent',
      description: 'AI agent management & chat',
      scopeField: null,
      ownerFields: [],
      scopes: STANDARD_SCOPES,
      actions: [
        {
          title: 'View agents',
          name: 'agentsView',
          description: 'List and read AI agent configurations',
          always: true,
        },
        {
          title: 'Create agent',
          name: 'agentsCreate',
          description: 'Create a new AI agent',
        },
        {
          title: 'Edit agent',
          name: 'agentsEdit',
          description: 'Update an existing AI agent',
        },
        {
          title: 'Remove agent',
          name: 'agentsRemove',
          description: 'Delete an AI agent',
        },
        {
          title: 'Chat with agents',
          name: 'agentsChat',
          description:
            'Talk to an agent and manage your own chat threads & message feedback',
        },
      ],
    },
    {
      name: 'provider',
      description: 'AI provider credentials (LLM connections)',
      scopeField: null,
      ownerFields: [],
      scopes: STANDARD_SCOPES,
      actions: [
        {
          title: 'View providers',
          name: 'providersView',
          description:
            'List configured providers, the provider catalog and live model lists',
        },
        {
          title: 'Manage providers',
          name: 'providersManage',
          description: 'Create or update provider credentials and API keys',
        },
        {
          title: 'Remove providers',
          name: 'providersRemove',
          description: 'Delete a provider configuration',
        },
      ],
    },
    {
      name: 'settings',
      description: 'Agent plugin settings & company knowledge',
      scopeField: null,
      ownerFields: [],
      scopes: STANDARD_SCOPES,
      actions: [
        {
          title: 'View settings',
          name: 'settingsView',
          description: 'Read plugin settings and derived feature status',
        },
        {
          title: 'Manage settings',
          name: 'settingsManage',
          description: 'Save plugin-wide agent settings',
        },
        {
          title: 'Sync company knowledge',
          name: 'settingsKnowledgeSync',
          description: 'Force a Company Knowledge reindex',
        },
      ],
    },
    {
      name: 'workflow',
      description: 'Agent workflow definitions & runs',
      scopeField: null,
      ownerFields: [],
      scopes: STANDARD_SCOPES,
      actions: [
        {
          title: 'View workflows',
          name: 'workflowsView',
          description: 'List workflows, read definitions and run history',
          always: true,
        },
        {
          title: 'Create workflow',
          name: 'workflowsCreate',
          description: 'Create a new workflow definition',
        },
        {
          title: 'Edit workflow',
          name: 'workflowsEdit',
          description: 'Update a workflow definition or enable/disable it',
        },
        {
          title: 'Remove workflow',
          name: 'workflowsRemove',
          description: 'Delete a workflow',
        },
        {
          title: 'Run workflow',
          name: 'workflowsRun',
          description: 'Manually execute a workflow',
        },
      ],
    },
    {
      name: 'schedule',
      description: 'Scheduled agent runs',
      scopeField: null,
      ownerFields: [],
      scopes: STANDARD_SCOPES,
      actions: [
        {
          title: 'View schedules',
          name: 'schedulesView',
          description: 'List and read scheduled agent runs',
          always: true,
        },
        {
          title: 'Create schedule',
          name: 'schedulesCreate',
          description: 'Create a new scheduled agent run',
        },
        {
          title: 'Edit schedule',
          name: 'schedulesEdit',
          description: 'Update a schedule or enable/disable it',
        },
        {
          title: 'Remove schedule',
          name: 'schedulesRemove',
          description: 'Delete a schedule',
        },
        {
          title: 'Run schedule',
          name: 'schedulesRun',
          description: 'Manually trigger a scheduled run now',
        },
      ],
    },
    {
      name: 'learning',
      description: 'Agent learning & knowledge curation',
      scopeField: null,
      ownerFields: [],
      scopes: STANDARD_SCOPES,
      actions: [
        {
          title: 'View learnings',
          name: 'learningView',
          description: 'List learnings, stats, status and the knowledge dataset',
          always: true,
        },
        {
          title: 'Create learning',
          name: 'learningCreate',
          description: 'Add a learning statement',
        },
        {
          title: 'Edit learning',
          name: 'learningEdit',
          description: 'Edit, re-status or pin a learning statement',
        },
        {
          title: 'Remove learning',
          name: 'learningRemove',
          description: 'Delete a learning statement',
        },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'erxes-agent:admin',
      name: 'Agent Admin',
      description: 'Full access to the AI agent plugin',
      permissions: [
        {
          plugin: 'erxes-agent',
          module: 'agent',
          actions: [
            'agentsView',
            'agentsCreate',
            'agentsEdit',
            'agentsRemove',
            'agentsChat',
          ],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'provider',
          actions: ['providersView', 'providersManage', 'providersRemove'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'settings',
          actions: ['settingsView', 'settingsManage', 'settingsKnowledgeSync'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'workflow',
          actions: [
            'workflowsView',
            'workflowsCreate',
            'workflowsEdit',
            'workflowsRemove',
            'workflowsRun',
          ],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'schedule',
          actions: [
            'schedulesView',
            'schedulesCreate',
            'schedulesEdit',
            'schedulesRemove',
            'schedulesRun',
          ],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'learning',
          actions: [
            'learningView',
            'learningCreate',
            'learningEdit',
            'learningRemove',
          ],
          scope: 'all',
        },
      ],
    },
    {
      id: 'erxes-agent:user',
      name: 'Agent User',
      description: 'Chat with agents and run existing workflows',
      permissions: [
        {
          plugin: 'erxes-agent',
          module: 'agent',
          actions: ['agentsView', 'agentsChat'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'workflow',
          actions: ['workflowsView', 'workflowsRun'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'schedule',
          actions: ['schedulesView'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'learning',
          actions: ['learningView'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'erxes-agent:viewer',
      name: 'Agent Viewer',
      description: 'Read-only access, including provider and settings status',
      permissions: [
        {
          plugin: 'erxes-agent',
          module: 'agent',
          actions: ['agentsView'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'provider',
          actions: ['providersView'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'settings',
          actions: ['settingsView'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'workflow',
          actions: ['workflowsView'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'schedule',
          actions: ['schedulesView'],
          scope: 'all',
        },
        {
          plugin: 'erxes-agent',
          module: 'learning',
          actions: ['learningView'],
          scope: 'all',
        },
      ],
    },
  ],
};
