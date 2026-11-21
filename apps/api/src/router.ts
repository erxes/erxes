import { activitiesRouter } from '~/modules/activities/activities.router';
import { agentsRouter } from '~/modules/agents/agents.router';
import { assistantRouter } from '~/modules/assistant/assistant.router';
import { apiKeysRouter } from '~/modules/apiKeys/apiKeys.router';
import { auditRouter } from '~/modules/audit/audit.router';
import { emailsRouter } from '~/modules/email/emails.router';
import { eventsRouter } from '~/modules/events/events.router';
import { exchangeRatesRouter } from '~/modules/exchangeRates/exchangeRates.router';
import { filesRouter } from '~/modules/files/files.router';
import { notificationsRouter } from '~/modules/notifications/notifications.router';
import { authRouter } from '~/modules/auth/auth.router';
import { automationsRouter } from '~/modules/automations/automations.router';
import {
  broadcastSchedulesRouter,
  broadcastsRouter,
  suppressionsRouter,
} from '~/modules/broadcasts/broadcasts.router';
import { paymentsRouter } from '~/modules/payments/payments.router';
import { ebarimtRouter } from '~/modules/ebarimt/ebarimt.router';
import {
  productCategoriesRouter,
  productInventoriesRouter,
  productsRouter,
} from '~/modules/products/products.router';
import { banksRouter } from '~/modules/banks/banks.router';
import { integrationsRouter } from '~/modules/integrations/integrations.router';
import { secretsRouter } from '~/modules/secrets/secrets.router';
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
import { favoritesRouter } from '~/modules/favorites/favorites.router';
import { customersRouter } from '~/modules/customers/customers.router';
import {
  customerAccountRouter,
  customerAuthRouter,
} from '~/modules/customerAuth/customerAuth.router';
import { customerNotificationsRouter } from '~/modules/customerNotifications/customerNotifications.router';
import { customerAccountsRouter, websitesRouter } from '~/modules/websites/websites.router';
import { companiesRouter } from '~/modules/companies/companies.router';
import { searchRouter } from '~/modules/search/search.router';
import { tagsRouter } from '~/modules/tags/tags.router';
import { unitTypesRouter, unitsRouter } from '~/modules/units/units.router';
import { fieldsRouter, fieldGroupsRouter } from '~/modules/fields/fields.router';
import { unscoped } from '~/orpc';

/** Implements `@erxes/core-contract`; inputs are already validated by its schemas. */
export const coreRouter = unscoped.router({
  activities: activitiesRouter,
  agents: agentsRouter,
  assistant: assistantRouter,
  audit: auditRouter,
  emails: emailsRouter,
  events: eventsRouter,
  exchangeRates: exchangeRatesRouter,
  files: filesRouter,
  notifications: notificationsRouter,
  auth: authRouter,
  automations: automationsRouter,
  broadcasts: broadcastsRouter,
  broadcastSchedules: broadcastSchedulesRouter,
  suppressions: suppressionsRouter,
  payments: paymentsRouter,
  ebarimt: ebarimtRouter,
  productCategories: productCategoriesRouter,
  productInventories: productInventoriesRouter,
  products: productsRouter,
  webhooks: webhooksRouter,
  integrations: integrationsRouter,
  banks: banksRouter,
  secrets: secretsRouter,
  apiKeys: apiKeysRouter,
  trash: trashRouter,
  roles: rolesRouter,
  plugins: pluginsRouter,
  organizations: organizationsRouter,
  saas: saasRouter,
  users: usersRouter,
  transfer: transferRouter,
  leads: leadsRouter,
  views: viewsRouter,
  favorites: favoritesRouter,
  customers: customersRouter,
  customerAccount: customerAccountRouter,
  customerAuth: customerAuthRouter,
  customerNotifications: customerNotificationsRouter,
  websites: websitesRouter,
  customerAccounts: customerAccountsRouter,
  companies: companiesRouter,
  search: searchRouter,
  tags: tagsRouter,
  units: unitsRouter,
  unitTypes: unitTypesRouter,
  fields: fieldsRouter,
  fieldGroups: fieldGroupsRouter,
});
