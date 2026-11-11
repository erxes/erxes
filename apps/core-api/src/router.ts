import { coreContract } from '@erxes/core-contract';
import { db, type Transaction, withTransaction } from '@erxes/core-db';
import { implement } from '@orpc/server';
import type { Request, Response } from 'express';
import { config } from '~/config';
import { type Actor, actorOf, callerOf, pluginCaller, pluginOf, signAccessToken, userCaller } from '~/http/auth';
import { createPluginActivity, listActivities } from '~/modules/activities/activities.service';
import { type AuditInput, listAudit, recordAudit } from '~/modules/audit/audit.service';
import { SESSION_COOKIE, sessionCookieOptions } from '~/http/cookies';
import { changeOwnPassword, mySignIns } from '~/modules/auth/account.service';
import { getSession, signIn } from '~/modules/auth/auth.service';
import {
  createCompany,
  getCompany,
  listCompanies,
  mergeCompanies,
  removeCompanies,
  tagCompanies,
  updateCompany,
} from '~/modules/companies/companies.service';
import {
  createCustomer,
  customerCompaniesOf,
  getCustomer,
  linkCustomerCompany,
  listCustomers,
  mergeCustomers,
  removeCustomers,
  tagCustomers,
  unlinkCustomerCompany,
  updateCustomer,
} from '~/modules/customers/customers.service';
import {
  archiveFieldGroup,
  archiveFields,
  createField,
  createFieldGroup,
  fieldUsage,
  listFieldGroups,
  listFields,
  removeField,
  removeFieldGroup,
  removeUnusedFields,
  reorderFieldGroups,
  reorderFields,
  restoreField,
  restoreFieldGroup,
  updateField,
  updateFieldGroup,
} from '~/modules/fields/fields.service';
import {
  completeUpload,
  createUpload,
  getFile,
  getFileSettings,
  listFiles,
  removeFile,
  updateFileSettings,
} from '~/modules/files/files.service';
import {
  listNotifications,
  markRead,
  notificationSettings,
  notify,
  removeNotification,
  unreadCount,
  updateNotificationSettings,
} from '~/modules/notifications/notifications.service';
import { getOrganization, toOrganizationDto } from '~/modules/organizations/organizations.service';
import { runSetup, setupRequired } from '~/modules/setup/setup.service';
import { createTag, listTags, removeTag, updateTag } from '~/modules/tags/tags.service';
import {
  getUser,
  inviteUser,
  inviteUsers,
  listUsers,
  setUserDisabled,
  setUserPassword,
  updateUser,
} from '~/modules/users/users.service';

/** What every procedure gets: the Express request (actor, host) and response (cookies). */
export interface CoreContext {
  req: Request;
  res: Response;
}

const pub = implement(coreContract).$context<CoreContext>();

/**
 * Procedures for a signed-in member: `context.actor` is the caller (resolved
 * by the `authenticate` middleware; public paths never reach these).
 */
const authed = pub.use(({ context, next }) => next({ context: { actor: actorOf(context.req) } }));

/** Procedures for plugins only (plugin key + `X-Erxes-Org`). */
const plugin = pub.use(({ context, next }) => next({ context: { plugin: pluginOf(context.req) } }));

/** Procedures for members and plugins alike; `context.caller` says which. */
const anyone = pub.use(({ context, next }) =>
  next({ context: { caller: callerOf(context.req), actor: context.req.actor ?? null } }),
);

const labelOf = (value: unknown) => {
  const record = value as { label?: unknown; name?: unknown } | null;

  return typeof record?.label === 'string' ? record.label : typeof record?.name === 'string' ? record.name : null;
};

/**
 * Runs a settings change and its audit entry in one transaction: both are
 * saved, or neither.
 */
const audited = <T>(
  actor: Actor,
  run: (tx: Transaction) => Promise<T>,
  entry: (result: T) => AuditInput | AuditInput[],
) =>
  withTransaction(async (tx) => {
    const result = await run(tx);

    await recordAudit(tx, userCaller(actor), entry(result));

    return result;
  });

const recordOf = (targetType: string, action: string, id: string, result?: unknown): AuditInput => ({
  action: `${targetType}.${action}`,
  targetType,
  targetId: id,
  targetLabel: labelOf(result),
});

/** Signs the member in on this browser (HttpOnly session cookie). */
const startSession = (context: CoreContext, userId: string, orgId: string) => {
  const token = signAccessToken(userId, orgId, config.auth.sessionHours * 60 * 60);

  context.res.cookie(SESSION_COOKIE, token, sessionCookieOptions(context.req));
};

/** Implements `@erxes/core-contract`; inputs are already validated by its schemas. */
export const coreRouter = pub.router({
  activities: {
    list: authed.activities.list.handler(({ input, context }) => listActivities(db(), context.actor, input)),
    create: plugin.activities.create.handler(({ input, context }) => createPluginActivity(db(), context.plugin, input)),
  },
  audit: {
    list: authed.audit.list.handler(({ input, context }) => listAudit(db(), context.actor, input)),
  },
  files: {
    createUpload: anyone.files.createUpload.handler(({ input, context }) => createUpload(db(), context.caller, input)),
    complete: anyone.files.complete.handler(({ input, context }) => completeUpload(db(), context.caller, input.id)),
    get: anyone.files.get.handler(({ input, context }) => getFile(db(), context.caller, input.id)),
    list: anyone.files.list.handler(({ input, context }) => listFiles(db(), context.caller, input.ids)),
    remove: anyone.files.remove.handler(({ input, context }) =>
      removeFile(db(), context.caller, context.actor, input.id),
    ),
    settings: authed.files.settings.handler(({ context }) => getFileSettings(db(), context.actor)),
    updateSettings: authed.files.updateSettings.handler(({ input, context }) =>
      updateFileSettings(db(), context.actor, input),
    ),
  },
  notifications: {
    list: authed.notifications.list.handler(({ input, context }) => listNotifications(db(), context.actor, input)),
    unreadCount: authed.notifications.unreadCount.handler(({ input, context }) =>
      unreadCount(db(), context.actor, input.source),
    ),
    settings: authed.notifications.settings.handler(({ context }) => notificationSettings(db(), context.actor)),
    updateSettings: authed.notifications.updateSettings.handler(({ input, context }) =>
      updateNotificationSettings(db(), context.actor, input),
    ),
    markRead: authed.notifications.markRead.handler(({ input, context }) => markRead(db(), context.actor, input)),
    remove: authed.notifications.remove.handler(({ input, context }) =>
      removeNotification(db(), context.actor, input.id),
    ),
    create: plugin.notifications.create.handler(({ input, context }) =>
      notify(db(), pluginCaller(context.plugin), input),
    ),
  },
  auth: {
    setupStatus: pub.auth.setupStatus.handler(async () => ({ required: await setupRequired(db()) })),
    setup: pub.auth.setup.handler(async ({ input, context }) => {
      const { organization, owner } = await runSetup(input);

      startSession(context, owner.id, organization.id);

      return getSession(organization.id, owner.id);
    }),
    signIn: pub.auth.signIn.handler(async ({ input, context }) => {
      const session = await signIn(input, context.req.get('host'));

      startSession(context, session.user.id, session.organization.id);

      return session;
    }),
    signOut: pub.auth.signOut.handler(({ context }) => {
      context.res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions(context.req), maxAge: undefined });

      return { ok: true as const };
    }),
    me: authed.auth.me.handler(({ context }) => getSession(context.actor.orgId, context.actor.userId)),
    changePassword: authed.auth.changePassword.handler(({ input, context }) => changeOwnPassword(context.actor, input)),
    signIns: authed.auth.signIns.handler(({ context }) => mySignIns(context.actor)),
  },
  organizations: {
    current: authed.organizations.current.handler(async ({ context }) =>
      toOrganizationDto(await getOrganization(db(), context.actor.orgId)),
    ),
  },
  users: {
    list: authed.users.list.handler(({ input, context }) => listUsers(db(), context.actor, input)),
    get: authed.users.get.handler(({ input, context }) => getUser(db(), context.actor, input.id)),
    invite: authed.users.invite.handler(({ input, context }) => inviteUser(db(), context.actor, input)),
    inviteMany: authed.users.inviteMany.handler(({ input, context }) => inviteUsers(context.actor, input.entries)),
    update: authed.users.update.handler(({ input: { id, ...changes }, context }) =>
      updateUser(context.actor, id, changes),
    ),
    setPassword: authed.users.setPassword.handler(({ input, context }) =>
      setUserPassword(context.actor, input.id, input.password),
    ),
    disable: authed.users.disable.handler(({ input, context }) => setUserDisabled(context.actor, input.id, true)),
    enable: authed.users.enable.handler(({ input, context }) => setUserDisabled(context.actor, input.id, false)),
  },
  customers: {
    list: authed.customers.list.handler(({ input, context }) => listCustomers(db(), context.actor, input)),
    get: authed.customers.get.handler(({ input, context }) => getCustomer(db(), context.actor, input.id)),
    create: authed.customers.create.handler(({ input, context }) => createCustomer(db(), context.actor, input)),
    update: authed.customers.update.handler(({ input: { id, ...changes }, context }) =>
      updateCustomer(db(), context.actor, id, changes),
    ),
    remove: authed.customers.remove.handler(({ input, context }) =>
      removeCustomers(db(), context.actor, input.ids),
    ),
    merge: authed.customers.merge.handler(({ input, context }) => mergeCustomers(context.actor, input)),
    tag: authed.customers.tag.handler(({ input, context }) => tagCustomers(db(), context.actor, input)),
    companies: authed.customers.companies.handler(({ input, context }) =>
      customerCompaniesOf(db(), context.actor, input.id),
    ),
    linkCompany: authed.customers.linkCompany.handler(({ input, context }) =>
      linkCustomerCompany(db(), context.actor, input.id, input.companyId),
    ),
    unlinkCompany: authed.customers.unlinkCompany.handler(({ input, context }) =>
      unlinkCustomerCompany(db(), context.actor, input.id, input.companyId),
    ),
  },
  companies: {
    list: authed.companies.list.handler(({ input, context }) => listCompanies(db(), context.actor, input)),
    get: authed.companies.get.handler(({ input, context }) => getCompany(db(), context.actor, input.id)),
    create: authed.companies.create.handler(({ input, context }) => createCompany(db(), context.actor, input)),
    update: authed.companies.update.handler(({ input: { id, ...changes }, context }) =>
      updateCompany(db(), context.actor, id, changes),
    ),
    remove: authed.companies.remove.handler(({ input, context }) =>
      removeCompanies(db(), context.actor, input.ids),
    ),
    merge: authed.companies.merge.handler(({ input, context }) => mergeCompanies(context.actor, input)),
    tag: authed.companies.tag.handler(({ input, context }) => tagCompanies(db(), context.actor, input)),
  },
  tags: {
    list: authed.tags.list.handler(({ input, context }) => listTags(db(), context.actor, input)),
    create: authed.tags.create.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => createTag(tx, context.actor, input),
        (tag) => recordOf('tag', 'created', tag.id, tag),
      ),
    ),
    update: authed.tags.update.handler(({ input: { id, ...changes }, context }) =>
      audited(
        context.actor,
        (tx) => updateTag(tx, context.actor, id, changes),
        (tag) => ({ ...recordOf('tag', 'updated', id, tag), metadata: changes }),
      ),
    ),
    remove: authed.tags.remove.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => removeTag(tx, context.actor, input.id),
        () => recordOf('tag', 'deleted', input.id),
      ),
    ),
  },
  fields: {
    list: authed.fields.list.handler(({ input, context }) => listFields(db(), context.actor, input)),
    usage: authed.fields.usage.handler(({ input, context }) => fieldUsage(db(), context.actor, input)),
    create: authed.fields.create.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => createField(tx, context.actor, input),
        (field) => recordOf('field', 'created', field.id, field),
      ),
    ),
    update: authed.fields.update.handler(({ input: { id, ...changes }, context }) =>
      audited(
        context.actor,
        (tx) => updateField(tx, context.actor, id, changes),
        (field) => ({ ...recordOf('field', 'updated', id, field), metadata: changes }),
      ),
    ),
    reorder: authed.fields.reorder.handler(({ input, context }) => reorderFields(db(), context.actor, input.orders)),
    archive: authed.fields.archive.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => archiveFields(tx, context.actor, input.ids),
        () => input.ids.map((id) => recordOf('field', 'archived', id)),
      ),
    ),
    restore: authed.fields.restore.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => restoreField(tx, context.actor, input.id),
        (field) => recordOf('field', 'restored', input.id, field),
      ),
    ),
    removeUnused: authed.fields.removeUnused.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => removeUnusedFields(tx, context.actor, input.ids),
        () => input.ids.map((id) => recordOf('field', 'deleted', id)),
      ),
    ),
    remove: authed.fields.remove.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => removeField(tx, context.actor, input.id),
        () => recordOf('field', 'deleted', input.id),
      ),
    ),
  },
  fieldGroups: {
    list: authed.fieldGroups.list.handler(({ input, context }) => listFieldGroups(db(), context.actor, input)),
    create: authed.fieldGroups.create.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => createFieldGroup(tx, context.actor, input),
        (group) => recordOf('field_group', 'created', group.id, group),
      ),
    ),
    update: authed.fieldGroups.update.handler(({ input: { id, ...changes }, context }) =>
      audited(
        context.actor,
        (tx) => updateFieldGroup(tx, context.actor, id, changes),
        (group) => ({ ...recordOf('field_group', 'updated', id, group), metadata: changes }),
      ),
    ),
    reorder: authed.fieldGroups.reorder.handler(({ input, context }) =>
      reorderFieldGroups(db(), context.actor, input.orders),
    ),
    archive: authed.fieldGroups.archive.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => archiveFieldGroup(tx, context.actor, input.id),
        (group) => recordOf('field_group', 'archived', input.id, group),
      ),
    ),
    restore: authed.fieldGroups.restore.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => restoreFieldGroup(tx, context.actor, input.id),
        (group) => recordOf('field_group', 'restored', input.id, group),
      ),
    ),
    remove: authed.fieldGroups.remove.handler(({ input, context }) =>
      audited(
        context.actor,
        (tx) => removeFieldGroup(tx, context.actor, input.id),
        () => recordOf('field_group', 'deleted', input.id),
      ),
    ),
  },
});
