import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from '@erxes/api-utils/src/definitions/utils';
import { sendCoreMessage } from '../messageBroker';

export interface IExm {
  name: string;
}

export interface IExmDocument extends IExm, Document {
  _id: string;
}

const featureSchema = new Schema({
  _id: { type: String },
  icon: { type: String },
  name: { type: String },
  description: { type: String },
  contentType: { type: String },
  contentId: { type: String },
  subContentId: { type: String }
});

const welcomeContentSchema = new Schema({
  _id: { type: String },
  title: { type: String },
  image: { type: Object },
  content: { type: String }
});

const appearanceSchema = new Schema(
  {
    primaryColor: { type: String },
    secondaryColor: { type: String }
  },
  { _id: false }
);

const scoringConfigSchema = new Schema(
  {
    action: { type: String },
    score: { type: String }
  },
  { _id: false }
);

// Mongoose schemas =======================

export const exmSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description' },
  features: { type: [featureSchema] },
  logo: { type: Object },
  welcomeContent: { type: [welcomeContentSchema] },
  appearance: { type: appearanceSchema },
  scoringConfig: { type: [scoringConfigSchema] },
  createdBy: { type: String, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' }
});

export interface IExmModel extends Model<IExmDocument> {
  getExm(_id: string): IExmDocument;
  createExm(doc: IExm, user: any): IExmDocument;
  updateExm(_id: string, doc: IExm): IExmDocument;
  removeExm(_id: string): IExmDocument;
  useScoring(user: any, action: string): IExmDocument;
}

export const loadExmClass = (models: IModels, subdomain: string) => {
  class Exm {
    public static async getExm(_id: string) {
      const exm = await models.Exms.findOne({ _id });

      if (!exm) {
        throw new Error('Exm not found');
      }

      return exm;
    }

    public static async createExm(doc: IExm, user: any) {
      const exm = await models.Exms.create({
        createdBy: user._id,
        createdAt: new Date(),
        ...doc
      });

      return exm;
    }

    /*
     * Update exm
     */
    public static async updateExm(_id: string, doc: IExm) {
      await models.Exms.updateOne({ _id }, { $set: doc });

      return models.Exms.findOne({ _id });
    }

    /*
     * Remove exm
     */
    public static async removeExm(_id: string) {
      const exmObj = await models.Exms.getExm(_id);

      return exmObj.remove();
    }

    public static async useScoring(user, action) {
      const exmObj = await models.Exms.findOne().lean();

      const scoringConfig = (exmObj.scoringConfig || []).find(
        config => config.action === action
      ) || { score: 0 };

      const score = scoringConfig.score || 0;

      await sendCoreMessage({
        subdomain,
        action: 'users.updateOne',
        data: {
          selector: {
            _id: user._id
          },
          modifier: {
            $inc: { score }
          }
        },
        isRPC: true
      });

      return score;
    }
  }

  exmSchema.loadClass(Exm);

  return exmSchema;
};
