import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { entrySchema, IEntry, IEntryDocument } from './definitions/entries';

export interface IEntryModel extends Model<IEntryDocument> {
  createEntry(doc: IEntry, userId: string): Promise<IEntryDocument>;
  updateEntry(
    _id: string,
    doc: IEntry,
    userId: string
  ): Promise<IEntryDocument>;
  removeEntry(_id: string): void;
}

export const loadEntryClass = (models: IModels) => {
  class Entry {
    public static async createEntry(doc: IEntry, userId: string) {
      return models.Entries.create({
        ...doc,
        createdAt: new Date(),
        createdBy: userId
      });
    }

    public static async updateEntry(_id: string, doc: IEntry, userId: string) {
      await models.Entries.updateOne(
        { _id },
        { $set: { ...doc, modifiedBy: userId, modifiedAt: new Date() } }
      );

      return models.Entries.findOne({ _id });
    }

    public static async removeEntry(_id) {
      return models.Entries.deleteOne({ _id });
    }
  }

  entrySchema.loadClass(Entry);

  return entrySchema;
};
