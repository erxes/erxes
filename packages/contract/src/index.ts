import { activitiesContract } from './activities';
import { agentsContract } from './agents';
import { assistantContract } from './assistant';
import { apiKeysContract } from './apiKeys';
import { automationsContract } from './automations';
import { broadcastsContract } from './broadcasts';
import { broadcastSchedulesContract } from './broadcastSchedules';
import { suppressionsContract } from './suppressions';
import { auditContract } from './audit';
import { authContract } from './auth';
import { companiesContract } from './companies';
import { emailsContract } from './emails';
import { eventsContract } from './events';
import { exchangeRatesContract } from './exchangeRates';
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
import { productInventoriesContract } from './productInventories';
import { productCategoriesContract, productsContract } from './products';
import { banksContract } from './banks';
import { integrationsContract } from './integrations';
import { secretsContract } from './secrets';
import { rolesContract } from './roles';
import { searchContract } from './search';
import { tagsContract } from './tags';
import { trashContract } from './trash';
import { unitTypesContract, unitsContract } from './units';
import { usersContract } from './users';
import { webhooksContract } from './webhooks';
import { customerAccountsContract, websitesContract } from './websites';
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
  broadcastSchedules: typeof broadcastSchedulesContract;
  companies: typeof companiesContract;
  customers: typeof customersContract;
  favorites: typeof favoritesContract;
  customerAccount: typeof customerAccountContract;
  customerAuth: typeof customerAuthContract;
  customerNotifications: typeof customerNotificationsContract;
  emails: typeof emailsContract;
  events: typeof eventsContract;
  exchangeRates: typeof exchangeRatesContract;
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
  productInventories: typeof productInventoriesContract;
  products: typeof productsContract;
  roles: typeof rolesContract;
  saas: typeof saasContract;
  search: typeof searchContract;
  suppressions: typeof suppressionsContract;
  tags: typeof tagsContract;
  integrations: typeof integrationsContract;
  banks: typeof banksContract;
  secrets: typeof secretsContract;
  units: typeof unitsContract;
  unitTypes: typeof unitTypesContract;
  trash: typeof trashContract;
  transfer: typeof transferContract;
  users: typeof usersContract;
  views: typeof viewsContract;
  webhooks: typeof webhooksContract;
  websites: typeof websitesContract;
  customerAccounts: typeof customerAccountsContract;
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
  broadcastSchedules: broadcastSchedulesContract,
  companies: companiesContract,
  customers: customersContract,
  favorites: favoritesContract,
  customerAccount: customerAccountContract,
  customerAuth: customerAuthContract,
  customerNotifications: customerNotificationsContract,
  emails: emailsContract,
  events: eventsContract,
  exchangeRates: exchangeRatesContract,
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
  productInventories: productInventoriesContract,
  products: productsContract,
  roles: rolesContract,
  saas: saasContract,
  search: searchContract,
  suppressions: suppressionsContract,
  tags: tagsContract,
  integrations: integrationsContract,
  banks: banksContract,
  secrets: secretsContract,
  units: unitsContract,
  unitTypes: unitTypesContract,
  trash: trashContract,
  transfer: transferContract,
  users: usersContract,
  views: viewsContract,
  webhooks: webhooksContract,
  websites: websitesContract,
  customerAccounts: customerAccountsContract,
};

export * from './activities';

export * from './agents';

export * from './assistant';

export * from './assistantParts';

export * from './activityEntries';

export * from '@erxes/core-db/automationDefinition';

export * from './automation';

export * from './automationRuns';

export * from './automations';

export * from './audit';

export * from './auth';

export * from './broadcast';

export * from './broadcasts';

export * from './broadcastRecipients';

export * from './emailDocument';

export * from './broadcastSchedules';

export * from './suppressions';

export * from './common';

export * from './errors';

export * from './companies';

export * from './customers';

export * from './customerAuth';

export * from './customerNotifications';

export * from './emails';

export * from './events';

export * from './exchangeRates';

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

export * from './integrations';

export * from './payments';

export * from './invoiceLines';

export * from './ebarimt';

export * from './ebarimtPrint';

export * from './emailSettings';

export * from './emailReplyTos';

export * from './emailDeliveries';

export * from './emailAddresses';

export * from './emailLimits';

export * from './pluginJobs';

export * from './plugins';

export * from './pluginAssistant';

export * from './pluginFields';

export * from './pluginRelations';

export * from './pluginTranslations';

export * from './pluginReads';

export * from './pluginTransfer';

export * from './productInventories';

export * from './products';

export * from './records';

export * from './roles';

export * from './saas';

export * from './search';

export * from './tags';

export * from './secrets';

export * from './units';

export * from './timelines';

export * from './trash';

export * from './transfer';

export * from './users';

export * from './values';

export * from './notificationGroups';

export * from './views';

export * from './webhooks';

export * from './websites';

export * from './apiKeys';

export * from './banks';
