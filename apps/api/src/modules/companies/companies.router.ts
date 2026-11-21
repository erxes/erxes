import { db } from '@erxes/core-db';
import {
  createCompany,
  getCompany,
  removeCompanies,
  tagCompanies,
  updateCompany,
} from '~/modules/companies/companies.service';
import { companyPeople, listCompanies } from '~/modules/companies/companyList';
import { mergeCompanies } from '~/modules/companies/companyMerge';
import { linkCustomerCompany, unlinkCustomerCompany } from '~/modules/customers/customers.service';
import { withDataValues, withDataValuesOf } from '~/modules/dataExtensions/hostValues.service';
import { scoped } from '~/orpc';

const TYPE = 'core.company';

export const companiesRouter = {
  list: scoped.companies.list.handler(async ({ input }) => {
    const page = await listCompanies(db(), input);

    return { ...page, data: await withDataValues(db(), TYPE, page.data) };
  }),
  get: scoped.companies.get.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await getCompany(db(), input.id)),
  ),
  create: scoped.companies.create.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await createCompany(db(), input)),
  ),
  update: scoped.companies.update.handler(async ({ input: { id, ...changes } }) =>
    withDataValuesOf(db(), TYPE, await updateCompany(db(), id, changes)),
  ),
  remove: scoped.companies.remove.handler(({ input }) => removeCompanies(db(), input.ids)),
  merge: scoped.companies.merge.handler(({ input }) => mergeCompanies(input)),
  tag: scoped.companies.tag.handler(({ input }) => tagCompanies(db(), input)),
  people: scoped.companies.people.handler(({ input }) => companyPeople(db(), input.id)),
  linkPerson: scoped.companies.linkPerson.handler(({ input }) =>
    linkCustomerCompany(db(), input.customerId, input.id, input),
  ),
  unlinkPerson: scoped.companies.unlinkPerson.handler(({ input }) =>
    unlinkCustomerCompany(db(), input.customerId, input.id),
  ),
};
