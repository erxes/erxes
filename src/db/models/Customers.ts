import { Model, model } from 'mongoose';
import { validateEmail } from '../../data/utils';
import { ActivityLogs, Conversations, Deals, EngageMessages, Fields, InternalNotes, Tickets } from './';
import { STATUSES } from './definitions/constants';
import { customerSchema, ICustomer, ICustomerDocument } from './definitions/customers';
import { IUserDocument } from './definitions/users';

interface ICustomerFieldsInput {
  primaryEmail?: string;
  primaryPhone?: string;
}

export interface ICustomerModel extends Model<ICustomerDocument> {
  checkDuplication(customerFields: ICustomerFieldsInput, idsToExclude?: string[] | string): never;
  getCustomer(_id: string): Promise<ICustomerDocument>;
  createCustomer(doc: ICustomer, user?: IUserDocument): Promise<ICustomerDocument>;
  updateCustomer(_id: string, doc: ICustomer): Promise<ICustomerDocument>;
  markCustomerAsActive(customerId: string): Promise<ICustomerDocument>;
  markCustomerAsNotActive(_id: string): Promise<ICustomerDocument>;
  updateCompanies(_id: string, companyIds: string[]): Promise<ICustomerDocument>;
  removeCustomer(customerId: string): void;
  mergeCustomers(customerIds: string[], customerFields: ICustomer): Promise<ICustomerDocument>;
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

      // create log
      await ActivityLogs.createCustomerLog(customer);

      return customer;
    }

    /*
     * Update customer
     */
    public static async updateCustomer(_id: string, doc: ICustomer) {
      // Checking duplicated fields of customer
      await Customers.checkDuplication(doc, _id);

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
      }

      if (doc.primaryEmail) {
        const isValid = await validateEmail(doc.primaryEmail);
        doc.hasValidEmail = isValid;
      }

      // calculateProfileScore
      await Customers.updateProfileScore(_id, true);

      await Customers.updateOne({ _id }, { $set: { ...doc, modifiedAt: new Date() } });

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
     * Update customer companies
     */
    public static async updateCompanies(_id: string, companyIds: string[]) {
      // updating companyIds field
      await Customers.findByIdAndUpdate(_id, { $set: { companyIds } });

      return Customers.findOne({ _id });
    }

    /**
     * Update customer profile score
     */
    public static async updateProfileScore(customerId: string, save: boolean) {
      let score = 0;

      const nullValues = ['', null];
      const customer = await Customers.findOne({ _id: customerId });

      if (!customer) {
        return 0;
      }

      if (!nullValues.includes(customer.firstName || '')) {
        score += 10;
      }

      if (!nullValues.includes(customer.lastName || '')) {
        score += 5;
      }

      if (!nullValues.includes(customer.primaryEmail || '')) {
        score += 15;
      }

      if (!nullValues.includes(customer.primaryPhone || '')) {
        score += 10;
      }

      if (customer.visitorContactInfo != null) {
        score += 5;
      }

      if (!save) {
        return {
          updateOne: {
            filter: { _id: customerId },
            update: { $set: { profileScore: score } },
          },
        };
      }

      await Customers.updateOne({ _id: customerId }, { $set: { profileScore: score } });
    }
    /**
     * Removes customer
     */
    public static async removeCustomer(customerId: string) {
      // Removing every modules that associated with customer
      await Conversations.removeCustomerConversations(customerId);
      await EngageMessages.removeCustomerEngages(customerId);
      await InternalNotes.removeCustomerInternalNotes(customerId);

      return Customers.deleteOne({ _id: customerId });
    }

    /**
     * Merge customers
     */
    public static async mergeCustomers(customerIds: string[], customerFields: ICustomer) {
      // Checking duplicated fields of customer
      await Customers.checkDuplication(customerFields, customerIds);

      let scopeBrandIds: string[] = [];
      let tagIds: string[] = [];
      let companyIds: string[] = [];

      let emails: string[] = [];
      let phones: string[] = [];

      if (customerFields.primaryEmail) {
        emails.push(customerFields.primaryEmail);
      }

      if (customerFields.primaryPhone) {
        phones.push(customerFields.primaryPhone);
      }

      // Merging customer tags and companies
      for (const customerId of customerIds) {
        const customerObj = await Customers.findOne({ _id: customerId });

        if (customerObj) {
          // get last customer's integrationId
          customerFields.integrationId = customerObj.integrationId;

          // Merging scopeBrandIds
          scopeBrandIds = [...scopeBrandIds, ...(customerObj.scopeBrandIds || [])];

          const customerTags: string[] = customerObj.tagIds || [];
          const customerCompanies: string[] = customerObj.companyIds || [];

          // Merging customer's tag and companies into 1 array
          tagIds = tagIds.concat(customerTags);
          companyIds = companyIds.concat(customerCompanies);

          // Merging emails, phones
          emails = [...emails, ...(customerObj.emails || [])];
          phones = [...phones, ...(customerObj.phones || [])];

          await Customers.findByIdAndUpdate(customerId, { $set: { status: STATUSES.DELETED } });
        }
      }

      // Removing Duplicates
      scopeBrandIds = Array.from(new Set(scopeBrandIds));
      tagIds = Array.from(new Set(tagIds));
      companyIds = Array.from(new Set(companyIds));
      emails = Array.from(new Set(emails));
      phones = Array.from(new Set(phones));

      // Creating customer with properties
      const customer = await this.createCustomer({
        ...customerFields,
        scopeBrandIds,
        tagIds,
        companyIds,
        mergedIds: customerIds,
        emails,
        phones,
      });

      // Updating every modules associated with customers
      await Conversations.changeCustomer(customer._id, customerIds);
      await EngageMessages.changeCustomer(customer._id, customerIds);
      await InternalNotes.changeCustomer(customer._id, customerIds);
      await Deals.changeCustomer(customer._id, customerIds);
      await Tickets.changeCustomer(customer._id, customerIds);

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
