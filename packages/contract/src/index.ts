import { activitiesContract } from './activities';
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

/** The whole core API. Core implements it; plugins call it with a typed client. */
export const coreContract = {
  activities: activitiesContract,
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
  units: unitsContract,
  unitTypes: unitTypesContract,
  trash: trashContract,
  transfer: transferContract,
  users: usersContract,
  views: viewsContract,
  webhooks: webhooksContract,
};

export * from './activities';

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

export * from './fields';

export * from './files';

export * from './leads';

export * from './money';

export * from './notifications';

export * from './platform';

export * from './organizations';

export * from './paymentGateways';

export * from './payments';

export * from './invoiceLines';

export * from './ebarimt';

export * from './pluginJobs';

export * from './plugins';

export * from './pluginFields';

export * from './pluginRelations';

export * from './pluginReads';

export * from './products';

export * from './roles';

export * from './saas';

export * from './search';

export * from './tags';

export * from './units';

export * from './timelines';

export * from './trash';

export * from './transfer';

export * from './users';

export * from './values';

export * from './views';

export * from './eventTypes';

export * from './webhooks';

export * from './apiKeys';
