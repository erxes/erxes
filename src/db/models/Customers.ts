import { Model, model } from 'mongoose';
import { validateEmail, validSearchText } from '../../data/utils';
import { ActivityLogs, Conformities, Conversations, EngageMessages, Fields, InternalNotes } from './';
import { STATUSES } from './definitions/constants';
import { customerSchema, ICustomer, ICustomerDocument } from './definitions/customers';
import { IUserDocument } from './definitions/users';

interface IGetCustomerParams {
  email?: string;
  phone?: string;
  code?: string;
  cachedCustomerId?: string;
}

interface ICustomerFieldsInput {
  primaryEmail?: string;
  primaryPhone?: string;
  code?: string;
}

interface ICreateMessengerCustomerParams {
  integrationId?: string;
  email?: string;
  hasValidEmail?: boolean;
  phone?: string;
  code?: string;
  isUser?: boolean;
  firstName?: string;
  lastName?: string;
  description?: string;
  messengerData?: any;
  deviceToken?: string;
}

export interface IUpdateMessengerCustomerParams {
  _id: string;
  doc: {
    email?: string;
    phone?: string;
    code?: string;
    isUser?: boolean;
    deviceToken?: string;
  };
  customData?: any;
}

export interface IVisitorContactInfoParams {
  customerId: string;
  type: string;
  value: string;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  country?: string;
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

  // widgets ===
  getWidgetCustomer(doc: IGetCustomerParams): Promise<ICustomerDocument | null>;
  createMessengerCustomer(doc: ICreateMessengerCustomerParams, customData: any): Promise<ICustomerDocument>;
  updateMessengerCustomer(param: IUpdateMessengerCustomerParams): Promise<ICustomerDocument>;
  updateMessengerSession(_id: string, url: string): Promise<ICustomerDocument>;
  updateLocation(_id: string, browserInfo: IBrowserInfo): Promise<ICustomerDocument>;
  saveVisitorContactInfo(doc: IVisitorContactInfoParams): Promise<ICustomerDocument>;
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
    public static async createCustomer(doc: ICustomer, user?: IUserDocument): Promise<ICustomerDocument> {
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

      return Customers.getCustomer(customer._id);
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

    /*
     * Fix firstName, lastName, description abbriviations
     */
    public static fixCustomData(customData: any): { extractedInfo: any; updatedCustomData: any } {
      const extractedInfo: any = {};
      const updatedCustomData = { ...customData };

      // Setting customData fields to customer fields
      Object.keys(updatedCustomData).forEach(key => {
        if (key === 'first_name' || key === 'firstName') {
          extractedInfo.firstName = updatedCustomData[key];

          delete updatedCustomData[key];
        }

        if (key === 'last_name' || key === 'lastName') {
          extractedInfo.lastName = updatedCustomData[key];

          delete updatedCustomData[key];
        }

        if (key === 'bio' || key === 'description') {
          extractedInfo.description = updatedCustomData[key];

          delete updatedCustomData[key];
        }
      });

      return { extractedInfo, updatedCustomData };
    }

    /*
     * Get widget customer
     */
    public static async getWidgetCustomer(params: IGetCustomerParams) {
      const { email, phone, code, cachedCustomerId } = params;

      let customer: ICustomerDocument | null = null;

      if (email) {
        customer = await Customers.findOne({
          $or: [{ emails: { $in: [email] } }, { primaryEmail: email }],
        });
      }

      if (!customer && phone) {
        customer = await Customers.findOne({
          $or: [{ phones: { $in: [phone] } }, { primaryPhone: phone }],
        });
      }

      if (!customer && code) {
        customer = await Customers.findOne({ code });
      }

      if (!customer && cachedCustomerId) {
        customer = await Customers.findOne({ _id: cachedCustomerId });
      }

      return customer;
    }

    public static fixMessengerListFields(doc: any, customer?: ICustomerDocument) {
      let emails: string[] = [];
      let phones: string[] = [];
      let deviceTokens: string[] = [];

      if (customer) {
        emails = customer.emails || [];
        phones = customer.phones || [];
        deviceTokens = customer.deviceTokens || [];
      }

      if (doc.email) {
        if (!emails.includes(doc.email)) {
          emails.push(doc.email);
        }

        doc.primaryEmail = doc.email;

        delete doc.email;
      }

      if (doc.phone) {
        if (!phones.includes(doc.phone)) {
          phones.push(doc.phone);
        }

        doc.primaryPhone = doc.phone;

        delete doc.phone;
      }

      if (doc.deviceToken) {
        if (!deviceTokens.includes(doc.deviceToken)) {
          deviceTokens.push(doc.deviceToken);
        }

        delete doc.deviceToken;
      }

      doc.emails = emails;
      doc.phones = phones;
      doc.deviceTokens = deviceTokens;

      return doc;
    }

    /*
     * Create a new messenger customer
     */
    public static async createMessengerCustomer(doc: ICreateMessengerCustomerParams, customData: any) {
      const { extractedInfo, updatedCustomData } = this.fixCustomData(customData || {});

      return this.createCustomer({
        ...extractedInfo,
        ...this.fixMessengerListFields(doc),
        messengerData: {
          lastSeenAt: new Date(),
          isActive: true,
          sessionCount: 1,
          customData: updatedCustomData,
        },
      });
    }

    /*
     * Update messenger customer
     */
    public static async updateMessengerCustomer(param: IUpdateMessengerCustomerParams) {
      const { _id, doc, customData } = param;

      const customer = await Customers.findOne({ _id });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const { extractedInfo, updatedCustomData } = this.fixCustomData(customData || {});

      if (customer.isUser) {
        doc.isUser = true;
      }

      let fixedCustomData = updatedCustomData;

      // Do not replace previous non empty value with empty value
      if (customer.messengerData && customer.messengerData.customData && Object.keys(updatedCustomData).length === 0) {
        fixedCustomData = customer.messengerData.customData;
      }

      const modifier = {
        ...extractedInfo,
        ...this.fixMessengerListFields(doc, customer),
        modifiedAt: new Date(),
        'messengerData.customData': fixedCustomData,
      };

      await Customers.updateOne({ _id }, { $set: modifier });

      await Customers.updateProfileScore(customer._id, true);

      return Customers.findOne({ _id });
    }

    /*
     * Update messenger session data
     */
    public static async updateMessengerSession(_id: string, url: string) {
      const now = new Date();
      const customer = await Customers.findOne({ _id });

      if (!customer) {
        return null;
      }

      const query: any = {
        $set: {
          // update messengerData
          'messengerData.lastSeenAt': now,
          'messengerData.isActive': true,
        },
      };

      const messengerData = customer.messengerData;

      // Preventing session count to increase on page every refresh
      // Close your web site tab and reopen it after 6 seconds then it will increase
      // session count by 1
      if (messengerData && messengerData.lastSeenAt && now.getTime() - messengerData.lastSeenAt > 6 * 1000) {
        // update session count
        query.$inc = { 'messengerData.sessionCount': 1 };

        // save access history by location.pathname
        const urlVisits = customer.urlVisits || {};

        urlVisits[url] = (urlVisits[url] || 0) + 1;

        query.urlVisits = urlVisits;
      }

      // update
      await Customers.findByIdAndUpdate(_id, query);

      // updated customer
      return Customers.findOne({ _id });
    }

    /*
     * Update customer's location info
     */
    public static async updateLocation(_id: string, browserInfo: IBrowserInfo) {
      await Customers.findByIdAndUpdate(
        { _id },
        {
          $set: { location: browserInfo },
        },
      );

      return Customers.findOne({ _id });
    }

    /*
     * If customer is a visitor then we will contact with this customer using
     * this information later
     */
    public static async saveVisitorContactInfo(args: IVisitorContactInfoParams) {
      const { customerId, type, value } = args;

      if (type === 'email') {
        await Customers.updateOne(
          { _id: customerId },
          {
            $set: { 'visitorContactInfo.email': value },
          },
        );
      }

      if (type === 'phone') {
        await Customers.updateOne({ _id: customerId }, { $set: { 'visitorContactInfo.phone': value } });
      }

      await Customers.updateProfileScore(customerId, true);

      return Customers.findOne({ _id: customerId });
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};

loadClass();

// tslint:disable-next-line
const Customers = model<ICustomerDocument, ICustomerModel>('customers', customerSchema);

export default Customers;
