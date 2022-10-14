import { Document, Model, Schema } from 'mongoose';

export interface IConfig {
  apiKey: string;
  projectName: string;
  projectId: string;
  token: string;
}

export interface IConfigDocument extends IConfig, Document {}

export const configSchema = new Schema({
  apiKey: String,
  projectName: String,
  projectId: String,
  token: String
});

export interface IConfigModel extends Model<IConfigDocument> {}

export const loadConfigClass = models => {
  class Config {}

  configSchema.loadClass(Config);

  return configSchema;
};
