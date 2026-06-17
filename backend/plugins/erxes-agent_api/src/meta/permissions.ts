import {
  IPermissionAction,
  IPermissionConfig,
  IPermissionModule,
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
// The config is assembled from small factories (`action`, `buildModule`,
// `grant`) so the per-module/per-group boilerplate is declared once. Agent
// config (agents, providers, settings, workflows, schedules, learnings) is
// global rather than per-owner, so groups use the `all` scope; per-user
// ownership for chat threads/feedback is enforced in the resolvers (resourceId
// scoping), independent of these scopes.

const PLUGIN = 'erxes-agent';
type Scope = IPermissionScope['name'];

const SCOPES: IPermissionScope[] = [
  { name: 'own', description: 'Records the user created' },
  { name: 'all', description: 'All records' },
];

/** One action. `always` reads stay available to every logged-in user. */
const action = (
  name: string,
  title: string,
  description: string,
  always = false,
): IPermissionAction => ({ name, title, description, ...(always && { always }) });

/** One module wrapped in the platform-standard scope boilerplate. */
const buildModule = (
  name: string,
  description: string,
  actions: IPermissionAction[],
): IPermissionModule => ({
  name,
  description,
  scopeField: null,
  ownerFields: [],
  scopes: SCOPES,
  actions,
});

const modules: IPermissionModule[] = [
  buildModule('agent', 'AI agent management & chat', [
    action('agentsView', 'View agents', 'List and read AI agent configurations', true),
    action('agentsCreate', 'Create agent', 'Create a new AI agent'),
    action('agentsEdit', 'Edit agent', 'Update an existing AI agent'),
    action('agentsRemove', 'Remove agent', 'Delete an AI agent'),
    action(
      'agentsChat',
      'Chat with agents',
      'Talk to an agent and manage your own chat threads & message feedback',
    ),
  ]),
  buildModule('provider', 'AI provider credentials (LLM connections)', [
    action(
      'providersView',
      'View providers',
      'List configured providers, the provider catalog and live model lists',
    ),
    action('providersManage', 'Manage providers', 'Create or update provider credentials and API keys'),
    action('providersRemove', 'Remove providers', 'Delete a provider configuration'),
  ]),
  buildModule('settings', 'Agent plugin settings & company knowledge', [
    action('settingsView', 'View settings', 'Read plugin settings and derived feature status'),
    action('settingsManage', 'Manage settings', 'Save plugin-wide agent settings'),
    action('settingsKnowledgeSync', 'Sync company knowledge', 'Force a Company Knowledge reindex'),
  ]),
  buildModule('workflow', 'Agent workflow definitions & runs', [
    action('workflowsView', 'View workflows', 'List workflows, read definitions and run history', true),
    action('workflowsCreate', 'Create workflow', 'Create a new workflow definition'),
    action('workflowsEdit', 'Edit workflow', 'Update a workflow definition or enable/disable it'),
    action('workflowsRemove', 'Remove workflow', 'Delete a workflow'),
    action('workflowsRun', 'Run workflow', 'Manually execute a workflow'),
  ]),
  buildModule('schedule', 'Scheduled agent runs', [
    action('schedulesView', 'View schedules', 'List and read scheduled agent runs', true),
    action('schedulesCreate', 'Create schedule', 'Create a new scheduled agent run'),
    action('schedulesEdit', 'Edit schedule', 'Update a schedule or enable/disable it'),
    action('schedulesRemove', 'Remove schedule', 'Delete a schedule'),
    action('schedulesRun', 'Run schedule', 'Manually trigger a scheduled run now'),
  ]),
  buildModule('learning', 'Agent learning & knowledge curation', [
    action('learningView', 'View learnings', 'List learnings, stats and status', true),
    action('learningCreate', 'Create learning', 'Add a learning statement'),
    action('learningEdit', 'Edit learning', 'Edit, re-status or pin a learning statement'),
    action('learningRemove', 'Remove learning', 'Delete a learning statement'),
  ]),
];

const byName: Record<string, IPermissionModule> = Object.fromEntries(
  modules.map((m) => [m.name, m]),
);

/** A group's permission entry — always plugin-scoped; scope defaults to `all`. */
const grant = (module: string, actions: string[], scope: Scope = 'all') => ({
  plugin: PLUGIN,
  module,
  actions,
  scope,
});

/** Every action of a module — used by the admin group. */
const allOf = (module: string) =>
  grant(module, byName[module].actions.map((a) => a.name));

export const permissions: IPermissionConfig = {
  plugin: PLUGIN,
  modules,
  defaultGroups: [
    {
      id: `${PLUGIN}:admin`,
      name: 'Agent Admin',
      description: 'Full access to the AI agent plugin',
      permissions: modules.map((m) => allOf(m.name)),
    },
    {
      id: `${PLUGIN}:user`,
      name: 'Agent User',
      description: 'Chat with agents and run existing workflows',
      permissions: [
        grant('agent', ['agentsView', 'agentsChat']),
        grant('workflow', ['workflowsView', 'workflowsRun']),
        grant('schedule', ['schedulesView']),
        grant('learning', ['learningView']),
      ],
    },
    {
      id: `${PLUGIN}:viewer`,
      name: 'Agent Viewer',
      description: 'Read-only access, including provider and settings status',
      permissions: [
        grant('agent', ['agentsView']),
        grant('provider', ['providersView']),
        grant('settings', ['settingsView']),
        grant('workflow', ['workflowsView']),
        grant('schedule', ['schedulesView']),
        grant('learning', ['learningView']),
      ],
    },
  ],
};
