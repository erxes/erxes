import { authContract } from './auth';
import { companiesContract } from './companies';
import { customersContract } from './customers';
import { fieldsContract } from './fields';
import { organizationsContract } from './organizations';
import { tagsContract } from './tags';
import { usersContract } from './users';

export const CORE_API_VERSION = 'v1';

/** Every path in the contract is under this prefix (`/core/v1/customers`, …). */
export const CORE_API_PREFIX = '/core/v1';

/** The whole core API. Core implements it; plugins call it with a typed client. */
export const coreContract = {
  auth: authContract,
  companies: companiesContract,
  customers: customersContract,
  fields: fieldsContract,
  organizations: organizationsContract,
  tags: tagsContract,
  users: usersContract,
};

export * from './auth';
export * from './common';
export * from './companies';
export * from './customers';
export * from './fields';
export * from './organizations';
export * from './tags';
export * from './users';
