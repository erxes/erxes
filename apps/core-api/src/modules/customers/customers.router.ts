import { db } from '@erxes/core-db';
import { customerCompaniesOf } from '~/modules/customers/customerLinks';
import { listCustomers } from '~/modules/customers/customerList';
import { mergeCustomers } from '~/modules/customers/customerMerge';
import {
  createCustomer,
  getCustomer,
  linkCustomerCompany,
  removeCustomers,
  tagCustomers,
  unlinkCustomerCompany,
  updateCustomer,
} from '~/modules/customers/customers.service';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { scoped } from '~/orpc';

export const customersRouter = {
  list: scoped.customers.list.handler(({ input }) => listCustomers(db(), input)),
  get: scoped.customers.get.handler(({ input }) => getCustomer(db(), input.id)),
  findOrCreate: scoped.customers.findOrCreate.handler(({ input }) =>
    findOrCreateCustomer(db(), input),
  ),
  create: scoped.customers.create.handler(({ input }) => createCustomer(db(), input)),
  update: scoped.customers.update.handler(({ input: { id, ...changes } }) =>
    updateCustomer(db(), id, changes),
  ),
  remove: scoped.customers.remove.handler(({ input }) => removeCustomers(db(), input.ids)),
  merge: scoped.customers.merge.handler(({ input }) => mergeCustomers(input)),
  tag: scoped.customers.tag.handler(({ input }) => tagCustomers(db(), input)),
  companies: scoped.customers.companies.handler(({ input }) => customerCompaniesOf(db(), input.id)),
  linkCompany: scoped.customers.linkCompany.handler(({ input }) =>
    linkCustomerCompany(db(), input.id, input.companyId, input),
  ),
  unlinkCompany: scoped.customers.unlinkCompany.handler(({ input }) =>
    unlinkCustomerCompany(db(), input.id, input.companyId),
  ),
};
