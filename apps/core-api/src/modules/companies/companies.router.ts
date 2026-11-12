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
import { authed, anyone } from '~/orpc';

export const companiesRouter = {
  list: authed.companies.list.handler(({ input, context }) =>
    listCompanies(db(), context.actor, input),
  ),
  get: anyone.companies.get.handler(({ input, context }) =>
    getCompany(db(), context.caller.orgId, input.id),
  ),
  create: authed.companies.create.handler(({ input, context }) =>
    createCompany(db(), context.actor, input),
  ),
  update: authed.companies.update.handler(({ input: { id, ...changes }, context }) =>
    updateCompany(db(), context.actor, id, changes),
  ),
  remove: authed.companies.remove.handler(({ input, context }) =>
    removeCompanies(db(), context.actor, input.ids),
  ),
  merge: authed.companies.merge.handler(({ input, context }) =>
    mergeCompanies(context.actor, input),
  ),
  tag: authed.companies.tag.handler(({ input, context }) =>
    tagCompanies(db(), context.actor, input),
  ),
  people: authed.companies.people.handler(({ input, context }) =>
    companyPeople(db(), context.actor, input.id),
  ),
  linkPerson: authed.companies.linkPerson.handler(({ input, context }) =>
    linkCustomerCompany(db(), context.actor, input.customerId, input.id, input),
  ),
  unlinkPerson: authed.companies.unlinkPerson.handler(({ input, context }) =>
    unlinkCustomerCompany(db(), context.actor, input.customerId, input.id),
  ),
};
