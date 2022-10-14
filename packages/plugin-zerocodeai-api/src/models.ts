import { Document, Model, Schema } from 'mongoose';

export interface IConfig {
  apiKey: string;
}

export interface IConfigDocument extends IConfig, Document {}

export const configSchema = new Schema({
  apiKey: String
});

export interface IConfigModel extends Model<IConfigDocument> {}

export const loadConfigClass = models => {
  class Config {}

  configSchema.loadClass(Config);

  return configSchema;
};
