import { Model, model } from 'mongoose';
import 'mongoose-type-email';
import { Accounts, ConversationMessages, Conversations, Customers, Forms } from '.';
import { KIND_CHOICES } from '../../data/constants';
import { graphRequest } from '../../trackers/facebookTracker';
import { sendPostRequest } from '../connection';
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

interface IIntegrationModel extends Model<IIntegrationDocument> {
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
    const prevEntry = await Integrations.findOne({
      twitterData: { $exists: true },
      'twitterData.info.id': twitterData.info.id,
    });

    // check duplication
    if (prevEntry) {
      throw new Error('Already added');
    }

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
    const { INTEGRATION_ENDPOINT_URL, FACEBOOK_APP_ID, DOMAIN } = process.env;

    if (!INTEGRATION_ENDPOINT_URL || !FACEBOOK_APP_ID || !DOMAIN) {
      throw new Error('Please configure endpoint');
    }

    const { pageIds, accountId } = facebookData;

    const fbAccount = await Accounts.findOne({ _id: accountId });

    if (!fbAccount) {
      throw new Error('Linked facebook account not found');
    }

    for (const pageId of pageIds) {
      const pageInfo: any = await graphRequest.get(`${pageId}?fields=id,access_token`, fbAccount.token);

      const pageToken = pageInfo.access_token;

      const res: any = await graphRequest.post(`${pageId}/subscribed_apps`, pageToken, {
        subscribed_fields: ['conversations', 'messages', 'feed'],
      });

      if (res.success !== true) {
        throw new Error('Couldnt subscribe page');
      }

      await sendPostRequest(`${INTEGRATION_ENDPOINT_URL}/service/facebook/${FACEBOOK_APP_ID}/webhook-callback`, {
        endPoint: DOMAIN,
        pageId: pageInfo.id,
      });
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
    await Integrations.update({ _id }, { $set: doc }, { runValidators: true });

    return Integrations.findOne({ _id });
  }

  /**
   * Save messenger appearance data
   */
  public static async saveMessengerAppearanceData(_id: string, { color, wallpaper, logo }: IUiOptions) {
    await Integrations.update({ _id }, { $set: { uiOptions: { color, wallpaper, logo } } }, { runValdatiors: true });

    return Integrations.findOne({ _id });
  }

  /**
   * Saves messenger data to integration document
   */
  public static async saveMessengerConfigs(_id: string, messengerData: IMessengerData) {
    await Integrations.update({ _id }, { $set: { messengerData } });
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

    await Integrations.update({ _id }, { $set: doc }, { runValidators: true });

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

    await ConversationMessages.remove({
      conversationId: { $in: conversationIds },
    });
    await Conversations.remove({ integrationId: _id });

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

    return Integrations.remove({ _id });
  }

  public static async createGmailIntegration({ name, brandId, gmailData }: IGmailParams) {
    const { email } = gmailData;

    const prevEntry = await Integrations.findOne({
      gmailData: { $exists: true },
      'gmailData.email': email,
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

const Integrations = model<IIntegrationDocument, IIntegrationModel>('integrations', integrationSchema);

export default Integrations;
