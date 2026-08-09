import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { customerSchema } from '@/integrations/whatsapp/db/definitions/customers';
import { IWhatsappCustomerDocument } from '@/integrations/whatsapp/@types';

export interface IWhatsappCustomerModel
  extends Model<IWhatsappCustomerDocument> {
  getCustomer(selector: any): Promise<IWhatsappCustomerDocument>;
}

export const loadWhatsappCustomerClass = (models: IModels) => {
  class Customer {
    public static async getCustomer(selector: any) {
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
