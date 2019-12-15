import { Model, model } from 'mongoose';
import { validateEmail, validSearchText } from '../../data/utils';
import { ActivityLogs, Conformities, Conversations, EngageMessages, Fields, InternalNotes } from './';
import { STATUSES } from './definitions/constants';
import { customerSchema, ICustomer, ICustomerDocument } from './definitions/customers';
import { IUserDocument } from './definitions/users';

interface ICustomerFieldsInput {
  primaryEmail?: string;
  primaryPhone?: string;
  code?: string;
}

export interface ICustomerModel extends Model<ICustomerDocument> {
  checkDuplication(customerFields: ICustomerFieldsInput, idsToExclude?: string[] | string): never;
  getCustomer(_id: string): Promise<ICustomerDocument>;
  getCustomerName(customer: ICustomer): string;
  createCustomer(doc: ICustomer, user?: IUserDocument): Promise<ICustomerDocument>;
  updateCustomer(_id: string, doc: ICustomer): Promise<ICustomerDocument>;
  markCustomerAsActive(customerId: string): Promise<ICustomerDocument>;
  markCustomerAsNotActive(_id: string): Promise<ICustomerDocument>;
  removeCustomers(customerIds: string[]): Promise<{ n: number; ok: number }>;
  mergeCustomers(customerIds: string[], customerFields: ICustomer, user?: IUserDocument): Promise<ICustomerDocument>;
  bulkInsert(fieldNames: string[], fieldValues: string[][], user: IUserDocument): Promise<string[]>;
  updateProfileScore(customerId: string, save: boolean): never;
}

export const loadClass = () => {
  class Customer {
    /**
     * Checking if customer has duplicated unique properties
     */
    public static async checkDuplication(customerFields: ICustomerFieldsInput, idsToExclude?: string[] | string) {
      const query: { status: {}; [key: string]: any } = { status: { $ne: STATUSES.DELETED } };
      let previousEntry;

      // Adding exclude operator to the query
      if (idsToExclude) {
        query._id = idsToExclude instanceof Array ? { $nin: idsToExclude } : { $ne: idsToExclude };
      }

      if (customerFields.primaryEmail) {
        // check duplication from primaryEmail
        previousEntry = await Customers.find({
          ...query,
          primaryEmail: customerFields.primaryEmail,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }

        // check duplication from emails
        previousEntry = await Customers.find({
          ...query,
          emails: { $in: [customerFields.primaryEmail] },
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }
      }

      if (customerFields.primaryPhone) {
        // check duplication from primaryPhone
        previousEntry = await Customers.find({
          ...query,
          primaryPhone: customerFields.primaryPhone,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated phone');
        }

        // Check duplication from phones
        previousEntry = await Customers.find({
          ...query,
          phones: { $in: [customerFields.primaryPhone] },
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated phone');
        }
      }

      if (customerFields.code) {
        // check duplication from code
        previousEntry = await Customers.find({
          ...query,
          code: customerFields.code,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated code');
        }
      }
    }

    public static getCustomerName(customer: ICustomer) {
      if (customer.firstName || customer.lastName) {
        return (customer.firstName || '') + ' ' + (customer.lastName || '');
      }

      if (customer.primaryEmail || customer.primaryPhone) {
        return customer.primaryEmail || customer.primaryPhone;
      }

      const { visitorContactInfo } = customer;

      if (visitorContactInfo) {
        return visitorContactInfo.phone || visitorContactInfo.email;
      }

      return 'Unknown';
    }

    /**
     * Retreives customer
     */
    public static async getCustomer(_id: string) {
      const customer = await Customers.findOne({ _id });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }

    /**
     * Create a customer
     */
    public static async createCustomer(doc: ICustomer, user?: IUserDocument) {
      // Checking duplicated fields of customer
      await Customers.checkDuplication(doc);

      if (!doc.ownerId && user) {
        doc.ownerId = user._id;
      }

      // clean custom field values
      doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
      const isValid = await validateEmail(doc.primaryEmail);

      if (doc.primaryEmail && isValid) {
        doc.hasValidEmail = true;
      }

      const customer = await Customers.create({
        createdAt: new Date(),
        modifiedAt: new Date(),
        ...doc,
      });

      // calculateProfileScore
      await Customers.updateProfileScore(customer._id, true);

      await ActivityLogs.createCocLog({ coc: customer, contentType: 'customer' });

      return customer;
    }

    /*
     * Update customer
     */
    public static async updateCustomer(_id: string, doc: ICustomer) {
      // Checking duplicated fields of customer
      await Customers.checkDuplication(doc, _id);

      // clean custom field values
      doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

      if (doc.primaryEmail) {
        const isValid = await validateEmail(doc.primaryEmail);
        doc.hasValidEmail = isValid;
      }

      await Customers.updateOne({ _id }, { $set: { ...doc, modifiedAt: new Date() } });

      // calculateProfileScore
      await Customers.updateProfileScore(_id, true);

      return Customers.findOne({ _id });
    }

    /**
     * Mark customer as active
     */
    public static async markCustomerAsActive(customerId: string) {
      await Customers.updateOne({ _id: customerId }, { $set: { 'messengerData.isActive': true } });

      return Customers.findOne({ _id: customerId });
    }

    /**
     * Mark customer as inactive
     */
    public static async markCustomerAsNotActive(_id: string) {
      await Customers.findByIdAndUpdate(
        _id,
        {
          $set: {
            'messengerData.isActive': false,
            'messengerData.lastSeenAt': new Date(),
          },
        },
        { new: true },
      );

      return Customers.findOne({ _id });
    }

    /**
     * Update customer profile score
     */
    public static async updateProfileScore(customerId: string, save: boolean) {
      const customer = await Customers.findOne({ _id: customerId });

      if (!customer) {
        return 0;
      }

      const nullValues = ['', null];
      let score = 0;
      let searchText = (customer.emails || []).join(' ').concat(' ', (customer.phones || []).join(' '));

      if (!nullValues.includes(customer.firstName || '')) {
        score += 10;
        searchText = searchText.concat(' ', customer.firstName || '');
      }

      if (!nullValues.includes(customer.lastName || '')) {
        score += 5;
        searchText = searchText.concat(' ', customer.lastName || '');
      }

      if (!nullValues.includes(customer.code || '')) {
        score += 10;
        searchText = searchText.concat(' ', customer.code || '');
      }

      if (!nullValues.includes(customer.primaryEmail || '')) {
        score += 15;
      }

      if (!nullValues.includes(customer.primaryPhone || '')) {
        score += 10;
      }

      if (customer.visitorContactInfo != null) {
        score += 5;
        searchText = searchText.concat(
          ' ',
          customer.visitorContactInfo.email || '',
          ' ',
          customer.visitorContactInfo.phone || '',
        );
      }

      searchText = validSearchText([searchText]);

      if (!save) {
        return {
          updateOne: {
            filter: { _id: customerId },
            update: { $set: { profileScore: score, searchText } },
          },
        };
      }

      await Customers.updateOne({ _id: customerId }, { $set: { profileScore: score, searchText } });
    }
    /**
     * Remove customers
     */
    public static async removeCustomers(customerIds: string[]) {
      // Removing every modules that associated with customer
      await Conversations.removeCustomersConversations(customerIds);
      await EngageMessages.removeCustomersEngages(customerIds);
      await InternalNotes.removeCustomersInternalNotes(customerIds);

      for (const customerId of customerIds) {
        await Conformities.removeConformity({ mainType: 'customer', mainTypeId: customerId });
      }

      return Customers.deleteMany({ _id: { $in: customerIds } });
    }

    /**
     * Merge customers
     */
    public static async mergeCustomers(customerIds: string[], customerFields: ICustomer, user?: IUserDocument) {
      // Checking duplicated fields of customer
      await Customers.checkDuplication(customerFields, customerIds);

      let scopeBrandIds: string[] = [];
      let tagIds: string[] = [];
      let customFieldsData = {};

      let emails: string[] = [];
      let phones: string[] = [];

      if (customerFields.primaryEmail) {
        emails.push(customerFields.primaryEmail);
      }

      if (customerFields.primaryPhone) {
        phones.push(customerFields.primaryPhone);
      }

      for (const customerId of customerIds) {
        const customerObj = await Customers.findOne({ _id: customerId });

        if (customerObj) {
          // get last customer's integrationId
          customerFields.integrationId = customerObj.integrationId;

          // merge custom fields data
          customFieldsData = { ...customFieldsData, ...(customerObj.customFieldsData || {}) };

          // Merging scopeBrandIds
          scopeBrandIds = [...scopeBrandIds, ...(customerObj.scopeBrandIds || [])];

          const customerTags: string[] = customerObj.tagIds || [];

          // Merging customer's tag and companies into 1 array
          tagIds = tagIds.concat(customerTags);

          // Merging emails, phones
          emails = [...emails, ...(customerObj.emails || [])];
          phones = [...phones, ...(customerObj.phones || [])];

          await Customers.findByIdAndUpdate(customerId, { $set: { status: STATUSES.DELETED } });
        }
      }

      // Removing Duplicates
      scopeBrandIds = Array.from(new Set(scopeBrandIds));
      tagIds = Array.from(new Set(tagIds));

      // Removing Duplicated Emails from customer
      emails = Array.from(new Set(emails));
      phones = Array.from(new Set(phones));

      // Creating customer with properties
      const customer = await this.createCustomer(
        {
          ...customerFields,
          scopeBrandIds,
          customFieldsData,
          tagIds,
          mergedIds: customerIds,
          emails,
          phones,
        },
        user,
      );

      // Updating every modules associated with customers
      await Conformities.changeConformity({ type: 'customer', newTypeId: customer._id, oldTypeIds: customerIds });
      await Conversations.changeCustomer(customer._id, customerIds);
      await EngageMessages.changeCustomer(customer._id, customerIds);
      await InternalNotes.changeCustomer(customer._id, customerIds);

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};

loadClass();

// tslint:disable-next-line
const Customers = model<ICustomerDocument, ICustomerModel>('customers', customerSchema);

export default Customers;
