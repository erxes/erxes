import { Model, model } from 'mongoose';
import { getUniqueValue } from '../factories';
import { WEBHOOK_STATUS } from './definitions/constants';
import { IWebhook, IWebhookDocument, webhookSchema } from './definitions/webhook';

export interface IWebhookModel extends Model<IWebhookDocument> {
  getWebHook(_id: string): Promise<IWebhookDocument>;
  getWebHooks(): Promise<IWebhookDocument[]>;
  createWebhook(doc: IWebhook): Promise<IWebhookDocument>;
  updateWebhook(_id: string, doc: IWebhook): Promise<IWebhookDocument>;
  updateStatus(_id: string, status: string): Promise<IWebhookDocument>;
  removeWebhooks(_id: string): void;
}

export const loadClass = () => {
  class Webhook {
    /*
     * Get a Webhook
     */
    public static async getWebHook(_id: string) {
      const webhook = await Webhooks.findOne({ _id });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      return webhook;
    }

    public static async getWebHooks() {
      return Webhooks.find({});
    }

    /**
     * Create webhook
     */
    public static async createWebhook(doc: IWebhook) {
      if (!doc.url.includes('https')) {
        throw new Error('Url is not valid. Enter valid url with ssl cerfiticate');
      }

      const modifiedDoc: any = { ...doc };
      modifiedDoc.token = await getUniqueValue(Webhooks, 'token');
      modifiedDoc.status = WEBHOOK_STATUS.UNAVAILABLE;

      return Webhooks.create(modifiedDoc);
    }

    public static async updateWebhook(_id: string, doc: IWebhook) {
      if (!doc.url.includes('https')) {
        throw new Error('Url is not valid. Enter valid url with ssl cerfiticate');
      }

      await Webhooks.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Webhooks.findOne({ _id });
    }

    public static async removeWebhooks(_id) {
      return Webhooks.deleteOne({ _id });
    }

    public static async updateStatus(_id: string, status: string) {
      await Webhooks.updateOne({ _id }, { $set: { status } }, { runValidators: true });

      return Webhooks.findOne({ _id });
    }
  }

  webhookSchema.loadClass(Webhook);

  return webhookSchema;
};

loadClass();

// tslint:disable-next-line
const Webhooks = model<IWebhookDocument, IWebhookModel>('webhooks', webhookSchema);

export default Webhooks;
