import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';

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
    fieldCode: { type: String },
    value: { type: 'Mixed' }
  },
  { _id: false }
);

export const entrySchema = new Schema({
  contentTypeId: { type: String },
  values: { type: [valueSchema] }
});

export interface IEntryModel extends Model<IEntryDocument> {
  createEntry(doc: IEntry): Promise<IEntryDocument>;
  updateEntry(_id: string, doc: IEntry): Promise<IEntryDocument>;
}

class Entry {
  public static async createEntry(doc) {
    return Entries.create(doc);
  }

  public static async updateEntry(_id: string, doc) {
    return Entries.updateOne({ _id }, { $set: doc });
  }

  public static async remoteEntry(_id) {
    return Entries.deleteOne({ _id });
  }
}

entrySchema.loadClass(Entry);

const Entries = model<IEntryDocument, IEntryModel>(
  'webbuilder_entries',
  entrySchema
);

export { Entries };
