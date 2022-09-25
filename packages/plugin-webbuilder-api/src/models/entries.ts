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

  createdBy?: string;
  modifiedBy?: string;
}

export interface IEntryDocument extends IEntry, Document {
  _id: string;

  createdAt: Date;
  modifiedAt: Date;
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
  values: field({ type: [valueSchema], label: 'Values' }),

  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  modifiedBy: field({ type: String, optional: true, label: 'Modified by' }),

  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' })
});

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
