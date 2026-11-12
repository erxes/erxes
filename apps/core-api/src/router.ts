import { coreContract } from '@erxes/core-contract';
import { db, type Transaction, withOrg, withSystem, withTransaction } from '@erxes/core-db';
import { implement } from '@orpc/server';
import type { Request, Response } from 'express';
import { config } from '~/config';
import { enforceAccess } from '~/http/access';
import { AUTOMATION_TEMPLATES } from '~/modules/automations/library';
import {
  addGateway,
  cancelInvoice,
  createInvoice,
  getInvoice,
  listGateways,
  listInvoices,
  payTestInvoice,
  removeGateway,
  updateGateway,
} from '~/modules/payments/payments.service';
import {
  completeTwoFactor,
  disableTwoFactor,
  enableTwoFactor,
  regenerateRecoveryCodes,
  setupTwoFactor,
} from '~/modules/auth/twoFactor.service';
import {
  acceptInvitation,
  invitationInfo,
  requestPasswordReset,
  resendInvitation,
  resetPassword,
} from '~/modules/auth/tokens.service';
import {
  activateAutomation,
  automationCatalog,
  automationFields,
  automationStats,
  listVersions,
  restoreVersion,
  startAutomation,
  testAutomation,
  cancelAutomationRun,
  createAutomation,
  getAutomation,
  getRun,
  listAutomations,
  listRuns,
  pauseAutomation,
  removeAutomation,
  retryAutomationRun,
  updateAutomation,
} from '~/modules/automations/automations.service';
import {
  createWebhook,
  eventTypeCatalog,
  listDeliveries,
  listWebhooks,
  redeliver,
  removeWebhook,
  rotateWebhookSecret,
  testWebhook,
  updateWebhook,
} from '~/modules/webhooks/webhooks.service';
import { createRole, listRoles, permissionCatalog, removeRole, updateRole } from '~/modules/roles/roles.service';
import { HttpError } from '~/http/errors';
import {
  installPlugin,
  issuePluginToken,
  listPlugins,
  pluginSession,
  pluginSignal,
  registerManifest,
  uninstallPlugin,
} from '~/modules/plugins/plugins.service';
import {
  type Actor,
  actorOf,
  requirePermission,
  callerOf,
  pluginCaller,
  pluginOf,
  sessionClaims,
  signAccessToken,
  userCaller,
} from '~/http/auth';
import {
  addNote,
  createPluginActivity,
  listActivities,
  removeNote,
  updateNote,
} from '~/modules/activities/activities.service';
import {
  dismissEventFailures,
  listEventFailures,
  listEvents,
  publishPluginEvents,
  retryEventFailures,
} from '~/modules/events/events.service';
import { listCheckpoints } from '~/modules/audit/checkpoints';
import {
  type AuditInput,
  auditSettings,
  listAudit,
  recordAudit,
  recordPluginAudit,
  updateAuditSettings,
  verifyAudit,
} from '~/modules/audit/audit.service';
import { SESSION_COOKIE, sessionCookieOptions } from '~/http/cookies';
import { changeOwnPassword, mySignIns, sessionVersionOf, signOutEverywhere } from '~/modules/auth/account.service';
import { getSession, signIn, recordSignedIn } from '~/modules/auth/auth.service';
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
  findOrCreateCustomer,
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

/**
 * Every procedure first passes the access map (`~/http/access`): the caller
 * must be allowed by the procedure's policy before its handler runs.
 */
const pub = implement(coreContract)
  .$context<CoreContext>()
  .use(({ context, path, next }) => {
    enforceAccess(path.join('.'), context.req);

    // The whole call runs in one transaction scoped to the caller's
    // organisation (row level security); public procedures scope themselves.
    const orgId = context.req.actor?.orgId ?? context.req.plugin?.orgId;

    return orgId ? withOrg(orgId, async () => next()) : next();
  });

/**
 * Procedures for a signed-in member: `context.actor` is the caller (resolved
 * by the `authenticate` middleware; public paths never reach these).
 */
const authed = pub.use(({ context, next }) => next({ context: { actor: actorOf(context.req) } }));

/** Procedures for plugins only (a plugin token for an organisation). */
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
const startSession = async (context: CoreContext, userId: string, orgId: string) => {
  const version = await withOrg(orgId, () => sessionVersionOf(orgId, userId));
  const token = signAccessToken(userId, orgId, config.auth.sessionHours * 60 * 60, version);

  context.res.cookie(SESSION_COOKIE, token, sessionCookieOptions(context.req));
};

const endSession = (context: CoreContext) =>
  context.res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions(context.req), maxAge: undefined });

/** Implements `@erxes/core-contract`; inputs are already validated by its schemas. */
export const coreRouter = pub.router({
  activities: {
    list: authed.activities.list.handler(({ input, context }) => listActivities(db(), context.actor, input)),
    create: plugin.activities.create.handler(({ input, context }) => createPluginActivity(db(), context.plugin, input)),
    addNote: authed.activities.addNote.handler(({ input, context }) => addNote(db(), context.actor, input)),
    updateNote: authed.activities.updateNote.handler(({ input: { id, ...changes }, context }) =>
      updateNote(db(), context.actor, id, changes),
    ),
    removeNote: authed.activities.removeNote.handler(({ input, context }) => removeNote(db(), context.actor, input.id)),
  },
  audit: {
    list: authed.audit.list.handler(({ input, context }) => listAudit(db(), context.actor, input)),
    record: plugin.audit.record.handler(({ input, context }) => recordPluginAudit(db(), context.plugin, input.entries)),
    verify: authed.audit.verify.handler(({ context }) => verifyAudit(db(), context.actor)),
    checkpoints: authed.audit.checkpoints.handler(({ input, context }) => {
      requirePermission(context.actor, 'audit.view');

      return listCheckpoints(db(), context.actor.orgId, input);
    }),
    settings: authed.audit.settings.handler(({ context }) => auditSettings(db(), context.actor.orgId)),
    updateSettings: authed.audit.updateSettings.handler(({ input, context }) =>
      updateAuditSettings(db(), context.actor, input),
    ),
  },
  events: {
    publish: plugin.events.publish.handler(({ input, context }) => publishPluginEvents(db(), context.plugin, input.events)),
    list: authed.events.list.handler(({ input, context }) => listEvents(db(), context.actor, input)),
    failures: authed.events.failures.handler(({ input, context }) => listEventFailures(db(), context.actor, input)),
    retryFailures: authed.events.retryFailures.handler(({ input, context }) =>
      retryEventFailures(db(), context.actor, input),
    ),
    dismissFailures: authed.events.dismissFailures.handler(({ input, context }) =>
      dismissEventFailures(db(), context.actor, input),
    ),
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
    setupStatus: pub.auth.setupStatus.handler(async () => ({
      required: await withSystem('setup status', (tx) => setupRequired(tx)),
    })),
    setup: pub.auth.setup.handler(async ({ input, context }) => {
      const { organization, owner } = await runSetup(input);

      await startSession(context, owner.id, organization.id);

      return getSession(organization.id, owner.id);
    }),
    signIn: pub.auth.signIn.handler(async ({ input, context }) => {
      const result = await signIn(input, context.req.get('host'));

      // Two-factor: no session until the second step.
      if ('challenge' in result) return result;

      await startSession(context, result.user.id, result.organization.id);

      return result;
    }),
    signInTwoFactor: pub.auth.signInTwoFactor.handler(async ({ input, context }) => {
      const { orgId, userId } = await completeTwoFactor(input);
      const session = await getSession(orgId, userId);

      await recordSignedIn(orgId, userId, session.user.email, { twoFactor: input.code ? 'app' : 'recovery code' });
      await startSession(context, userId, orgId);

      return session;
    }),
    twoFactorSetup: authed.auth.twoFactorSetup.handler(({ context }) => setupTwoFactor(db(), context.actor)),
    twoFactorEnable: authed.auth.twoFactorEnable.handler(async ({ input, context }) => {
      const result = await enableTwoFactor(db(), context.actor, input.code);

      // Other sessions ended; this browser stays signed in.
      if (!context.req.headers.authorization) await startSession(context, context.actor.userId, context.actor.orgId);

      return result;
    }),
    twoFactorDisable: authed.auth.twoFactorDisable.handler(({ input, context }) => disableTwoFactor(db(), context.actor, input.password)),
    twoFactorRecoveryCodes: authed.auth.twoFactorRecoveryCodes.handler(({ input, context }) =>
      regenerateRecoveryCodes(db(), context.actor, input.password),
    ),
    signOut: pub.auth.signOut.handler(async ({ context }) => {
      const session = sessionClaims(context.req);

      if (session) {
        await withOrg(session.orgId, (tx) => recordAudit(
          tx,
          { orgId: session.orgId, actorType: 'user', actorId: session.userId, source: 'core' },
          { action: 'auth.signed_out', targetType: 'user', targetId: session.userId },
        ));
      }

      endSession(context);

      return { ok: true as const };
    }),
    me: authed.auth.me.handler(({ context }) => getSession(context.actor.orgId, context.actor.userId)),
    changePassword: authed.auth.changePassword.handler(async ({ input, context }) => {
      const result = await changeOwnPassword(context.actor, input);

      // Other sessions ended; this browser stays signed in (bearer callers get a fresh token next sign-in).
      if (!context.req.headers.authorization) await startSession(context, context.actor.userId, context.actor.orgId);

      return result;
    }),
    requestPasswordReset: pub.auth.requestPasswordReset.handler(({ input }) => requestPasswordReset(input)),
    resetPassword: pub.auth.resetPassword.handler(async ({ input, context }) => {
      const { orgId, userId } = await resetPassword(input);

      await startSession(context, userId, orgId);

      return getSession(orgId, userId);
    }),
    invitation: pub.auth.invitation.handler(({ input }) => invitationInfo(input.token)),
    acceptInvitation: pub.auth.acceptInvitation.handler(async ({ input, context }) => {
      const { orgId, userId } = await acceptInvitation(input);

      await startSession(context, userId, orgId);

      return getSession(orgId, userId);
    }),
    signOutEverywhere: authed.auth.signOutEverywhere.handler(async ({ context }) => {
      const result = await signOutEverywhere(context.actor);

      endSession(context);

      return result;
    }),
    signIns: authed.auth.signIns.handler(({ context }) => mySignIns(context.actor)),
  },
  automations: {
    catalog: authed.automations.catalog.handler(({ context }) => automationCatalog(db(), context.actor.orgId)),
    list: authed.automations.list.handler(({ input, context }) => listAutomations(db(), context.actor, input)),
    get: authed.automations.get.handler(({ input, context }) => getAutomation(db(), context.actor, input.id)),
    create: authed.automations.create.handler(({ input, context }) => createAutomation(db(), context.actor, input)),
    update: authed.automations.update.handler(({ input: { id, ...changes }, context }) =>
      updateAutomation(db(), context.actor, id, changes),
    ),
    activate: authed.automations.activate.handler(({ input, context }) => activateAutomation(db(), context.actor, input.id)),
    pause: authed.automations.pause.handler(({ input, context }) => pauseAutomation(db(), context.actor, input.id)),
    remove: authed.automations.remove.handler(({ input, context }) => removeAutomation(db(), context.actor, input.id)),
    start: authed.automations.start.handler(({ input, context }) => startAutomation(db(), context.actor, input.id, input.subjects)),
    test: authed.automations.test.handler(({ input: { id, ...rest }, context }) => testAutomation(db(), context.actor, id, rest)),
    stats: authed.automations.stats.handler(({ input, context }) => automationStats(db(), context.actor, input.id)),
    versions: authed.automations.versions.handler(({ input, context }) => listVersions(db(), context.actor, input.id)),
    restoreVersion: authed.automations.restoreVersion.handler(({ input, context }) =>
      restoreVersion(db(), context.actor, input.id, input.version),
    ),
    templates: authed.automations.templates.handler(() => ({ data: AUTOMATION_TEMPLATES })),
    fields: authed.automations.fields.handler(({ input, context }) => automationFields(db(), context.actor, input.subject)),
    runs: authed.automations.runs.handler(({ input, context }) => listRuns(db(), context.actor, input)),
    run: authed.automations.run.handler(({ input, context }) => getRun(db(), context.actor, input.runId)),
    retryRun: authed.automations.retryRun.handler(({ input, context }) => retryAutomationRun(db(), context.actor, input.runId)),
    cancelRun: authed.automations.cancelRun.handler(({ input, context }) => cancelAutomationRun(db(), context.actor, input.runId)),
  },
  payments: {
    gateways: authed.payments.gateways.handler(({ context }) => listGateways(db(), context.actor)),
    addGateway: authed.payments.addGateway.handler(({ input, context }) => addGateway(db(), context.actor, input)),
    updateGateway: authed.payments.updateGateway.handler(({ input: { id, ...changes }, context }) =>
      updateGateway(db(), context.actor, id, changes),
    ),
    removeGateway: authed.payments.removeGateway.handler(({ input, context }) => removeGateway(db(), context.actor, input.id)),
    createInvoice: anyone.payments.createInvoice.handler(({ input, context }) => createInvoice(db(), context.caller, input)),
    getInvoice: anyone.payments.getInvoice.handler(({ input, context }) => getInvoice(db(), context.caller, input.id)),
    cancelInvoice: anyone.payments.cancelInvoice.handler(({ input, context }) => cancelInvoice(db(), context.caller, input.id)),
    invoices: authed.payments.invoices.handler(({ input, context }) => listInvoices(db(), context.actor, input)),
    payTestInvoice: authed.payments.payTestInvoice.handler(({ input, context }) => payTestInvoice(db(), context.actor, input.id)),
  },
  webhooks: {
    eventTypes: authed.webhooks.eventTypes.handler(async ({ context }) => ({ data: await eventTypeCatalog(db(), context.actor.orgId) })),
    list: authed.webhooks.list.handler(({ context }) => listWebhooks(db(), context.actor)),
    create: authed.webhooks.create.handler(({ input, context }) => createWebhook(db(), context.actor, input)),
    update: authed.webhooks.update.handler(({ input: { id, ...changes }, context }) => updateWebhook(db(), context.actor, id, changes)),
    remove: authed.webhooks.remove.handler(({ input, context }) => removeWebhook(db(), context.actor, input.id)),
    rotateSecret: authed.webhooks.rotateSecret.handler(({ input, context }) => rotateWebhookSecret(db(), context.actor, input.id)),
    test: authed.webhooks.test.handler(({ input, context }) => testWebhook(db(), context.actor, input.id)),
    deliveries: authed.webhooks.deliveries.handler(({ input, context }) => listDeliveries(db(), context.actor, input)),
    redeliver: authed.webhooks.redeliver.handler(({ input, context }) => redeliver(db(), context.actor, input.deliveryId)),
  },
  roles: {
    list: authed.roles.list.handler(({ context }) => listRoles(db(), context.actor)),
    permissions: authed.roles.permissions.handler(async ({ context }) => ({
      data: await permissionCatalog(db(), context.actor.orgId),
    })),
    create: authed.roles.create.handler(({ input, context }) => createRole(context.actor, input)),
    update: authed.roles.update.handler(({ input: { key, ...changes }, context }) => updateRole(context.actor, key, changes)),
    remove: authed.roles.remove.handler(({ input, context }) => removeRole(context.actor, input.key)),
  },
  plugins: {
    token: pub.plugins.token.handler(({ input }) => issuePluginToken(input)),
    registerManifest: pub.plugins.registerManifest.handler(({ input, context }) => {
      if (!context.req.pluginService) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

      return registerManifest(context.req.pluginService, input);
    }),
    list: authed.plugins.list.handler(({ context }) => listPlugins(context.actor)),
    install: authed.plugins.install.handler(({ input, context }) => installPlugin(context.actor, input.name)),
    uninstall: authed.plugins.uninstall.handler(({ input, context }) => uninstallPlugin(context.actor, input.name)),
    session: authed.plugins.session.handler(({ input, context }) => pluginSession(context.actor, input.name)),
    signal: plugin.plugins.signal.handler(({ input, context }) => pluginSignal(context.plugin, input)),
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
    resendInvitation: authed.users.resendInvitation.handler(({ input, context }) => resendInvitation(db(), context.actor, input.id)),
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
    get: anyone.customers.get.handler(({ input, context }) => getCustomer(db(), { orgId: context.caller.orgId } as Actor, input.id)),
    findOrCreate: anyone.customers.findOrCreate.handler(({ input, context }) => findOrCreateCustomer(db(), context.caller, input)),
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
    get: anyone.companies.get.handler(({ input, context }) => getCompany(db(), { orgId: context.caller.orgId } as Actor, input.id)),
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
