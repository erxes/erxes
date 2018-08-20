import * as mongoose from 'mongoose';
import {
  COC_LEAD_STATUS_TYPES,
  COC_LIFECYCLE_STATE_TYPES,
  COMPANY_BUSINESS_TYPES,
  COMPANY_INDUSTRY_TYPES,
  COMPANY_BASIC_INFOS,
} from '../../data/constants';
import { Fields, Customers, ActivityLogs, InternalNotes } from './';
import { field } from './utils';

const LinkSchema = mongoose.Schema(
  {
    linkedIn: field({ type: String, optional: true, label: 'LinkedIn' }),
    twitter: field({ type: String, optional: true, label: 'Twitter' }),
    facebook: field({ type: String, optional: true, label: 'Facebook' }),
    github: field({ type: String, optional: true, label: 'Github' }),
    youtube: field({ type: String, optional: true, label: 'Youtube' }),
    website: field({ type: String, optional: true, label: 'Website' }),
  },
  { _id: false },
);

const CompanySchema = mongoose.Schema({
  _id: field({ pkey: true }),

  createdAt: field({ type: Date, label: 'Created at' }),
  modifiedAt: field({ type: Date, label: 'Modified at' }),
  avatar: field({ type: String, optional: true }),

  // TODO: remove name field after custom command
  name: field({
    type: String,
    optional: true,
  }),

  primaryName: field({
    type: String,
    label: 'Primary Name',
    optional: true,
  }),

  names: field({
    type: [String],
    optional: true,
  }),

  size: field({
    type: Number,
    label: 'Size',
    optional: true,
  }),

  industry: field({
    type: String,
    enum: COMPANY_INDUSTRY_TYPES,
    label: 'Industry',
    optional: true,
  }),

  website: field({
    type: String,
    label: 'Website',
    optional: true,
  }),

  plan: field({
    type: String,
    label: 'Plan',
    optional: true,
  }),

  parentCompanyId: field({
    type: String,
    optional: true,
    label: 'Parent Company',
  }),
  email: field({ type: String, optional: true, label: 'Email' }),
  ownerId: field({ type: String, optional: true, label: 'Owner' }),
  phone: field({ type: String, optional: true, label: 'Phone' }),

  leadStatus: field({
    type: String,
    enum: COC_LEAD_STATUS_TYPES,
    optional: true,
    label: 'Lead Status',
  }),

  lifecycleState: field({
    type: String,
    enum: COC_LIFECYCLE_STATE_TYPES,
    optional: true,
    label: 'Lifecycle State',
  }),

  businessType: field({
    type: String,
    enum: COMPANY_BUSINESS_TYPES,
    optional: true,
    label: 'Business Type',
  }),

  description: field({ type: String, optional: true }),
  doNotDisturb: field({
    type: String,
    optional: true,
    label: 'Do not disturb',
  }),
  links: field({ type: LinkSchema, default: {} }),

  tagIds: field({
    type: [String],
    optional: true,
  }),

  customFieldsData: field({
    type: Object,
  }),
});

class Company {
  static getBasicInfos() {
    return COMPANY_BASIC_INFOS;
  }

  static getCocType() {
    return 'Company';
  }

  /**
   * Checking if company has duplicated unique properties
   * @param  {Object} companyFields - Customer fields to check duplications
   * @param  {String[]} idsToExclude - Customer ids to exclude
   * @return {Promise} - Result
   */
  static async checkDuplication(companyFields, idsToExclude) {
    let query = {};

    // Adding exclude operator to the query
    if (idsToExclude) {
      if (idsToExclude instanceof Array) {
        query._id = { $nin: idsToExclude };
      } else {
        query._id = { $ne: idsToExclude };
      }
    }

    if (companyFields.primaryName) {
      // check duplication from primaryName
      let previousEntry = await this.find({
        ...query,
        primaryName: companyFields.primaryName,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated name');
      }

      // check duplication from names
      previousEntry = await this.find({
        ...query,
        names: { $in: [companyFields.primaryName] },
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated name');
      }
    }
  }

  /**
   * Create a company
   * @param  {Object} companyObj - Object
   * @return {Promise} Newly created company object
   */
  static async createCompany(doc) {
    // Checking duplicated fields of company
    await this.checkDuplication(doc);

    // clean custom field values
    doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
    doc.createdAt = new Date();
    doc.modifiedAt = new Date();

    return this.create(doc);
  }

  /**
   * Update company
   * @param {String} _id - Company id to update
   * @param {Object} doc - Field values to update
   * @return {Promise} updated company object
   */
  static async updateCompany(_id, doc) {
    // Checking duplicated fields of company
    await this.checkDuplication(doc, [_id]);

    if (doc.customFieldsData) {
      // clean custom field values
      doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
    }

    doc.modifiedAt = new Date();

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Update company customers
   * @param {String} _id - Company id to update
   * @param {String[]} customerIds - Customer ids to update
   * @return {Promise} updated company object
   */
  static async updateCustomers(_id, customerIds) {
    // Removing companyIds from users
    await Customers.updateMany({ companyIds: { $in: [_id] } }, { $pull: { companyIds: _id } });

    // Adding companyId to the each customers
    for (let customerId of customerIds) {
      await Customers.findByIdAndUpdate(
        { _id: customerId },
        { $addToSet: { companyIds: _id } },
        { upsert: true },
      );
    }

    return this.findOne({ _id });
  }

  /**
   * Remove company
   * @param {String} companyId - Company id of company to remove
   * @return {Promise} result
   */
  static async removeCompany(companyId) {
    // Removing modules associated with company
    await ActivityLogs.removeCompanyActivityLog(companyId);
    await InternalNotes.removeCompanyInternalNotes(companyId);

    await Customers.updateMany(
      { companyIds: { $in: [companyId] } },
      { $pull: { companyIds: companyId } },
    );

    return Companies.remove({ _id: companyId });
  }

  /**
   * Merge companies
   * @param {String} companyIds - Company Ids to merge
   * @param {Object} companyFields - Company infos to create with
   * @return {Promise} Newly created company
   */
  static async mergeCompanies(companyIds, companyFields) {
    // Checking duplicated fields of company
    await this.checkDuplication(companyFields, companyIds);

    let tagIds = [];
    let names = [];

    // Merging company tags
    for (let companyId of companyIds) {
      const company = await this.findOne({ _id: companyId });

      if (company) {
        const companyTags = company.tagIds || [];
        const companyNames = company.names || [];

        // Merging company's tag into 1 array
        tagIds = tagIds.concat(companyTags);

        // Merging company names
        names = names.concat(companyNames);

        // Removing company
        await this.remove({ _id: companyId });
      }
    }

    // Removing Duplicated Tags from company
    tagIds = Array.from(new Set(tagIds));

    // Removing Duplicated names from company
    names = Array.from(new Set(names));

    // Creating company with properties
    const company = await this.createCompany({
      ...companyFields,
      tagIds,
      names,
    });

    // Updating customer companies
    for (let companyId of companyIds) {
      await Customers.updateMany(
        { companyIds: { $in: [companyId] } },
        { $push: { companyIds: company._id } },
      );

      await Customers.updateMany(
        { companyIds: { $in: [companyId] } },
        { $pull: { companyIds: companyId } },
      );
    }

    // Removing modules associated with current companies
    await ActivityLogs.changeCompany(company._id, companyIds);
    await InternalNotes.changeCompany(company._id, companyIds);

    return company;
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
