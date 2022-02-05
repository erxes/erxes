import { Model, model } from 'mongoose';
import {
  IInternalNote,
  IInternalNoteDocument,
  internalNoteSchema
} from './definitions/internalNotes';

export interface IInternalNoteModel extends Model<IInternalNoteDocument> {
  getInternalNote(_id: string): Promise<IInternalNoteDocument>;

  createInternalNote(
    { contentType, contentTypeId, ...fields }: IInternalNote,
    user 
  ): Promise<IInternalNoteDocument>;

  updateInternalNote(
    _id: string,
    doc: IInternalNote
  ): Promise<IInternalNoteDocument>;

  removeInternalNote(_id: string): void;

  removeInternalNotes(
    contentType: string,
    contentTypeIds: string[]
  ): Promise<{ n: number; ok: number }>;
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
      user
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
     * Remove internal notes
     */
    public static async removeInternalNotes(
      contentType: string,
      contentTypeIds: string[]
    ) {
      // Removing every internal notes of contentType
      return InternalNotes.deleteMany({
        contentType,
        contentTypeId: { $in: contentTypeIds }
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