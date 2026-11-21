import { activitiesContract } from './activities';
import { agentsContract } from './agents';
import { assistantContract } from './assistant';
import { apiKeysContract } from './apiKeys';
import { automationsContract } from './automations';
import { broadcastsContract } from './broadcasts';
import { suppressionsContract } from './suppressions';
import { auditContract } from './audit';
import { authContract } from './auth';
import { companiesContract } from './companies';
import { emailsContract } from './emails';
import { eventsContract } from './events';
import { customersContract } from './customers';
import { favoritesContract } from './favorites';
import { customerAccountContract, customerAuthContract } from './customerAuth';
import { customerNotificationsContract } from './customerNotifications';
import { fieldGroupsContract } from './fieldGroups';
import { fieldsContract } from './fields';
import { filesContract } from './files';
import { notificationsContract } from './notifications';
import { organizationsContract } from './organizations';
import { paymentsContract } from './payments';
import { ebarimtContract } from './ebarimt';
import { pluginsContract } from './plugins';
import { productCategoriesContract, productsContract } from './products';
import { integrationAccountsContract } from './integrationAccounts';
import { integrationsContract } from './integrations';
import { pluginAccountsContract } from './pluginAccounts';
import { rolesContract } from './roles';
import { searchContract } from './search';
import { tagsContract } from './tags';
import { trashContract } from './trash';
import { unitTypesContract, unitsContract } from './units';
import { usersContract } from './users';
import { webhooksContract } from './webhooks';
import { saasContract } from './saas';
import { viewsContract } from './views';
import { transferContract } from './transfer';
import { leadsContract } from './leads';

/** The whole core API's type, each module by name, so its declaration stays small. */
export type CoreContract = {
  activities: typeof activitiesContract;
  agents: typeof agentsContract;
  assistant: typeof assistantContract;
  apiKeys: typeof apiKeysContract;
  automations: typeof automationsContract;
  audit: typeof auditContract;
  auth: typeof authContract;
  broadcasts: typeof broadcastsContract;
  companies: typeof companiesContract;
  customers: typeof customersContract;
  favorites: typeof favoritesContract;
  customerAccount: typeof customerAccountContract;
  customerAuth: typeof customerAuthContract;
  customerNotifications: typeof customerNotificationsContract;
  emails: typeof emailsContract;
  events: typeof eventsContract;
  fieldGroups: typeof fieldGroupsContract;
  fields: typeof fieldsContract;
  files: typeof filesContract;
  leads: typeof leadsContract;
  notifications: typeof notificationsContract;
  organizations: typeof organizationsContract;
  payments: typeof paymentsContract;
  ebarimt: typeof ebarimtContract;
  plugins: typeof pluginsContract;
  productCategories: typeof productCategoriesContract;
  products: typeof productsContract;
  roles: typeof rolesContract;
  saas: typeof saasContract;
  search: typeof searchContract;
  suppressions: typeof suppressionsContract;
  tags: typeof tagsContract;
  integrationAccounts: typeof integrationAccountsContract;
  integrations: typeof integrationsContract;
  pluginAccounts: typeof pluginAccountsContract;
  units: typeof unitsContract;
  unitTypes: typeof unitTypesContract;
  trash: typeof trashContract;
  transfer: typeof transferContract;
  users: typeof usersContract;
  views: typeof viewsContract;
  webhooks: typeof webhooksContract;
};

/** The whole core API. Core implements it; plugins call it with a typed client. */
export const coreContract: CoreContract = {
  activities: activitiesContract,
  agents: agentsContract,
  assistant: assistantContract,
  apiKeys: apiKeysContract,
  automations: automationsContract,
  audit: auditContract,
  auth: authContract,
  broadcasts: broadcastsContract,
  companies: companiesContract,
  customers: customersContract,
  favorites: favoritesContract,
  customerAccount: customerAccountContract,
  customerAuth: customerAuthContract,
  customerNotifications: customerNotificationsContract,
  emails: emailsContract,
  events: eventsContract,
  fieldGroups: fieldGroupsContract,
  fields: fieldsContract,
  files: filesContract,
  leads: leadsContract,
  notifications: notificationsContract,
  organizations: organizationsContract,
  payments: paymentsContract,
  ebarimt: ebarimtContract,
  plugins: pluginsContract,
  productCategories: productCategoriesContract,
  products: productsContract,
  roles: rolesContract,
  saas: saasContract,
  search: searchContract,
  suppressions: suppressionsContract,
  tags: tagsContract,
  integrationAccounts: integrationAccountsContract,
  integrations: integrationsContract,
  pluginAccounts: pluginAccountsContract,
  units: unitsContract,
  unitTypes: unitTypesContract,
  trash: trashContract,
  transfer: transferContract,
  users: usersContract,
  views: viewsContract,
  webhooks: webhooksContract,
};

export * from './activities';

export * from './agents';

export * from './assistant';

export * from './assistantParts';

export * from './activityEntries';

export * from '@erxes/core-db/automationDefinition';

export * from './automationRuns';

export * from './automations';

export * from './audit';

export * from './auth';

export * from './broadcasts';

export * from './suppressions';

export * from './common';

export * from './errors';

export * from './companies';

export * from './customers';

export * from './customerAuth';

export * from './customerNotifications';

export * from './emails';

export * from './events';

export * from './favorites';

export * from './fieldGroups';

export * from './fieldLogic';

export * from './fields';

export * from './files';

export * from './leads';

export * from './stream';

export * from './money';

export * from './notifications';

export * from './platform';

export * from './organizations';

export * from './paymentGateways';

export * from './payments';

export * from './invoiceLines';

export * from './ebarimt';

export * from './ebarimtPrint';

export * from './emailSettings';

export * from './emailSenders';

export * from './pluginJobs';

export * from './plugins';

export * from './pluginAssistant';

export * from './pluginFields';

export * from './pluginRelations';

export * from './pluginTranslations';

export * from './pluginReads';

export * from './pluginTransfer';

export * from './products';

export * from './records';

export * from './roles';

export * from './saas';

export * from './search';

export * from './tags';

export * from './integrations';

export * from './integrationValues';

export * from './integrationAccounts';

export * from './pluginAccounts';

export * from './pluginIntegrations';

export * from './units';

export * from './timelines';

export * from './trash';

export * from './transfer';

export * from './users';

export * from './values';

export * from './views';

export * from './webhooks';

export * from './apiKeys';
