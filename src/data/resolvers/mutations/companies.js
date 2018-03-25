import { Companies, ActivityLogs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const companyMutations = {
  /**
   * Create new company also adds Company registration log
   * @return {Promise} company object
   */
  async companiesAdd(root, doc, { user }) {
    const company = await Companies.createCompany(doc);
    await ActivityLogs.createCompanyRegistrationLog(company, user);
    return company;
  },

  /**
   * Update company
   * @return {Promise} company object
   */
  async companiesEdit(root, { _id, ...doc }) {
    return Companies.updateCompany(_id, doc);
  },

  /**
   * Add new companyId to company's companyIds list also adds Customer registration log
   * @param {Object} args - Graphql input data
   * @param {String} args._id - Company id
   * @param {String} args.firstName - Customer first name
   * @param {String} args.lastName - Customer last name
   * @param {String} args.email - Customer email
   * @return {Promise} newly created customer
   */
  async companiesAddCustomer(root, args, { user }) {
    const customer = await Companies.addCustomer(args);
    await ActivityLogs.createCustomerRegistrationLog(customer, user);
    return customer;
  },

  /**
   * Update company Customers
   * @param {String[]} customerIds - Customer ids to update
   * @return {Promise} Company object
   */
  async companiesEditCustomers(root, { _id, customerIds }) {
    return Companies.updateCustomers(_id, customerIds);
  },

  /**
   * Remove companies
   * @param {String[]} companyIds - Company Ids to remove
   * @return {Promise} Removed company ids
   */
  async companiesRemove(root, { companyIds }) {
    for (let companyId of companyIds) {
      // Removing every company and modules associated with
      await Companies.removeCompany(companyId);
    }

    return companyIds;
  },

  /**
   * Merge companies
   * @param {String} companyIds - Company Ids to merge
   * @param {Object} companyFields - Company infos to create with
   * @return {Promise} Newly created company
   */
  async companiesMerge(root, { companyIds, companyFields }) {
    return Companies.mergeCompanies(companyIds, companyFields);
  },
};

moduleRequireLogin(companyMutations);

export default companyMutations;
