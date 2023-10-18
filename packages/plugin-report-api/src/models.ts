import { model } from 'mongoose';
import { Schema } from 'mongoose';
import * as _ from 'underscore';

export const reportSchema = new Schema({
  name: String
});

export const loadReportClass = () => {
  class Report {
    // create
    public static async createReport(doc) {
      return Reports.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  reportSchema.loadClass(Report);

  return reportSchema;
};

export const Reports = model<any, any>('reports', loadReportClass());
