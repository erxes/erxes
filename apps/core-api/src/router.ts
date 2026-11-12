import { activitiesRouter } from '~/modules/activities/activities.router';
import { auditRouter } from '~/modules/audit/audit.router';
import { eventsRouter } from '~/modules/events/events.router';
import { filesRouter } from '~/modules/files/files.router';
import { notificationsRouter } from '~/modules/notifications/notifications.router';
import { authRouter } from '~/modules/auth/auth.router';
import { automationsRouter } from '~/modules/automations/automations.router';
import { paymentsRouter } from '~/modules/payments/payments.router';
import { webhooksRouter } from '~/modules/webhooks/webhooks.router';
import { trashRouter } from '~/modules/trash/trash.router';
import { rolesRouter } from '~/modules/roles/roles.router';
import { pluginsRouter } from '~/modules/plugins/plugins.router';
import { organizationsRouter } from '~/modules/organizations/organizations.router';
import { saasRouter } from '~/modules/saas/saas.router';
import { usersRouter } from '~/modules/users/users.router';
import { transferRouter } from '~/modules/transfer/transfer.router';
import { leadsRouter } from '~/modules/leads/leads.router';
import { viewsRouter } from '~/modules/views/views.router';
import { customersRouter } from '~/modules/customers/customers.router';
import { companiesRouter } from '~/modules/companies/companies.router';
import { tagsRouter } from '~/modules/tags/tags.router';
import { fieldsRouter, fieldGroupsRouter } from '~/modules/fields/fields.router';
import { pub } from '~/orpc';

/** Implements `@erxes/core-contract`; inputs are already validated by its schemas. */
export const coreRouter = pub.router({
  activities: activitiesRouter,
  audit: auditRouter,
  events: eventsRouter,
  files: filesRouter,
  notifications: notificationsRouter,
  auth: authRouter,
  automations: automationsRouter,
  payments: paymentsRouter,
  webhooks: webhooksRouter,
  trash: trashRouter,
  roles: rolesRouter,
  plugins: pluginsRouter,
  organizations: organizationsRouter,
  saas: saasRouter,
  users: usersRouter,
  transfer: transferRouter,
  leads: leadsRouter,
  views: viewsRouter,
  customers: customersRouter,
  companies: companiesRouter,
  tags: tagsRouter,
  fields: fieldsRouter,
  fieldGroups: fieldGroupsRouter,
});
