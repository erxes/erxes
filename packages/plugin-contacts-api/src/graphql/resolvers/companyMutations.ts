import { checkPermission } from '@erxes/api-utils/src/permissions';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { ICompany } from '../../models/definitions/companies';
import { MODULE_NAMES } from '../../constants';
import { IContext } from '../../connectionResolver';

interface ICompaniesEdit extends ICompany {
  _id: string;
}

const companyMutations = {
  /**
   * Creates a new company
   */
  async companiesAdd(_root, doc: ICompany, { user, docModifier, models }: IContext) {
    const company = await models.Companies.createCompany(docModifier(doc), user);

    await putCreateLog(
      models,
      {
        type: MODULE_NAMES.COMPANY,
        newData: doc,
        object: company
      },
      user
    );

    return company;
  },

  /**
   * Updates a company
   */
  async companiesEdit(
    _root,
    { _id, ...doc }: ICompaniesEdit,
    { user, models }: IContext
  ) {
    const company = await models.Companies.getCompany(_id);
    const updated = await models.Companies.updateCompany(_id, doc);

    await putUpdateLog(
      models,
      {
        type: MODULE_NAMES.COMPANY,
        object: company,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes companies
   */
  async companiesRemove(
    _root,
    { companyIds }: { companyIds: string[] },
    { user, models }: IContext
  ) {
    const companies = await models.Companies.find({ _id: { $in: companyIds } }).lean();

    await models.Companies.removeCompanies(companyIds);

    for (const company of companies) {
      await putDeleteLog(models, { type: MODULE_NAMES.COMPANY, object: company }, user);
    }

    return companyIds;
  },

  /**
   * Merge companies
   */
  async companiesMerge(
    _root,
    {
      companyIds,
      companyFields
    }: { companyIds: string[]; companyFields: ICompany },
    { models: { Companies } }: IContext
  ) {
    return Companies.mergeCompanies(companyIds, companyFields);
  }
};

checkPermission(companyMutations, 'companiesAdd', 'companiesAdd');
checkPermission(companyMutations, 'companiesEdit', 'companiesEdit');
checkPermission(companyMutations, 'companiesRemove', 'companiesRemove');
checkPermission(companyMutations, 'companiesMerge', 'companiesMerge');

export default companyMutations;
