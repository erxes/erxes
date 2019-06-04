import { Document, Model, Schema } from 'mongoose';
import { integrationsConnection } from '../connection';

export interface IIntegration {
  kind: string;
  accountId: string;
  erxesApiId: string;
  facebookPageIds?: string[];
}

export interface IIntegrationDocument extends IIntegration, Document {}

// schema for integration document
export const integrationSchema = new Schema({
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
const Integrations = integrationsConnection.model<IIntegrationDocument, IIntegrationModel>(
  'integrations',
  integrationSchema,
);

export default Integrations;
