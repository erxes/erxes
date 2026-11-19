/**
 * Old permissions were grants of `module.action` to a member or a user group; the new core gives
 * each member one role, a named set of actions. Each user group becomes a role with the core
 * actions its grants cover. Grants to single members and plugin actions have no core action.
 */
import { z } from 'zod';
import { remember } from './idMap';
import { insert, readAll, type Run, unit } from './run';
import { record, text } from './values';

const CONTACTS = [
  'contacts.view',
  'contacts.create',
  'contacts.edit',
  'contacts.delete',
  'contacts.merge',
  'contacts.import',
  'contacts.export',
];

/** Old actions (3.4 `permissions.action`) → core actions. */
const ACTIONS: Record<string, string[]> = {
  customersAll: CONTACTS,
  companiesAll: CONTACTS,
  showCustomers: ['contacts.view'],
  showCompanies: ['contacts.view'],
  customersAdd: ['contacts.create'],
  companiesAdd: ['contacts.create'],
  customersEdit: ['contacts.edit'],
  companiesEdit: ['contacts.edit'],
  customersRemove: ['contacts.delete'],
  companiesRemove: ['contacts.delete'],
  customersMerge: ['contacts.merge'],
  companiesMerge: ['contacts.merge'],
  exportCustomers: ['contacts.export'],
  exportCompanies: ['contacts.export'],
  importHistoriesAll: ['contacts.import'],
  importXlsFile: ['contacts.import'],
  tagsAll: ['tags.manage', 'tags.delete'],
  manageTags: ['tags.manage'],
  removeTags: ['tags.delete'],
  usersAll: ['team.view', 'team.invite', 'team.manage'],
  showUsers: ['team.view'],
  usersInvite: ['team.invite'],
  usersEdit: ['team.manage'],
  permissionsAll: ['roles.manage'],
  managePermissions: ['roles.manage'],
  usersGroupsAll: ['roles.manage'],
  structuresAll: ['structure.manage'],
  branchesAll: ['structure.manage'],
  departmentsAll: ['structure.manage'],
  unitsAll: ['structure.manage'],
  generalSettingsAll: ['settings.manage'],
  manageGeneralSettings: ['settings.manage'],
  viewLogs: ['audit.view'],
  productsAll: ['products.manage'],
  manageProducts: ['products.manage'],
  removeProducts: ['products.manage'],
  paymentsAll: ['payments.manage', 'payments.refund'],
  invoicesAll: ['payments.manage'],
  engagesAll: ['broadcasts.view', 'broadcasts.manage', 'broadcasts.send'],
  automationAll: ['automations.view', 'automations.manage'],
  automationsAdd: ['automations.manage'],
  automationsEdit: ['automations.manage'],
  automationsRemove: ['automations.manage'],
  showAutomations: ['automations.view'],
  ebarimtAll: ['integrations.manage'],
};

/** A role key the core accepts (`r_` and 6–40 letters or digits) for an old group id. */
export const roleKey = (groupId: string) =>
  `r_${groupId
    .replaceAll(/[^A-Za-z0-9]/g, '')
    .slice(0, 40)
    .padEnd(6, '0')}`;

const Grant = record({ groupId: text, userId: text, action: text, allowed: z.unknown() });

const Group = record({ name: text, description: text });

/** Each group's core actions, and the old actions with no core equivalent. */
const groupActions = (grants: z.infer<typeof Grant>[]) => {
  const actions = new Map<string, Set<string>>();

  for (const grant of grants) {
    if (!grant.groupId || grant.allowed === false || !grant.action) continue;

    const set = actions.get(grant.groupId) ?? new Set<string>();

    for (const action of ACTIONS[grant.action] ?? []) set.add(action);

    actions.set(grant.groupId, set);
  }

  return actions;
};

/** Creates a role per old user group; returns group id → role key. */
export const importRoles = async (run: Run) => {
  const grants = (await readAll(run, 'permissions')).flatMap((doc) => {
    const parsed = Grant.safeParse(doc);

    return parsed.success ? [parsed.data] : [];
  });

  run.report.of('permissions', 'core_roles.permissions');
  run.report.seen('permissions', grants.length);

  for (const grant of grants) {
    if (!grant.groupId) {
      run.report.skip('permissions', 'granted to one member; roles hold grants now', grant.id);
    } else if (!grant.action || !ACTIONS[grant.action]) {
      run.report.skip('permissions', `no core action for ${grant.action ?? '?'}`, grant.id);
    } else run.report.copied('permissions', 1);
  }

  const actions = groupActions(grants);

  const groups = (await readAll(run, 'user_groups')).flatMap((doc) => {
    const parsed = Group.safeParse(doc);

    return parsed.success ? [parsed.data] : [];
  });

  run.report.of('user_groups', 'core_roles');
  run.report.seen('user_groups', groups.length);

  await unit(run, async () => {
    await insert(run, {
      collection: 'user_groups',
      table: 'core_roles',
      columns: ['key', 'name', 'description', 'permissions', 'builtin'],
      rows: groups.map((group) => [
        roleKey(group.id),
        group.name ?? group.id,
        group.description,
        [...(actions.get(group.id) ?? [])].toSorted(),
        false,
      ]),
      keys: groups.map((group) => group.id),
    });
    await remember(
      run,
      'user_groups',
      'role',
      groups.map((group) => [group.id, roleKey(group.id)]),
    );
  });

  return new Map(groups.map((group) => [group.id, roleKey(group.id)]));
};
