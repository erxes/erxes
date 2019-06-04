import { Document, Model, model, Schema } from 'mongoose';

export interface IFacebookData {
  accountId?: string;
  pageIds: string[];
}

export interface IFacebookDataDocument extends IFacebookData, Document {}

const facebookSchema = new Schema(
  {
    accountId: {
      type: String,
    },
    pageIds: {
      type: [String],
    },
  },
  { _id: false },
);

export interface IIntegration {
  kind?: string;
  facebookData?: IFacebookData;
}

export interface IIntegrationDocument extends IIntegration, Document {
  _id: string;
  facebookData?: IFacebookDataDocument;
}

// schema for integration document
export const integrationSchema = new Schema({
  kind: String,
  facebookData: facebookSchema,
});

export interface IIntegrationModel extends Model<IIntegrationDocument> {}

export const loadClass = () => {
  class Integration {}

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

loadClass();

// tslint:disable-next-line
const Integrations = model<IIntegrationDocument, IIntegrationModel>('integrations', integrationSchema);

export default Integrations;
