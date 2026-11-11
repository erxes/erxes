import { coreContract } from '@erxes/core-contract';
import { db } from '@erxes/core-db';
import { implement } from '@orpc/server';
import type { Request, Response } from 'express';
import { config } from '~/config';
import { actorOf, signAccessToken } from '~/http/auth';
import { SESSION_COOKIE, sessionCookieOptions } from '~/http/cookies';
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
import { createField, listFields, removeField, updateField } from '~/modules/fields/fields.service';
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

/** Signs the member in on this browser (HttpOnly session cookie). */
const startSession = (context: CoreContext, userId: string, orgId: string) => {
  const token = signAccessToken(userId, orgId, config.auth.sessionHours * 60 * 60);

  context.res.cookie(SESSION_COOKIE, token, sessionCookieOptions(context.req));
};

/** Implements `@erxes/core-contract`; inputs are already validated by its schemas. */
export const coreRouter = pub.router({
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
    create: authed.tags.create.handler(({ input, context }) => createTag(db(), context.actor, input)),
    update: authed.tags.update.handler(({ input: { id, ...changes }, context }) =>
      updateTag(db(), context.actor, id, changes),
    ),
    remove: authed.tags.remove.handler(({ input, context }) => removeTag(db(), context.actor, input.id)),
  },
  fields: {
    list: authed.fields.list.handler(({ input, context }) => listFields(db(), context.actor, input.contentType)),
    create: authed.fields.create.handler(({ input, context }) => createField(db(), context.actor, input)),
    update: authed.fields.update.handler(({ input: { id, ...changes }, context }) =>
      updateField(db(), context.actor, id, changes),
    ),
    remove: authed.fields.remove.handler(({ input, context }) => removeField(db(), context.actor, input.id)),
  },
});
