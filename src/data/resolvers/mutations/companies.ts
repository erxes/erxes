import { ActivityLogs, Companies } from '../../../db/models';
import { ICompany } from '../../../db/models/definitions/companies';
import { IUserDocument } from '../../../db/models/definitions/users';
import { moduleRequireLogin } from '../../permissions';

interface ICompaniesEdit extends ICompany {
  _id: string;
}

const companyMutations = {
  /**
   * Create new company also adds Company registration log
   */
  async companiesAdd(_root, doc: ICompany, { user }: { user: IUserDocument }) {
    const company = await Companies.createCompany(doc, user);

    await ActivityLogs.createCompanyRegistrationLog(company, user);

    return company;
  },

  /**
   * Update company
   */
  async companiesEdit(_root, { _id, ...doc }: ICompaniesEdit) {
    return Companies.updateCompany(_id, doc);
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
  async companiesRemove(_root, { companyIds }: { companyIds: string[] }) {
    for (const companyId of companyIds) {
      // Removing every company and modules associated with
      await Companies.removeCompany(companyId);
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

moduleRequireLogin(companyMutations);

export default companyMutations;
