import { Companies } from '../../../db/models';
import { ICompany } from '../../../db/models/definitions/companies';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface ICompaniesEdit extends ICompany {
  _id: string;
}

const companyMutations = {
  /**
   * Create new company also adds Company registration log
   */
  async companiesAdd(_root, doc: ICompany, { user, docModifier }: IContext) {
    const company = await Companies.createCompany(docModifier(doc), user);

    await putCreateLog(
      {
        type: 'company',
        newData: JSON.stringify(doc),
        object: company,
        description: `${company.primaryName} has been created`,
      },
      user,
    );

    return company;
  },

  /**
   * Updates a company
   */
  async companiesEdit(_root, { _id, ...doc }: ICompaniesEdit, { user, docModifier }: IContext) {
    const company = await Companies.findOne({ _id });
    const updated = await Companies.updateCompany(_id, docModifier(doc));

    if (company) {
      await putUpdateLog(
        {
          type: 'company',
          object: company,
          newData: JSON.stringify(doc),
          description: `${company.primaryName} has been updated`,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Update company Customers
   */
  async companiesEditCustomers(_root, { _id, customerIds }: { _id: string; customerIds: string[] }) {
    return Companies.updateCustomers(_id, customerIds);
  },

  /**
   * Remove companies
   */
  async companiesRemove(_root, { companyIds }: { companyIds: string[] }, { user }: IContext) {
    for (const companyId of companyIds) {
      const company = await Companies.findOne({ _id: companyId });
      // Removing every company and modules associated with
      const removed = await Companies.removeCompany(companyId);

      if (company && removed) {
        await putDeleteLog(
          {
            type: 'company',
            object: company,
            description: `${company.primaryName} has been removed`,
          },
          user,
        );
      }
    }

    return companyIds;
  },

  /**
   * Merge companies
   */
  async companiesMerge(_root, { companyIds, companyFields }: { companyIds: string[]; companyFields: ICompany }) {
    return Companies.mergeCompanies(companyIds, companyFields);
  },
};

checkPermission(companyMutations, 'companiesAdd', 'companiesAdd');
checkPermission(companyMutations, 'companiesEdit', 'companiesEdit');
checkPermission(companyMutations, 'companiesEditCustomers', 'companiesEditCustomers');
checkPermission(companyMutations, 'companiesRemove', 'companiesRemove');
checkPermission(companyMutations, 'companiesMerge', 'companiesMerge');

export default companyMutations;
