import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { customerSchema } from '@/integrations/whatsapp/db/definitions/customers';
import { IWhatsappCustomerDocument } from '@/integrations/whatsapp/@types';

export interface IWhatsappCustomerModel
  extends Model<IWhatsappCustomerDocument> {
  getCustomer(
    selector: FilterQuery<IWhatsappCustomerDocument>,
  ): Promise<IWhatsappCustomerDocument>;
}

/** Builds the WhatsApp customer model class bound to this tenant's models. */
export const loadWhatsappCustomerClass = (models: IModels) => {
  /** A WhatsApp contact, keyed by the `wa_id` Meta sends for the sender. */
  class Customer {
    /**
     * Finds one customer, throwing when there is none.
     *
     * Throws rather than returning null because every caller here treats a
     * missing customer as a broken invariant — the row is created on first
     * inbound message, so its absence means the conversation is orphaned.
     */
    public static async getCustomer(
      selector: FilterQuery<IWhatsappCustomerDocument>,
    ) {
      const customer = await models.WhatsappCustomers.findOne(selector);

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
