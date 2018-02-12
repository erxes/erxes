import mongoose from 'mongoose';
import { field } from './utils';
import { COC_CONTENT_TYPES } from '../../data/constants';
/*
 * internal note schema
 */
const InternalNoteSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  contentType: field({
    type: String,
    enum: COC_CONTENT_TYPES.ALL,
  }),
  contentTypeId: field({ type: String }),
  content: field({
    type: String,
  }),
  createdUserId: field({
    type: String,
  }),
  createdDate: field({
    type: Date,
  }),
});

class InternalNote {
  /* Create new internalNote
   *
   * @param {String} contentType form, customer, company
   * @param {String} contentTypeId when contentType is form, it will be
   * formId
   *
   * @return {Promise} newly created internalNote object
   */
  static async createInternalNote({ contentType, contentTypeId, ...fields }, user) {
    return this.create({
      contentType,
      contentTypeId,
      createdUserId: user._id,
      createdDate: new Date(),
      ...fields,
    });
  }

  /*
   * Update internalNote
   * @param {String} _id - internalNote id to update
   * @param {Object} doc - internalNote values to update
   * @return {Promise} Updated internalNote object
   */
  static async updateInternalNote(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Remove internalNote
   * @param {String} _id - internalNote id to remove
   * @return {Promise}
   */
  static async removeInternalNote(_id) {
    const internalNoteObj = await this.findOne({ _id });

    if (!internalNoteObj) throw new Error(`InternalNote not found with id ${_id}`);

    return internalNoteObj.remove();
  }

  /**
   * Transfers customers' internal notes to another customer
   * @param {String} newCustomerId - Customer id to set
   * @param {String[]} customerIds - Old customer ids to change
   * @return {Promise} Updated list of internal notes of new customer
   */
  static async changeCustomer(newCustomerId, customerIds) {
    for (let customerId of customerIds) {
      // Updating every internal notes of customer
      await this.updateMany(
        {
          contentType: COC_CONTENT_TYPES.CUSTOMER,
          contentTypeId: customerId,
        },
        { contentTypeId: newCustomerId },
      );
    }

    // Returning updated list of internal notes of new customer
    return this.find({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: newCustomerId,
    });
  }

  /**
   * Removing customers' internal notes
   * @param {String} customerId - Customer id of customer to remove
   * @return {Promise} Result
   */
  static async removeCustomerInternalNotes(customerId) {
    // Removing every internal ntoes of customer
    return this.remove({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customerId,
    });
  }

  /**
   * Removing companies' internal notes
   * @param {String} companyId - Company id of company to remove
   * @return {Promise} Result
   */
  static async removeCompanyInternalNotes(companyId) {
    // Removing every internal notes of company
    return this.remove({
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: companyId,
    });
  }

  /**
   * Transfers companies' internal notes to another company
   * @param {String} newCompanyId - Company ids to set
   * @param {String[]} OldCompanyIds - Old company ids to change
   * @return {Promise} Updated list of internal notes of new company
   */
  static async changeCompany(newCompanyId, oldCompanyIds) {
    for (let companyId of oldCompanyIds) {
      // Updating every internal notes of company
      await this.updateMany(
        {
          contentType: COC_CONTENT_TYPES.COMPANY,
          contentTypeId: companyId,
        },
        { contentTypeId: newCompanyId },
      );
    }

    // Returning updated list of internal notes of new company
    return this.find({
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: newCompanyId,
    });
  }
}

InternalNoteSchema.loadClass(InternalNote);

const InternalNotes = mongoose.model('internal_notes', InternalNoteSchema);

export default InternalNotes;
