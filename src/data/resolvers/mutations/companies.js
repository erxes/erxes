import { Companies, ActivityLogs, InternalNotes } from '../../../db/models';
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
   * @param {String} args.name - Customer name
   * @param {String} args.email - Customer email
   * @return {Promise} newly created customer
   */
  async companiesAddCustomer(root, args, { user }) {
    const customer = Companies.addCustomer(args);
    await ActivityLogs.createCustomerRegistrationLog(customer, user);
    return customer;
  },

  /**
   * Update company Customers
   * @param {string[]} customerIds - Customer ids to update
   * @return {Promise} Company object
   */
  async companiesEditCustomers(root, { _id, customerIds }) {
    return Companies.updateCustomers(_id, customerIds);
  },

  /**
   * Remove companies
   * @param {string[]} companyIds - Company Ids to remove
   * @return {Promise} Removed company ids
   */
  async companiesRemove(root, { companyIds }) {
    for (let companyId of companyIds) {
      await ActivityLogs.removeCompanyActivityLog(companyId);
      await InternalNotes.removeCompanyInternalNotes(companyId);
      await Companies.removeCompany(companyId);
    }

    return companyIds;
  },

  /**
   * Merge companies
   * @param {String} companyIds - Company Ids to merge
   * @param {Object} newCompany - Newly created company
   * @return {Promise} Newly created company
   */
  async companiesMerge(root, { companyIds, newCompany }) {
    if (companyIds.length !== 2) {
      throw new Error('You can only merge 2 companies at a time');
    }
    // Removing companies
    for (let companyId of companyIds) {
      await Companies.removeCompany(companyId);
    }
    // Creating company with properties
    const company = await Companies.createCompany(newCompany);
    // Removing modules associated with current companies
    await ActivityLogs.changeCompany(company._id, companyIds);
    await InternalNotes.changeCompany(company._id, companyIds);

    return company;
  },
};

moduleRequireLogin(companyMutations);

export default companyMutations;
