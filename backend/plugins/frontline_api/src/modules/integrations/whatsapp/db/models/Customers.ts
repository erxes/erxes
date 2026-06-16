import { Model } from 'mongoose';
import { customerSchema } from '@/integrations/whatsapp/db/definitions/customers';
import { IWhatsappCustomerDocument } from '@/integrations/whatsapp/@types/customers';

export type IWhatsappCustomerModel = Model<IWhatsappCustomerDocument>;

export const loadWhatsappCustomerClass = () => {
  class Customer {}

  customerSchema.loadClass(Customer);

  return customerSchema;
};
