import { Model, model } from 'mongoose';
import { ACTIVITY_CONTENT_TYPES } from './definitions/constants';
import {
  IInternalNote,
  IInternalNoteDocument,
  internalNoteSchema
} from './definitions/internalNotes';
import { IUserDocument } from './definitions/users';

export interface IInternalNoteModel extends Model<IInternalNoteDocument> {
  getInternalNote(_id: string): Promise<IInternalNoteDocument>;
  createInternalNote(
    { contentType, contentTypeId, ...fields }: IInternalNote,
    user: IUserDocument
  ): Promise<IInternalNoteDocument>;

  updateInternalNote(
    _id: string,
    doc: IInternalNote
  ): Promise<IInternalNoteDocument>;

  removeInternalNote(_id: string): void;

  changeCustomer(
    newCustomerId: string,
    customerIds: string[]
  ): Promise<IInternalNoteDocument[]>;

  removeCustomersInternalNotes(
    customerIds: string[]
  ): Promise<{ n: number; ok: number }>;
  removeCompaniesInternalNotes(companyIds: string[]): void;

  changeCompany(
    newCompanyId: string,
    oldCompanyIds: string[]
  ): Promise<IInternalNoteDocument[]>;
}

export const loadClass = () => {
  class InternalNote {
    public static async getInternalNote(_id: string) {
      const internalNote = await InternalNotes.findOne({ _id });

      if (!internalNote) {
        throw new Error('Internal note not found');
      }

      return internalNote;
    }
    /*
     * Create new internalNote
     */
    public static async createInternalNote(
      { contentType, contentTypeId, ...fields }: IInternalNote,
      user: IUserDocument
    ) {
      const internalNote = await InternalNotes.create({
        contentType,
        contentTypeId,
        createdUserId: user._id,
        createdAt: Date.now(),
        ...fields
      });

      return internalNote;
    }

    /*
     * Update internalNote
     */
    public static async updateInternalNote(_id: string, doc: IInternalNote) {
      await InternalNotes.updateOne({ _id }, { $set: doc });

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
    public static async changeCustomer(
      newCustomerId: string,
      customerIds: string[]
    ) {
      // Updating every internal notes of customer
      await InternalNotes.updateMany(
        {
          contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
          contentTypeId: { $in: customerIds || [] }
        },
        { contentTypeId: newCustomerId }
      );

      // Returning updated list of internal notes of new customer
      return InternalNotes.find({
        contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
        contentTypeId: newCustomerId
      });
    }

    /**
     * Remove customers' internal notes
     */
    public static async removeCustomersInternalNotes(customerIds: string) {
      // Removing every internal notes of customer
      return InternalNotes.deleteMany({
        contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
        contentTypeId: { $in: customerIds }
      });
    }

    /**
     * Remove companies' internal notes
     */
    public static async removeCompaniesInternalNotes(companyIds: string[]) {
      // Removing every internal notes of company
      return InternalNotes.deleteMany({
        contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
        contentTypeId: { $in: companyIds }
      });
    }

    /**
     * Transfers companies' internal notes to another company
     */
    public static async changeCompany(
      newCompanyId: string,
      oldCompanyIds: string[]
    ) {
      // Updating every internal notes of company
      await InternalNotes.updateMany(
        {
          contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
          contentTypeId: { $in: oldCompanyIds || [] }
        },
        { contentTypeId: newCompanyId }
      );

      // Returning updated list of internal notes of new company
      return InternalNotes.find({
        contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
        contentTypeId: newCompanyId
      });
    }
  }

  internalNoteSchema.loadClass(InternalNote);

  return internalNoteSchema;
};

loadClass();

// tslint:disable-next-line
const InternalNotes = model<IInternalNoteDocument, IInternalNoteModel>(
  'internal_notes',
  internalNoteSchema
);

export default InternalNotes;
