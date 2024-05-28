import { Model } from 'mongoose';

import { Document, Schema } from 'mongoose';

interface IReport {
  createdAt: Date;
  createdUserId: string;

  type: string;
  name: string;
  content: string;
  companyId: string;
}

export interface IReportDocument extends IReport, Document {
  _id: string;
}

const reportSchema = new Schema({
  createdAt: { type: Date },
  createdUserId: { type: String },

  type: { type: String },
  name: { type: String },
  code: { type: String },
  content: { type: String },
  companyId: { type: String }
});

export interface IReportModel extends Model<IReportDocument> {
  saveReport({ _id, doc }): void;
}

export const loadReportClass = models => {
  class Report {
    /**
     * Marks reports as read
     */
    public static async saveReport({ _id, doc }) {
      if (_id) {
        await models.Reports.update({ _id }, { $set: doc });
        return models.Reports.findOne({ _id });
      }

      doc.createdAt = new Date();

      return models.Reports.create(doc);
    }
  }

  reportSchema.loadClass(Report);

  return reportSchema;
};
