import { Document, Schema } from 'mongoose';

export interface IInstallationLog {
  date: Date;
  pluginName: string;
  message: string;
}

export interface IInstallationLogDocument extends IInstallationLog, Document {
  _id: string;
}

export const installationLogSchema = new Schema({
  date: { type: Date },
  pluginName: { type: String },
  message: { type: String }
});
