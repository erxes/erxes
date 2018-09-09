import { Model, model } from 'mongoose';
import { ActivityLogs, Conversations, EngageMessages, Fields, InternalNotes } from './';
import { CUSTOMER_BASIC_INFOS } from './definitions/constants';
import { customerSchema, ICustomer, ICustomerDocument, IFacebookData, ITwitterData } from './definitions/customers';
import { IUserDocument } from './definitions/users';
import { bulkInsert } from './utils';

interface ICustomerFieldsInput {
  twitterData?: ITwitterData;
  facebookData?: IFacebookData;
  primaryEmail?: string;
  primaryPhone?: string;
}

interface ICustomerModel extends Model<ICustomerDocument> {
  checkDuplication(customerFields: ICustomerFieldsInput, idsToExclude?: string[] | string): never;

  createCustomer(doc: ICustomer, user?: IUserDocument): Promise<ICustomerDocument>;

  updateCustomer(_id: string, doc: ICustomer): Promise<ICustomerDocument>;

  markCustomerAsActive(customerId: string): Promise<ICustomerDocument>;
  markCustomerAsNotActive(_id: string): Promise<ICustomerDocument>;

  updateCompanies(_id: string, companyIds: string[]): Promise<ICustomerDocument>;
  removeCustomer(customerId: string): void;

  mergeCustomers(customerIds: string[], customerFields: ICustomer): Promise<ICustomerDocument>;

  bulkInsert(fieldNames: string[], fieldValues: string[][], user: IUserDocument): Promise<string[]>;
}

class Customer {
  /**
   * Checking if customer has duplicated unique properties
   */
  public static async checkDuplication(customerFields: ICustomerFieldsInput, idsToExclude?: string[] | string) {
    const query: { [key: string]: any } = {};
    let previousEntry;

    // Adding exclude operator to the query
    if (idsToExclude) {
      query._id = idsToExclude instanceof Array ? { $nin: idsToExclude } : { $ne: idsToExclude };
    }

    // Checking if customer has twitter data
    if (customerFields.twitterData) {
      previousEntry = await Customers.find({
        ...query,
        ['twitterData.id']: customerFields.twitterData.id,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated twitter');
      }
    }

    // Checking if customer has facebook data
    if (customerFields.facebookData) {
      previousEntry = await Customers.find({
        ...query,
        ['facebookData.id']: customerFields.facebookData.id,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated facebook');
      }
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

    return Customers.create({
      createdAt: new Date(),
      modifiedAt: new Date(),
      ...doc,
    });
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

    await Customers.update({ _id }, { $set: { ...doc, modifiedAt: new Date() } });

    return Customers.findOne({ _id });
  }

  /**
   * Mark customer as active
   */
  public static async markCustomerAsActive(customerId: string) {
    await Customers.update({ _id: customerId }, { $set: { 'messengerData.isActive': true } });

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
   * Removes customer
   */
  public static async removeCustomer(customerId: string) {
    // Removing every modules that associated with customer
    await ActivityLogs.removeCustomerActivityLog(customerId);
    await Conversations.removeCustomerConversations(customerId);
    await EngageMessages.removeCustomerEngages(customerId);
    await InternalNotes.removeCustomerInternalNotes(customerId);

    return Customers.remove({ _id: customerId });
  }

  /**
   * Merge customers
   */
  public static async mergeCustomers(customerIds: string[], customerFields: ICustomer) {
    // Checking duplicated fields of customer
    await Customers.checkDuplication(customerFields, customerIds);

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

        const customerTags: string[] = customerObj.tagIds || [];
        const customerCompanies: string[] = customerObj.companyIds || [];

        // Merging customer's tag and companies into 1 array
        tagIds = tagIds.concat(customerTags);
        companyIds = companyIds.concat(customerCompanies);

        // Merging emails, phones
        emails = [...emails, ...(customerObj.emails || [])];
        phones = [...phones, ...(customerObj.phones || [])];

        // Removing Customers
        await Customers.remove({ _id: customerId });
      }
    }

    // Removing Duplicated Tags from customer
    tagIds = Array.from(new Set(tagIds));

    // Removing Duplicated Companies from customer
    companyIds = Array.from(new Set(companyIds));

    // Removing Duplicated Emails from customer
    emails = Array.from(new Set(emails));

    // Removing Duplicated Phones from customer
    phones = Array.from(new Set(phones));

    // Creating customer with properties
    const customer = await this.createCustomer({
      ...customerFields,
      tagIds,
      companyIds,
      emails,
      phones,
    });

    // Updating every modules associated with customers
    await ActivityLogs.changeCustomer(customer._id, customerIds);
    await Conversations.changeCustomer(customer._id, customerIds);
    await EngageMessages.changeCustomer(customer._id, customerIds);
    await InternalNotes.changeCustomer(customer._id, customerIds);

    return customer;
  }

  /**
   * Imports customers with basic fields and custom properties
   */
  public static async bulkInsert(fieldNames: string[], fieldValues: string[][], user: IUserDocument) {
    const params = {
      fieldNames,
      fieldValues,
      user,
      basicInfos: CUSTOMER_BASIC_INFOS,
      contentType: 'customer',
      create: this.createCustomer,
    };

    return bulkInsert(params);
  }
}

customerSchema.loadClass(Customer);

const Customers = model<ICustomerDocument, ICustomerModel>('customers', customerSchema);

export default Customers;
