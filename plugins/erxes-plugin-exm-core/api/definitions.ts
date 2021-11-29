const attachmentSchema = {
  name: { type: String },
  url: { type: String },
  type: { type: String },
  size: { type: Number, optional: true }
};

export interface IExm {
  name: string;
}

export interface IExmDocument extends IExm, Document {
  _id: string;
  createdBy: string;
  createdAt: Date;
}

const featureSchema = {
  _id: { type: String },
  icon: { type: String },
  name: { type: String },
  description: { type: String },
  contentType: { type: String },
  contentId: { type: String },
  subContentId: { type: String }
};

const welcomeContentSchema = {
  _id: { type: String },
  title: { type: String },
  image: { type: Object },
  content: { type: String }
};

const appearanceSchema = {
  primaryColor: { type: String },
  secondaryColor: { type: String }
};

const scoringConfigSchema = {
  action: { type: String },
  earnOrSpend: { type: String, enum: ['earn', 'spend'] },
  amount: { type: String }
};

// Mongoose schemas =======================

export const exmSchema = {
  _id: { pkey: true },
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description' },
  features: { type: [featureSchema] },
  logo: { type: Object },
  welcomeContent: { type: [welcomeContentSchema] },
  appearance: { type: appearanceSchema },
  scoringConfig: { type: [scoringConfigSchema] },
  createdBy: { type: String, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' }
};
