import { Model, model } from 'mongoose';
import { COC_CONTENT_TYPES } from './definitions/constants';
import { IInternalNote, IInternalNoteDocument, internalNoteSchema } from './definitions/internalNotes';
import { IUserDocument } from './definitions/users';

interface IInternalNoteModel extends Model<IInternalNoteDocument> {
  createInternalNote(
    { contentType, contentTypeId, ...fields }: IInternalNote,
    user: IUserDocument,
  ): Promise<IInternalNoteDocument>;

  updateInternalNote(_id: string, doc: IInternalNote): Promise<IInternalNoteDocument>;

  removeInternalNote(_id: string): void;

  changeCustomer(newCustomerId: string, customerIds: string[]): Promise<IInternalNoteDocument[]>;

  removeCustomerInternalNotes(customerId: string): void;
  removeCompanyInternalNotes(companyId: string): void;

  changeCompany(newCompanyId: string, oldCompanyIds: string[]): Promise<IInternalNoteDocument[]>;
}

class InternalNote {
  /*
   * Create new internalNote
   */
  public static async createInternalNote(
    { contentType, contentTypeId, ...fields }: IInternalNote,
    user: IUserDocument,
  ) {
    return InternalNotes.create({
      contentType,
      contentTypeId,
      createdUserId: user._id,
      createdDate: new Date(),
      ...fields,
    });
  }

  /*
   * Update internalNote
   */
  public static async updateInternalNote(_id: string, doc: IInternalNote) {
    await InternalNotes.update({ _id }, { $set: doc });

    return InternalNotes.findOne({ _id });
  }

  /*
   * Remove internalNote
   */
  public static async removeInternalNote(_id: string) {
    const internalNoteObj = await InternalNotes.findOne({ _id });

    if (!internalNoteObj) {
      throw new Error(`InternalNote not found with id ${_id}`);
    }

    return internalNoteObj.remove();
  }

  /**
   * Transfers customers' internal notes to another customer
   */
  public static async changeCustomer(newCustomerId: string, customerIds: string[]) {
    for (const customerId of customerIds) {
      // Updating every internal notes of customer
      await InternalNotes.updateMany(
        {
          contentType: COC_CONTENT_TYPES.CUSTOMER,
          contentTypeId: customerId,
        },
        { contentTypeId: newCustomerId },
      );
    }

    // Returning updated list of internal notes of new customer
    return InternalNotes.find({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: newCustomerId,
    });
  }

  /**
   * Removing customers' internal notes
   */
  public static async removeCustomerInternalNotes(customerId: string) {
    // Removing every internal ntoes of customer
    return InternalNotes.remove({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customerId,
    });
  }

  /**
   * Removing companies' internal notes
   */
  public static async removeCompanyInternalNotes(companyId: string) {
    // Removing every internal notes of company
    return InternalNotes.remove({
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: companyId,
    });
  }

  /**
   * Transfers companies' internal notes to another company
   */
  public static async changeCompany(newCompanyId: string, oldCompanyIds: string[]) {
    for (const companyId of oldCompanyIds) {
      // Updating every internal notes of company
      await InternalNotes.updateMany(
        {
          contentType: COC_CONTENT_TYPES.COMPANY,
          contentTypeId: companyId,
        },
        { contentTypeId: newCompanyId },
      );
    }

    // Returning updated list of internal notes of new company
    return InternalNotes.find({
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: newCompanyId,
    });
  }
}

internalNoteSchema.loadClass(InternalNote);

const InternalNotes = model<IInternalNoteDocument, IInternalNoteModel>('internal_notes', internalNoteSchema);

export default InternalNotes;
