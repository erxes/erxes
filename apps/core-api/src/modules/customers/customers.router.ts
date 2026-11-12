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
import { authed, anyone } from '~/orpc';

export const customersRouter = {
  list: authed.customers.list.handler(({ input, context }) =>
    listCustomers(db(), context.actor, input),
  ),
  get: anyone.customers.get.handler(({ input, context }) =>
    getCustomer(db(), context.caller.orgId, input.id),
  ),
  findOrCreate: anyone.customers.findOrCreate.handler(({ input, context }) =>
    findOrCreateCustomer(db(), context.caller, input),
  ),
  create: authed.customers.create.handler(({ input, context }) =>
    createCustomer(db(), context.actor, input),
  ),
  update: authed.customers.update.handler(({ input: { id, ...changes }, context }) =>
    updateCustomer(db(), context.actor, id, changes),
  ),
  remove: authed.customers.remove.handler(({ input, context }) =>
    removeCustomers(db(), context.actor, input.ids),
  ),
  merge: authed.customers.merge.handler(({ input, context }) =>
    mergeCustomers(context.actor, input),
  ),
  tag: authed.customers.tag.handler(({ input, context }) =>
    tagCustomers(db(), context.actor, input),
  ),
  companies: authed.customers.companies.handler(({ input, context }) =>
    customerCompaniesOf(db(), context.actor, input.id),
  ),
  linkCompany: authed.customers.linkCompany.handler(({ input, context }) =>
    linkCustomerCompany(db(), context.actor, input.id, input.companyId, input),
  ),
  unlinkCompany: authed.customers.unlinkCompany.handler(({ input, context }) =>
    unlinkCustomerCompany(db(), context.actor, input.id, input.companyId),
  ),
};
