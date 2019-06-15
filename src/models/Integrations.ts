import { Document, Model, model, Schema } from 'mongoose';
import { field } from './utils';

export interface IIntegration {
  kind: string;
  accountId: string;
  erxesApiId: string;
  facebookPageIds?: string[];
}

export interface IIntegrationDocument extends IIntegration, Document {}

// schema for integration document
export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  kind: String,
  accountId: String,
  erxesApiId: String,
  facebookPageIds: [String],
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
