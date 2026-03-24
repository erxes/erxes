import { Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { internalNoteSchema } from '~/modules/internalNote/db/definitions/internalNote';
import {
  IInternalNote,
  IInternalNoteDocument,
} from '~/modules/internalNote/types';

export interface IInternalNoteModel extends Model<IInternalNoteDocument> {
  getInternalNote(_id: string): Promise<IInternalNoteDocument>;
  createInternalNote(
    { contentType, contentTypeId, ...fields }: IInternalNote,
    user,
  ): Promise<IInternalNoteDocument>;
  updateInternalNote(
    _id: string,
    doc: IInternalNote,
  ): Promise<IInternalNoteDocument>;
  removeInternalNote(_id: string): Promise<IInternalNoteDocument>;
  removeInternalNotes(
    contentType: string,
    contentTypeIds: string[],
  ): Promise<{ n: number; ok: number }>;
}

export const loadInternalNoteClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class InternalNote {
    public static async getInternalNote(_id: string) {
      const internalNote = await models.InternalNotes.findOne({ _id }).lean();

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
      user,
    ) {
      const note = await models.InternalNotes.create({
        contentType,
        contentTypeId,
        createdUserId: user._id,
        ...fields,
      });
      sendDbEventLog({
        action: 'create',
        docId: note._id,
        currentDocument: note.toObject(),
      });
      createActivityLog({
        activityType: 'create',
        target: {
          _id: note._id,
        },
        action: {
          type: 'create',
          description: 'Note created',
        },
        changes: {},
      });
      return note;
    }

    /*
     * Update internalNote
     */
    public static async updateInternalNote(_id: string, doc: IInternalNote) {
      const oldNote = await models.InternalNotes.findOne({ _id });
      const updatedNote = await models.InternalNotes.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );
      if (updatedNote && oldNote) {
        sendDbEventLog({
          action: 'update',
          docId: updatedNote._id,
          currentDocument: updatedNote.toObject(),
          prevDocument: oldNote.toObject(),
        });
      }
      return updatedNote;
    }

    /*
     * Remove internalNote
     */
    public static async removeInternalNote(_id: string) {
      const internalNoteObj = await models.InternalNotes.findOneAndDelete({
        _id,
      });

      if (!internalNoteObj) {
        throw new Error(`InternalNote not found with id ${_id}`);
      }

      sendDbEventLog({
        action: 'delete',
        docId: internalNoteObj._id,
      });

      return internalNoteObj;
    }

    /**
     * Remove internal notes
     */
    public static async removeInternalNotes(
      contentType: string,
      contentTypeIds: string[],
    ) {
      // Removing every internal notes of contentType
      const toDelete = await models.InternalNotes.find({
        contentType,
        contentTypeId: { $in: contentTypeIds },
      });
      const result = await models.InternalNotes.deleteMany({
        contentType,
        contentTypeId: { $in: contentTypeIds },
      });
      if (toDelete.length > 0) {
        sendDbEventLog({
          action: 'deleteMany',
          docIds: toDelete.map((d) => d._id),
        });
      }
      return result;
    }
  }

  internalNoteSchema.loadClass(InternalNote);

  return internalNoteSchema;
};
