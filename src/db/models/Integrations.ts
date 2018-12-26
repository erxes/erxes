import { Model, model } from 'mongoose';
import 'mongoose-type-email';
import { Accounts, ConversationMessages, Conversations, Customers, Forms } from '.';
import { KIND_CHOICES } from '../../data/constants';
import { getPageInfo, subscribePage } from '../../trackers/facebookTracker';
import {
  IFacebookData,
  IFormData,
  IGmailData,
  IIntegration,
  IIntegrationDocument,
  IMessengerData,
  integrationSchema,
  ITwitterData,
  IUiOptions,
} from './definitions/integrations';

export interface IMessengerIntegration {
  name: string;
  brandId: string;
  languageCode: string;
}

interface IGmailParams {
  name: string;
  brandId: string;
  gmailData: IGmailData;
}

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  generateFormDoc(mainDoc: IIntegration, formData: IFormData): IIntegration;
  createIntegration(doc: IIntegration): Promise<IIntegrationDocument>;
  createMessengerIntegration(doc: IIntegration): Promise<IIntegrationDocument>;

  createTwitterIntegration({
    name,
    brandId,
    twitterData,
  }: {
    name: string;
    brandId: string;
    twitterData: ITwitterData;
  }): Promise<IIntegrationDocument>;

  createFacebookIntegration({
    name,
    brandId,
    facebookData,
  }: {
    name: string;
    brandId: string;
    facebookData: IFacebookData;
  }): Promise<IIntegrationDocument>;

  createGmailIntegration(params: IGmailParams): Promise<IIntegrationDocument>;

  updateMessengerIntegration(_id: string, doc: IIntegration): Promise<IIntegrationDocument>;

  saveMessengerAppearanceData(_id: string, doc: IUiOptions): Promise<IIntegrationDocument>;

  saveMessengerConfigs(_id: string, messengerData: IMessengerData): Promise<IIntegrationDocument>;

  createFormIntegration(doc: IIntegration): Promise<IIntegrationDocument>;

  updateFormIntegration(_id: string, doc: IIntegration): Promise<IIntegrationDocument>;

  removeIntegration(_id: string): void;
}

export const loadClass = () => {
  class Integration {
    /**
     * Generate form integration data based on the given form data (formData)
     * and integration data (mainDoc)
     */
    public static generateFormDoc(mainDoc: IIntegration, formData: IFormData) {
      return {
        ...mainDoc,
        kind: KIND_CHOICES.FORM,
        formData,
      };
    }

    /**
     * Create an integration, intended as a private method
     */
    public static createIntegration(doc: IIntegration) {
      return Integrations.create(doc);
    }

    /**
     * Create a messenger kind integration
     */
    public static createMessengerIntegration(doc: IMessengerIntegration) {
      return this.createIntegration({
        ...doc,
        kind: KIND_CHOICES.MESSENGER,
      });
    }

    /**
     * Create twitter integration
     */
    public static async createTwitterIntegration({
      name,
      brandId,
      twitterData,
    }: {
      name: string;
      brandId: string;
      twitterData: ITwitterData;
    }) {
      return this.createIntegration({
        name,
        brandId,
        kind: KIND_CHOICES.TWITTER,
        twitterData,
      });
    }

    /**
     * Create facebook integration
     */
    public static async createFacebookIntegration({
      name,
      brandId,
      facebookData,
    }: {
      name: string;
      brandId: string;
      facebookData: IFacebookData;
    }) {
      const { FACEBOOK_APP_ID, DOMAIN } = process.env;

      if (!FACEBOOK_APP_ID || !DOMAIN) {
        throw new Error('Invalid configuration');
      }

      const { pageIds, accountId } = facebookData;

      const account = await Accounts.findOne({ _id: accountId });

      if (!account) {
        throw new Error('Account not found');
      }

      for (const pageId of pageIds) {
        const pageInfo = await getPageInfo(pageId, account.token);

        const pageToken = pageInfo.access_token;

        const res = await subscribePage(pageId, pageToken);

        if (res.success !== true) {
          throw new Error('Couldnt subscribe page');
        }
      }

      return this.createIntegration({
        name,
        brandId,
        kind: KIND_CHOICES.FACEBOOK,
        facebookData,
      });
    }

    /**
     * Update messenger integration document
     */
    public static async updateMessengerIntegration(_id: string, doc: IMessengerIntegration) {
      await Integrations.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Integrations.findOne({ _id });
    }

    /**
     * Save messenger appearance data
     */
    public static async saveMessengerAppearanceData(_id: string, { color, wallpaper, logo }: IUiOptions) {
      await Integrations.updateOne(
        { _id },
        { $set: { uiOptions: { color, wallpaper, logo } } },
        { runValdatiors: true },
      );

      return Integrations.findOne({ _id });
    }

    /**
     * Saves messenger data to integration document
     */
    public static async saveMessengerConfigs(_id: string, messengerData: IMessengerData) {
      await Integrations.updateOne({ _id }, { $set: { messengerData } });
      return Integrations.findOne({ _id });
    }

    /**
     * Create a form kind integration
     */
    public static createFormIntegration({ formData = {}, ...mainDoc }: IIntegration) {
      const doc = this.generateFormDoc({ ...mainDoc }, formData);

      if (Object.keys(formData || {}).length === 0) {
        throw new Error('formData must be supplied');
      }

      return Integrations.create(doc);
    }

    /**
     * Update form integration
     */
    public static async updateFormIntegration(_id: string, { formData = {}, ...mainDoc }: IIntegration) {
      const doc = this.generateFormDoc(mainDoc, formData);

      await Integrations.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Integrations.findOne({ _id });
    }

    /**
     * Remove integration in addition with its messages, conversations, customers
     */
    public static async removeIntegration(_id: string) {
      const integration = await Integrations.findOne({ _id });

      if (!integration) {
        throw new Error('Integration not found');
      }

      // remove conversations =================
      const conversations = await Conversations.find({ integrationId: _id }, { _id: true });
      const conversationIds = conversations.map(conv => conv._id);

      await ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds },
      });
      await Conversations.deleteMany({ integrationId: _id });

      // Remove customers ==================
      const customers = await Customers.find({ integrationId: _id });
      const customerIds = customers.map(cus => cus._id);

      for (const customerId of customerIds) {
        await Customers.removeCustomer(customerId);
      }

      // Remove form & fields
      if (integration.formId) {
        await Forms.removeForm(integration.formId);
      }

      return Integrations.deleteMany({ _id });
    }

    public static async createGmailIntegration({ name, brandId, gmailData }: IGmailParams) {
      const prevEntry = await Integrations.findOne({
        gmailData: { $exists: true },
        'gmailData.email': gmailData.email,
      });

      if (prevEntry) {
        return prevEntry;
      }

      return this.createIntegration({
        name,
        brandId,
        kind: KIND_CHOICES.GMAIL,
        gmailData,
      });
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

loadClass();

// tslint:disable-next-line
const Integrations = model<IIntegrationDocument, IIntegrationModel>('integrations', integrationSchema);

export default Integrations;
