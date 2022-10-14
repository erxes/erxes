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

export interface ITraining {
  date: Date;
  file: string;
}

export interface ITrainingDocument extends ITraining, Document {}

export const trainingSchema = new Schema({
  date: Date,
  file: String
});

export interface ITrainingModel extends Model<ITrainingDocument> {}

export const loadTrainingClass = models => {
  class Training {}

  trainingSchema.loadClass(Training);

  return trainingSchema;
};
