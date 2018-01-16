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
   * @param {String} _id internalNote id to update
   * @param {Object} doc internalNote values to update
   * @return {Promise} updated internalNote object
   */
  static async updateInternalNote(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Remove internalNote
   * @param {String} _id internalNote id to remove
   * @return {Promise}
   */
  static async removeInternalNote(_id) {
    const internalNoteObj = await this.findOne({ _id });

    if (!internalNoteObj) throw new Error(`InternalNote not found with id ${_id}`);

    return internalNoteObj.remove();
  }

  /**
   * Change internal note to a new customer
   * @param {String} newCustomerId customer id to set
   * @param {string[]} customerIds old customer ids to chnge
   * @return {Promise} updated internal notes of new customer
   */
  static async changeCustomer(newCustomerId, customerIds) {
    for (let customerId of customerIds) {
      await this.updateMany(
        {
          contentType: COC_CONTENT_TYPES.CUSTOMER,
          contentTypeId: customerId,
        },
        { contentTypeId: newCustomerId },
      );
    }

    return this.find({ contentType: COC_CONTENT_TYPES.CUSTOMER, contentTypeId: newCustomerId });
  }

  /**
   * Removing customer internal notes
   * @param {String} customerId - customer id to remove
   * @return {Promise} updated internal notes
   */
  static async removeCustomerInternalNotes(customerId) {
    // Removing customer internal notes
    return await this.remove({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customerId,
    });
  }

  /**
   * Removing company internal notes
   * @param {String} companyId - company id to remove
   * @return {Promise} updated internal notes
   */
  static async removeCompanyInternalNotes(companyId) {
    // Removing company internal notes
    return await this.remove({
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: companyId,
    });
  }

  /**
   * Changing company internal notes to another company
   * @param {String} newCompanyId - company ids to set
   * @param {string[]} OldCompanyIds - old company ids to change
   * @return {Promise} updated internal notes of new company
   */
  static async changeCompany(newCompanyId, OldCompanyIds) {
    for (let companyId of OldCompanyIds) {
      await this.updateMany(
        {
          contentType: COC_CONTENT_TYPES.COMPANY,
          contentTypeId: companyId,
        },
        { contentTypeId: newCompanyId },
      );
    }

    return this.find({ contentType: COC_CONTENT_TYPES.COMPANY, contentTypeId: newCompanyId });
  }
}

InternalNoteSchema.loadClass(InternalNote);

const InternalNotes = mongoose.model('internal_notes', InternalNoteSchema);

export default InternalNotes;
