import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import {
  ICallCustomer,
  ICustomerDocument,
} from '@/integrations/call/@types/customers';
import { customerSchema } from '@/integrations/call/db/definitions/customers';

export interface ICallCustomerModel extends Model<ICustomerDocument> {
  getCustomer(_id: string): Promise<ICustomerDocument>;
  addCustomer(doc: ICallCustomer): Promise<ICustomerDocument>;
  createCustomer(doc: ICallCustomer): Promise<ICustomerDocument>;
  updateCustomer(_id: string, doc: ICallCustomer): Promise<ICustomerDocument>;
  checkDuplication(
    primaryPhone: string | number,
    idsToExclude?: string[] | string,
  ): never;
  removeCustomers(customerIds: string[]): Promise<{ n: number; ok: number }>;
}

export const loadCallCustomerClass = (models: IModels) => {
  class Customer {
    public static async checkDuplication(
      primaryPhone: string | number,
      idsToExclude?: string[] | string,
    ) {
      const query = {} as any;
      let previousEntry;

      // Adding exclude operator to the query
      if (idsToExclude) {
        query._id = Array.isArray(idsToExclude)
          ? { $nin: idsToExclude }
          : { $ne: idsToExclude };
      }

      if (!primaryPhone) {
        return;
      }

      if (primaryPhone) {
        // check duplication from primaryPhone
        previousEntry = await models.CallCustomers.find({
          ...query,
          primaryPhone: primaryPhone,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated phone');
        }
      }
    }

    public static async getCustomer(_id: string) {
      const customer = await models.CallCustomers.findOne({ _id }).lean();

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }

    public static async createCustomer(
      doc: ICallCustomer,
    ): Promise<ICustomerDocument> {
      // Checking duplicated fields of customer
      try {
        await models.CallCustomers.checkDuplication(doc.primaryPhone);
      } catch (e) {
        throw new Error(e.message);
      }

      const customer = await models.CallCustomers.create({
        createdAt: new Date(),
        modifiedAt: new Date(),
        ...doc,
      });

      return models.CallCustomers.getCustomer(customer._id);
    }

    /*
     * Update customer
     */
    public static async updateCustomer(_id: string, doc: ICallCustomer) {
      // Checking duplicated fields of customer
      try {
        await models.CallCustomers.checkDuplication(doc.primaryPhone, _id);
      } catch (e) {
        throw new Error(e.message);
      }

      const oldCustomer = await models.CallCustomers.getCustomer(_id);

      await models.CallCustomers.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } },
      );

      return models.CallCustomers.findOne({ _id }).lean();
    }

    public static async removeCustomers(customerIds: string[]) {
      // await sendInboxMessage({
      //   subdomain,
      //   action: 'removeCustomersConversations',
      //   data: { customerIds },
      // });

      // await models.InternalNotes.deleteMany({
      //   contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      //   contentTypeIds: customerIds,
      // });

      return models.CallCustomers.deleteMany({ _id: { $in: customerIds } });
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
