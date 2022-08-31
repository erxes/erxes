import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface IEntryValue {
  fieldCode: string;
  value: any;
}

export interface IEntry {
  contentTypeId: string;
  values: IEntryValue[];
}

export interface IEntryDocument extends IEntry, Document {
  _id: string;
}

export const valueSchema = new Schema(
  {
    fieldCode: field({ type: String, label: 'Field code' }),
    value: field({ type: 'Mixed', label: 'Value' })
  },
  { _id: false }
);

export const entrySchema = new Schema({
  contentTypeId: field({ type: String, label: 'Content type' }),
  values: field({ type: [valueSchema], label: 'Values' })
});

export interface IEntryModel extends Model<IEntryDocument> {
  createEntry(doc: IEntry): Promise<IEntryDocument>;
  updateEntry(_id: string, doc: IEntry): Promise<IEntryDocument>;
}

export const loadEntryClass = (models: IModels) => {
  class Entry {
    public static async createEntry(doc) {
      return models.Entries.create(doc);
    }

    public static async updateEntry(_id: string, doc) {
      return models.Entries.updateOne({ _id }, { $set: doc });
    }

    public static async remoteEntry(_id) {
      return models.Entries.deleteOne({ _id });
    }
  }

  entrySchema.loadClass(Entry);

  return entrySchema;
};
