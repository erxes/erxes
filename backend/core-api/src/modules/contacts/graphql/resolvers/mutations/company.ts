import { ICompany } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const companyMutations = {
  /**
   * Creates a new company
   */
  async companiesAdd(
    _parent: undefined,
    doc: ICompany,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('contactsCreate');

    return await models.Companies.createCompany(doc, user);
  },

  /**
   * Updates a company
   */
  async companiesEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ICompany,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('contactsUpdate');

    return await models.Companies.updateCompany(_id, doc);
  },

  /**
   * Removes companies
   */
  async companiesRemove(
    _parent: undefined,
    { companyIds }: { companyIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('contactsDelete');

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
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('contactsMerge');

    return models.Companies.mergeCompanies(companyIds, companyFields);
  },
};
