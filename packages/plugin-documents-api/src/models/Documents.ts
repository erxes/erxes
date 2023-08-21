import { Model } from 'mongoose';

import { Document, Schema } from 'mongoose';

interface IDocument {
  createdAt: Date;
  createdUserId: string;

  contentType: string;
  subType: string;
  name: string;
  content: string;
  replacer: string;
}

export interface IDocumentDocument extends IDocument, Document {
  _id: string;
}

const documentSchema = new Schema({
  createdAt: { type: Date },
  createdUserId: { type: String },

  contentType: { type: String },
  subType: { type: String, optional: true },
  name: { type: String },
  content: { type: String },
  replacer: { type: String }
});

export interface IDocumentModel extends Model<IDocumentDocument> {
  saveDocument({ _id, doc }): void;
}

export const loadDocumentClass = models => {
  class Document {
    /**
     * Marks documents as read
     */
    public static async saveDocument({ _id, doc }) {
      if (_id) {
        await models.Documents.update({ _id }, { $set: doc });
        return models.Documents.findOne({ _id });
      }

      doc.createdAt = new Date();

      return models.Documents.create(doc);
    }
  }

  documentSchema.loadClass(Document);

  return documentSchema;
};
