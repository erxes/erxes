import { checkPermission } from 'erxes-api-shared/core-modules';
import { ICompany } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const companyMutations = {
  /**
   * Creates a new company
   */
  async companiesAdd(
    _parent: undefined,
    doc: ICompany,
    { models, user }: IContext,
  ) {
    return await models.Companies.createCompany(doc, user);
  },

  /**
   * Updates a company
   */
  async companiesEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ICompany,
    { models }: IContext,
  ) {
    return await models.Companies.updateCompany(_id, doc);
  },

  /**
   * Removes companies
   */
  async companiesRemove(
    _parent: undefined,
    { companyIds }: { companyIds: string[] },
    { models }: IContext,
  ) {
    await models.Companies.removeCompanies(companyIds);

    return companyIds;
  },

  /**
   * Merge companies
   */
  async companiesMerge(
    _parent: undefined,
    {
      companyIds,
      companyFields,
    }: { companyIds: string[]; companyFields: ICompany },
    { models }: IContext,
  ) {
    return models.Companies.mergeCompanies(companyIds, companyFields);
  },
};

checkPermission(companyMutations, 'companiesAdd', 'companiesAdd');
checkPermission(companyMutations, 'companiesEdit', 'companiesEdit');
checkPermission(companyMutations, 'companiesEditByField', 'companiesEdit');
checkPermission(companyMutations, 'companiesRemove', 'companiesRemove');
checkPermission(companyMutations, 'companiesMerge', 'companiesMerge');
