import { activitiesContract } from './activities';
import { auditContract } from './audit';
import { authContract } from './auth';
import { companiesContract } from './companies';
import { customersContract } from './customers';
import { fieldGroupsContract, fieldsContract } from './fields';
import { filesContract } from './files';
import { notificationsContract } from './notifications';
import { organizationsContract } from './organizations';
import { tagsContract } from './tags';
import { usersContract } from './users';

export const CORE_API_VERSION = 'v1';

/** Every path in the contract is under this prefix (`/core/v1/customers`, …). */
export const CORE_API_PREFIX = '/core/v1';

/** The whole core API. Core implements it; plugins call it with a typed client. */
export const coreContract = {
  activities: activitiesContract,
  audit: auditContract,
  auth: authContract,
  companies: companiesContract,
  customers: customersContract,
  fieldGroups: fieldGroupsContract,
  fields: fieldsContract,
  files: filesContract,
  notifications: notificationsContract,
  organizations: organizationsContract,
  tags: tagsContract,
  users: usersContract,
};

export * from './activities';
export * from './audit';
export * from './auth';
export * from './common';
export * from './companies';
export * from './customers';
export * from './fields';
export * from './files';
export * from './notifications';
export * from './platform';
export * from './organizations';
export * from './tags';
export * from './users';
