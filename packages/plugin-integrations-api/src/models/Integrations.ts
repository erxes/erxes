import { Document, Model, model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface IIntegration {
  kind: string;
  accountId: string;
  emailScope?: string;
  nylasToken?: string;
  nylasAccountId?: string;
  nylasBillingState?: string;
  erxesApiId: string;
  email: string;
  googleAccessToken?: string;
  phoneNumber: string;
  recordUrl: string;
  expiration?: string;
  gmailHistoryId?: string;
  chatfuelConfigs?: { [key: string]: string };
  telegramBotToken?: string;
  viberBotToken?: string;
  lineChannelId?: string;
  lineChannelSecret?: string;
  twilioSid?: string;
  twilioAuthToken?: string;
  twilioPhoneSid?: string;
  smoochDisplayName?: string;
  smoochIntegrationId?: string;
  whatsappinstanceId?: string;
  whatsappToken?: string;
  telnyxPhoneNumber?: string;
  telnyxProfileId?: string;
  healthStatus?: string;
  error?: string;
}

export interface IIntegrationDocument extends IIntegration, Document {}

// schema for integration document
export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  kind: String,
  accountId: String,
  erxesApiId: String,
  phoneNumber: field({
    type: String,
    label: 'CallPro phone number',
    optional: true
  }),
  recordUrl: field({
    type: String,
    label: 'CallPro record url',
    optional: true
  }),
  emailScope: String,
  googleAccessToken: field({
    type: String,
    optional: true
  }),
  nylasToken: String,
  nylasAccountId: String,
  nylasBillingState: String,
  email: String,
  expiration: String,
  gmailHistoryId: String,
  chatfuelConfigs: field({
    type: Object,
    default: {}
  }),
  telegramBotToken: String,
  viberBotToken: String,
  lineChannelId: String,
  lineChannelSecret: String,
  twilioSid: String,
  twilioAuthToken: String,
  twilioPhoneSid: String,
  smoochDisplayName: String,
  smoochIntegrationId: String,
  whatsappinstanceId: String,
  whatsappToken: String,
  telnyxPhoneNumber: field({ type: String, label: 'Telnyx phone number' }),
  telnyxProfileId: field({
    type: String,
    label: 'Telnyx messaging profile id'
  }),
  healthStatus: String,
  error: String
});

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(selector): Promise<IIntegrationDocument>;
}

export const loadIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.Integrations.findOne(selector);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
