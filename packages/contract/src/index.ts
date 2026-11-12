import { activitiesContract } from './activities';
import { automationsContract } from './automations';
import { auditContract } from './audit';
import { authContract } from './auth';
import { companiesContract } from './companies';
import { eventsContract } from './events';
import { customersContract } from './customers';
import { fieldGroupsContract, fieldsContract } from './fields';
import { filesContract } from './files';
import { notificationsContract } from './notifications';
import { organizationsContract } from './organizations';
import { paymentsContract } from './payments';
import { pluginsContract } from './plugins';
import { rolesContract } from './roles';
import { tagsContract } from './tags';
import { trashContract } from './trash';
import { usersContract } from './users';
import { webhooksContract } from './webhooks';
import { saasContract } from './saas';
import { viewsContract } from './views';
import { transferContract } from './transfer';
import { leadsContract } from './leads';

export const CORE_API_VERSION = 'v1';

/** Every path in the contract is under this prefix (`/core/v1/customers`, …). */
export const CORE_API_PREFIX = '/core/v1';

/** The whole core API. Core implements it; plugins call it with a typed client. */
export const coreContract = {
  activities: activitiesContract,
  automations: automationsContract,
  audit: auditContract,
  auth: authContract,
  companies: companiesContract,
  customers: customersContract,
  events: eventsContract,
  fieldGroups: fieldGroupsContract,
  fields: fieldsContract,
  files: filesContract,
  leads: leadsContract,
  notifications: notificationsContract,
  organizations: organizationsContract,
  payments: paymentsContract,
  plugins: pluginsContract,
  roles: rolesContract,
  saas: saasContract,
  tags: tagsContract,
  trash: trashContract,
  transfer: transferContract,
  users: usersContract,
  views: viewsContract,
  webhooks: webhooksContract,
};

export * from './activities';

export * from './automations';

export * from './audit';

export * from './auth';

export * from './common';

export * from './companies';

export * from './customers';

export * from './events';

export * from './fields';

export * from './files';

export * from './leads';

export * from './notifications';

export * from './platform';

export * from './organizations';

export * from './payments';

export * from './plugins';

export * from './roles';

export * from './saas';

export * from './tags';

export * from './trash';

export * from './transfer';

export * from './users';

export * from './views';

export * from './webhooks';
