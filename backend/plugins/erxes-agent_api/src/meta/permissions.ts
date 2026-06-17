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
// The config is data-driven (a `SPECS` table fed through `crud`/`buildModule`)
// so the standard View/Create/Edit/Remove shape is declared exactly once;
// agent config is global, so groups use the `all` scope while per-user
// ownership for chat threads/feedback is enforced in the resolvers.

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

/** Standard create/read/update/delete actions — generated in one place. */
const crud = (
  prefix: string,
  noun: string,
  o: { view: string; viewAlways?: boolean; edit?: string },
): IPermissionAction[] => [
  action(`${prefix}View`, `View ${noun}s`, o.view, o.viewAlways),
  action(`${prefix}Create`, `Create ${noun}`, `Create a new ${noun}`),
  action(`${prefix}Edit`, `Edit ${noun}`, o.edit ?? `Update a ${noun}`),
  action(`${prefix}Remove`, `Remove ${noun}`, `Delete a ${noun}`),
];

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

// A module is either CRUD (generated from prefix/noun, plus any `extra`
// actions) or fully custom (`actions`) for the non-CRUD modules.
type Spec = {
  name: string;
  description: string;
  prefix?: string;
  noun?: string;
  view?: string;
  viewAlways?: boolean;
  edit?: string;
  extra?: IPermissionAction[];
  actions?: IPermissionAction[];
};

const SPECS: Spec[] = [
  {
    name: 'agent',
    description: 'AI agent management & chat',
    prefix: 'agents',
    noun: 'agent',
    view: 'List and read AI agent configurations',
    viewAlways: true,
    extra: [
      action(
        'agentsChat',
        'Chat with agents',
        'Talk to an agent and manage your own chat threads & message feedback',
      ),
    ],
  },
  {
    name: 'provider',
    description: 'AI provider credentials (LLM connections)',
    actions: [
      action(
        'providersView',
        'View providers',
        'List configured providers, the provider catalog and live model lists',
      ),
      action(
        'providersManage',
        'Manage providers',
        'Create or update provider credentials and API keys',
      ),
      action(
        'providersRemove',
        'Remove providers',
        'Delete a provider configuration',
      ),
    ],
  },
  {
    name: 'settings',
    description: 'Agent plugin settings & company knowledge',
    actions: [
      action(
        'settingsView',
        'View settings',
        'Read plugin settings and derived feature status',
      ),
      action('settingsManage', 'Manage settings', 'Save plugin-wide agent settings'),
      action(
        'settingsKnowledgeSync',
        'Sync company knowledge',
        'Force a Company Knowledge reindex',
      ),
    ],
  },
  {
    name: 'workflow',
    description: 'Agent workflow definitions & runs',
    prefix: 'workflows',
    noun: 'workflow',
    view: 'List workflows, read definitions and run history',
    viewAlways: true,
    edit: 'Update a workflow definition or enable/disable it',
    extra: [action('workflowsRun', 'Run workflow', 'Manually execute a workflow')],
  },
  {
    name: 'schedule',
    description: 'Scheduled agent runs',
    prefix: 'schedules',
    noun: 'schedule',
    view: 'List and read scheduled agent runs',
    viewAlways: true,
    edit: 'Update a schedule or enable/disable it',
    extra: [
      action('schedulesRun', 'Run schedule', 'Manually trigger a scheduled run now'),
    ],
  },
  {
    name: 'learning',
    description: 'Agent learning & knowledge curation',
    prefix: 'learning',
    noun: 'learning',
    view: 'List learnings, stats and status',
    viewAlways: true,
    edit: 'Edit, re-status or pin a learning statement',
  },
];

const modules: IPermissionModule[] = SPECS.map((s) =>
  buildModule(
    s.name,
    s.description,
    s.actions ?? [
      ...crud(s.prefix as string, s.noun as string, {
        view: s.view as string,
        viewAlways: s.viewAlways,
        edit: s.edit,
      }),
      ...(s.extra ?? []),
    ],
  ),
);

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
  grant(
    module,
    byName[module].actions.map((a) => a.name),
  );

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
