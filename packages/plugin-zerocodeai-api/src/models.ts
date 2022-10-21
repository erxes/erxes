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

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(): Promise<IConfigDocument>;
}

export const loadConfigClass = models => {
  class Config {
    public static async getConfig() {
      const config = await models.Configs.findOne({});

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }
  }

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

export interface IAnalysis {
  contentType: string;
  contentTypeId: string;
  sentiment: string;
}

export interface IAnalysisDocument extends IAnalysis, Document {}

export const analysisSchema = new Schema({
  contentType: String,
  contentTypeId: String,
  sentiment: String
});

export interface IAnalysisModel extends Model<IAnalysisDocument> {}

export const loadAnalysisClass = models => {
  class Analysis {}

  analysisSchema.loadClass(Analysis);

  return analysisSchema;
};
