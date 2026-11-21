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
import { withDataValues, withDataValuesOf } from '~/modules/dataExtensions/hostValues.service';
import { scoped } from '~/orpc';

const TYPE = 'core.customer';

export const customersRouter = {
  list: scoped.customers.list.handler(async ({ input }) => {
    const page = await listCustomers(db(), input);

    return { ...page, data: await withDataValues(db(), TYPE, page.data) };
  }),
  get: scoped.customers.get.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await getCustomer(db(), input.id)),
  ),
  findOrCreate: scoped.customers.findOrCreate.handler(({ input }) =>
    findOrCreateCustomer(db(), input),
  ),
  create: scoped.customers.create.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await createCustomer(db(), input)),
  ),
  update: scoped.customers.update.handler(async ({ input: { id, ...changes } }) =>
    withDataValuesOf(db(), TYPE, await updateCustomer(db(), id, changes)),
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
