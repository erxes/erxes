import { Document, Schema } from 'mongoose';
import { attachmentSchema } from './boards';
import { field } from './utils';

export interface IExm {
  name: string;
}

export interface IExmDocument extends IExm, Document {
  _id: string;
  createdBy: string;
  createdAt: Date;
}

const featureSchema = new Schema({
  _id: field({ pkey: true }),
  icon: field({ type: String }),
  name: field({ type: String }),
  description: field({ type: String }),
  contentType: field({ type: String }),
  contentId: field({ type: String }),
  subContentId: field({ type: String })
});

const welcomeContentSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  image: field({ type: attachmentSchema }),
  content: field({ type: String })
});

const appearanceSchema = new Schema(
  {
    primaryColor: field({ type: String }),
    secondaryColor: field({ type: String })
  },
  {
    _id: false
  }
);

const scoringConfigSchema = new Schema({
  action: field({ type: String }),
  earnOrSpend: field({ type: String, enum: ['earn', 'spend'] }),
  amount: field({ type: String })
});

// Mongoose schemas =======================

export const exmSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  features: field({ type: [featureSchema] }),
  logo: field({ type: attachmentSchema }),
  welcomeContent: field({ type: [welcomeContentSchema] }),
  appearance: field({ type: appearanceSchema }),
  scoringConfig: field({ type: [scoringConfigSchema] }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' })
});
