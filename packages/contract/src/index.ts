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
import { emailTemplatesContract } from './emailTemplates';
import { smsContract } from './sms';
import { eventsContract } from './events';
import { exchangeRatesContract } from './exchangeRates';
import { customersContract } from './customers';
import { dataFieldsContract, dataObjectsContract } from './dataExtensions';
import { dataChangesContract } from './dataChanges';
import { dataFieldGroupsContract } from './dataFieldGroups';
import { dataPluginsContract } from './dataPlugins';
import { dataRecordsContract, dataValuesContract } from './dataRecords';
import { favoritesContract } from './favorites';
import { customerAccountContract } from './customerAccount';
import { customerAuthContract } from './customerAuth';
import { customerNotificationsContract } from './customerNotifications';
import { filesContract } from './files';
import { notificationsContract } from './notifications';
import { oauthConsentContract } from './oauthConsent';
import { organizationsContract } from './organizations';
import { paymentsContract } from './payments';
import { ebarimtContract } from './ebarimt';
import { pluginsContract } from './plugins';
import { productInventoriesContract } from './productInventories';
import { productCategoriesContract, productsContract } from './products';
import { recordTypesContract } from './recordTypes';
import { banksContract } from './banks';
import { integrationsContract } from './integrations';
import { githubAppContract } from './githubApp';
import { secretsContract } from './secrets';
import { rolesContract } from './roles';
import { searchContract } from './search';
import { tagsContract } from './tags';
import { trashContract } from './trash';
import { unitTypesContract, unitsContract } from './units';
import { usersContract } from './users';
import { webhooksContract } from './webhooks';
import { portalAuthContract } from './portalKeys';
import { portalContactContract } from './portalContact';
import { customerAccountsContract, portalsContract } from './portals';
import { saasContract } from './saas';
import { supportAccessContract } from './supportAccess';
import { viewsContract } from './views';
import { transferContract } from './transfer';
import { leadsContract } from './leads';
import { licenseContract } from './license';

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
  dataFields: typeof dataFieldsContract;
  dataObjects: typeof dataObjectsContract;
  dataFieldGroups: typeof dataFieldGroupsContract;
  dataPlugins: typeof dataPluginsContract;
  dataChanges: typeof dataChangesContract;
  dataRecords: typeof dataRecordsContract;
  dataValues: typeof dataValuesContract;
  favorites: typeof favoritesContract;
  customerAccount: typeof customerAccountContract;
  customerAuth: typeof customerAuthContract;
  customerNotifications: typeof customerNotificationsContract;
  emails: typeof emailsContract;
  emailTemplates: typeof emailTemplatesContract;
  sms: typeof smsContract;
  events: typeof eventsContract;
  exchangeRates: typeof exchangeRatesContract;
  files: typeof filesContract;
  leads: typeof leadsContract;
  license: typeof licenseContract;
  notifications: typeof notificationsContract;
  oauthConsent: typeof oauthConsentContract;
  organizations: typeof organizationsContract;
  payments: typeof paymentsContract;
  ebarimt: typeof ebarimtContract;
  plugins: typeof pluginsContract;
  productCategories: typeof productCategoriesContract;
  productInventories: typeof productInventoriesContract;
  products: typeof productsContract;
  recordTypes: typeof recordTypesContract;
  roles: typeof rolesContract;
  saas: typeof saasContract;
  search: typeof searchContract;
  suppressions: typeof suppressionsContract;
  supportAccess: typeof supportAccessContract;
  tags: typeof tagsContract;
  integrations: typeof integrationsContract;
  githubApp: typeof githubAppContract;
  banks: typeof banksContract;
  secrets: typeof secretsContract;
  units: typeof unitsContract;
  unitTypes: typeof unitTypesContract;
  trash: typeof trashContract;
  transfer: typeof transferContract;
  users: typeof usersContract;
  views: typeof viewsContract;
  webhooks: typeof webhooksContract;
  portals: typeof portalsContract;
  portalAuth: typeof portalAuthContract;
  portalContact: typeof portalContactContract;
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
  dataFields: dataFieldsContract,
  dataObjects: dataObjectsContract,
  dataFieldGroups: dataFieldGroupsContract,
  dataPlugins: dataPluginsContract,
  dataChanges: dataChangesContract,
  dataRecords: dataRecordsContract,
  dataValues: dataValuesContract,
  favorites: favoritesContract,
  customerAccount: customerAccountContract,
  customerAuth: customerAuthContract,
  customerNotifications: customerNotificationsContract,
  emails: emailsContract,
  emailTemplates: emailTemplatesContract,
  sms: smsContract,
  events: eventsContract,
  exchangeRates: exchangeRatesContract,
  files: filesContract,
  leads: leadsContract,
  license: licenseContract,
  notifications: notificationsContract,
  oauthConsent: oauthConsentContract,
  organizations: organizationsContract,
  payments: paymentsContract,
  ebarimt: ebarimtContract,
  plugins: pluginsContract,
  productCategories: productCategoriesContract,
  productInventories: productInventoriesContract,
  products: productsContract,
  recordTypes: recordTypesContract,
  roles: rolesContract,
  saas: saasContract,
  search: searchContract,
  suppressions: suppressionsContract,
  supportAccess: supportAccessContract,
  tags: tagsContract,
  integrations: integrationsContract,
  githubApp: githubAppContract,
  banks: banksContract,
  secrets: secretsContract,
  units: unitsContract,
  unitTypes: unitTypesContract,
  trash: trashContract,
  transfer: transferContract,
  users: usersContract,
  views: viewsContract,
  webhooks: webhooksContract,
  portals: portalsContract,
  portalAuth: portalAuthContract,
  portalContact: portalContactContract,
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

export * from './emailTemplates';

export * from './broadcastSchedules';

export * from './suppressions';

export * from './common';

export * from './errors';

export * from './companies';

export * from './contactLinks';

export * from './customers';

export * from './dataExtensionFields';

export * from './dataExtensions';

export * from './dataChanges';

export * from './dataPlugins';

export * from './dataPluginFields';

export * from './dataExtensionConditions';

export * from './dataFieldGroups';

export * from './recordNativeFields';

export * from './dataExtensionValues';

export * from './dataRecords';

export * from './customerAccount';

export * from './customerAuth';

export * from './customerNotifications';

export * from './emails';

export * from './sms';

export * from './events';

export * from './exchangeRates';

export * from './favorites';

export * from './recordTypes';

export * from './files';

export * from './leads';

export * from './stream';

export * from './money';

export * from './mongolianBanks';

export * from './notifications';

export * from './oauthConsent';

export * from './platform';

export * from './organizations';

export * from './connectionUse';

export * from './integrations';

export * from './pluginIntegrations';

export * from './githubApp';

export * from './payments';

export * from './invoiceLines';

export * from './ebarimt';

export * from './ebarimtPrint';

export * from './ebarimtReceipts';

export * from './emailSettings';

export * from './emailReplyTos';

export * from './emailDeliveries';

export * from './emailAddresses';

export * from './emailLimits';

export * from './pluginJobs';

export * from './pluginSignIn';

export * from './plugins';

export * from './pluginAssistant';

export * from './pluginRelations';

export * from './pluginTranslations';

export * from './pluginReads';

export * from './pluginTransfer';

export * from './productInventories';

export * from './products';

export * from './records';

export * from './roles';

export * from './license';

export * from './saas';

export * from './search';

export * from './supportAccess';

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

export * from './portalKeys';

export * from './portalContact';

export * from './portalMessages';

export * from './payloadFields';

export * from './portals';

export * from './apiKeys';

export * from './banks';
