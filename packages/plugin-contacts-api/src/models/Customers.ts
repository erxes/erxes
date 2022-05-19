import { Model } from 'mongoose';

import { putActivityLog, prepareCocLogData } from '../logUtils';
import { validSearchText } from '@erxes/api-utils/src';
import { validateSingle } from '../verifierUtils';
import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import { ACTIVITY_CONTENT_TYPES } from './definitions/constants';
import {
  customerSchema,
  ICustomer,
  ICustomerDocument
} from './definitions/customers';
import { IModels } from '../connectionResolver';
import {
  sendCoreMessage,
  sendEngagesMessage,
  sendFormsMessage,
  sendInboxMessage,
  sendInternalNotesMessage,
  sendToWebhook
} from '../messageBroker';

interface IGetCustomerParams {
  email?: string;
  phone?: string;
  code?: string;
  integrationId?: string;
  cachedCustomerId?: string;
}

interface ICustomerFieldsInput {
  primaryEmail?: string;
  primaryPhone?: string;
  code?: string;
}

interface ICreateMessengerCustomerParams {
  doc: {
    integrationId: string;
    email?: string;
    emailValidationStatus?: string;
    phone?: string;
    phoneValidationStatus?: string;
    code?: string;
    isUser?: boolean;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    description?: string;
    deviceToken?: string;
  };
  customData?: any;
}

export interface IUpdateMessengerCustomerParams {
  _id: string;
  doc: {
    integrationId: string;
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
  visitorId?: string;
  type: string;
  value: string;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  countryCode?: string;
}

interface IPSS {
  profileScore: string;
  searchText: string;
  state: string;
}

export interface ICustomerModel extends Model<ICustomerDocument> {
  checkDuplication(
    customerFields: ICustomerFieldsInput,
    idsToExclude?: string[] | string
  ): never;
  findActiveCustomers(selector, fields?): Promise<ICustomerDocument[]>;
  getCustomer(_id: string): Promise<ICustomerDocument>;
  getCustomerName(customer: ICustomer): string;
  createVisitor(): Promise<string>;
  createCustomer(doc: ICustomer, user?: any): Promise<ICustomerDocument>;
  updateCustomer(_id: string, doc: ICustomer): Promise<ICustomerDocument>;
  markCustomerAsActive(customerId: string): Promise<ICustomerDocument>;
  markCustomerAsNotActive(_id: string): Promise<ICustomerDocument>;
  removeCustomers(customerIds: string[]): Promise<{ n: number; ok: number }>;
  changeState(_id: string, value: string): Promise<ICustomerDocument>;
  mergeCustomers(
    customerIds: string[],
    customerFields: ICustomer,
    user?: any
  ): Promise<ICustomerDocument>;
  bulkInsert(
    fieldNames: string[],
    fieldValues: string[][],
    user: any
  ): Promise<string[]>;
  calcPSS(doc: any): IPSS;
  updateVerificationStatus(
    customerIds: string[],
    type: string,
    status: string
  ): Promise<ICustomerDocument[]>;

  // widgets ===
  getWidgetCustomer(doc: IGetCustomerParams): Promise<ICustomerDocument | null>;
  createMessengerCustomer(
    param: ICreateMessengerCustomerParams
  ): Promise<ICustomerDocument>;
  updateMessengerCustomer(
    param: IUpdateMessengerCustomerParams
  ): Promise<ICustomerDocument>;
  updateSession(_id: string): Promise<ICustomerDocument>;
  updateLocation(
    _id: string,
    browserInfo: IBrowserInfo
  ): Promise<ICustomerDocument>;
  saveVisitorContactInfo(
    doc: IVisitorContactInfoParams
  ): Promise<ICustomerDocument>;
}

export const loadCustomerClass = (models: IModels, subdomain: string) => {
  class Customer {
    /**
     * Checking if customer has duplicated unique properties
     */
    public static async checkDuplication(
      customerFields: ICustomerFieldsInput,
      idsToExclude?: string[] | string
    ) {
      const query: { status: {}; [key: string]: any } = {
        status: { $ne: 'deleted' }
      };
      let previousEntry;

      // Adding exclude operator to the query
      if (idsToExclude) {
        query._id =
          idsToExclude instanceof Array
            ? { $nin: idsToExclude }
            : { $ne: idsToExclude };
      }

      if (!customerFields) {
        return;
      }

      if (customerFields.primaryEmail) {
        // check duplication from primaryEmail
        previousEntry = await models.Customers.find({
          ...query,
          primaryEmail: customerFields.primaryEmail
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }
      }

      if (customerFields.primaryPhone) {
        // check duplication from primaryPhone
        previousEntry = await models.Customers.find({
          ...query,
          primaryPhone: customerFields.primaryPhone
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated phone');
        }
      }

      if (customerFields.code) {
        // check duplication from code
        previousEntry = await models.Customers.find({
          ...query,
          code: customerFields.code
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

    public static async findActiveCustomers(selector, fields) {
      return models.Customers.find(
        { ...selector, status: { $ne: 'deleted' } },
        fields
      );
    }

    /**
     * Retreives customer
     */
    public static async getCustomer(_id: string) {
      const customer = await models.Customers.findOne({ _id });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }

    /**
     * Create a visitor
     */
    public static async createVisitor(): Promise<string> {
      const customer = await models.Customers.create({
        state: 'visitor',
        createdAt: new Date(),
        modifiedAt: new Date()
      });

      await putActivityLog(subdomain, {
        action: 'createCocLog',
        data: {
          coc: customer,
          contentType: 'customer',
          ...prepareCocLogData(customer)
        }
      });

      return customer._id;
    }

    /**
     * Create a customer
     */
    public static async createCustomer(
      doc: ICustomer,
      // user?: IUserDocument
      user?: any
    ): Promise<ICustomerDocument> {
      // Checking duplicated fields of customer
      try {
        await models.Customers.checkDuplication(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      if (!doc.ownerId && user) {
        doc.ownerId = user._id;
      }

      if (doc.primaryEmail && !doc.emails) {
        doc.emails = [doc.primaryEmail];
      }

      if (doc.primaryPhone && !doc.phones) {
        doc.phones = [doc.primaryPhone];
      }

      // clean custom field values
      doc.customFieldsData = await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: doc.customFieldsData,
        isRPC: true
      });

      if (doc.integrationId) {
        doc.relatedIntegrationIds = [doc.integrationId];
      }

      const pssDoc = await models.Customers.calcPSS(doc);

      const customer = await models.Customers.create({
        createdAt: new Date(),
        modifiedAt: new Date(),
        ...doc,
        ...pssDoc
      });

      if (
        (doc.primaryEmail && !doc.emailValidationStatus) ||
        (doc.primaryEmail && doc.emailValidationStatus === 'unknown')
      ) {
        validateSingle({ email: doc.primaryEmail });
      }

      if (
        (doc.primaryPhone && !doc.phoneValidationStatus) ||
        (doc.primaryPhone && doc.phoneValidationStatus === 'unknown')
      ) {
        validateSingle({ phone: doc.primaryPhone });
      }

      await putActivityLog(subdomain, {
        action: 'createCocLog',
        data: {
          coc: customer,
          contentType: 'customer',
          ...prepareCocLogData(customer)
        }
      });

      return models.Customers.getCustomer(customer._id);
    }

    /*
     * Update customer
     */
    public static async updateCustomer(_id: string, doc: ICustomer) {
      // Checking duplicated fields of customer
      try {
        await models.Customers.checkDuplication(doc, _id);
      } catch (e) {
        throw new Error(e.message);
      }

      const oldCustomer = await models.Customers.getCustomer(_id);

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await sendFormsMessage({
          subdomain,
          action: 'fields.prepareCustomFieldsData',
          data: doc.customFieldsData,
          isRPC: true
        });
      }

      if (doc.primaryEmail) {
        if (doc.primaryEmail !== oldCustomer.primaryEmail) {
          doc.emailValidationStatus = 'unknown';

          validateSingle({ email: doc.primaryEmail });
        }
      }

      if (doc.primaryPhone) {
        if (doc.primaryPhone !== oldCustomer.primaryPhone) {
          doc.phoneValidationStatus = 'unknown';

          validateSingle({ phone: doc.primaryPhone });
        }
      }

      const pssDoc = await models.Customers.calcPSS({
        ...oldCustomer.toObject(),
        ...doc
      });

      await models.Customers.updateOne(
        { _id },
        { $set: { ...doc, ...pssDoc, modifiedAt: new Date() } }
      );

      return models.Customers.findOne({ _id });
    }

    /**
     * Mark customer as active
     */
    public static async markCustomerAsActive(customerId: string) {
      await models.Customers.updateOne(
        { _id: customerId },
        { $set: { isOnline: true } }
      );

      return models.Customers.findOne({ _id: customerId });
    }

    /**
     * Mark customer as inactive
     */
    public static async markCustomerAsNotActive(_id: string) {
      await models.Customers.findByIdAndUpdate(
        _id,
        {
          $set: {
            isOnline: false,
            lastSeenAt: new Date()
          }
        },
        { new: true }
      );

      return models.Customers.findOne({ _id });
    }

    /**
     * Calc customer profileScore, searchText and state
     */
    public static async calcPSS(customer: any) {
      const nullValues = ['', null];

      let possibleLead = false;
      let score = 0;
      let searchText = (customer.emails || [])
        .join(' ')
        .concat(' ', (customer.phones || []).join(' '));

      if (!nullValues.includes(customer.firstName || '')) {
        score += 10;
        possibleLead = true;
        searchText = searchText.concat(' ', customer.firstName || '');
      }

      if (!nullValues.includes(customer.lastName || '')) {
        score += 5;
        possibleLead = true;
        searchText = searchText.concat(' ', customer.lastName || '');
      }

      if (!nullValues.includes(customer.code || '')) {
        score += 10;
        possibleLead = true;
        searchText = searchText.concat(' ', customer.code || '');
      }

      if (!nullValues.includes(customer.primaryEmail || '')) {
        possibleLead = true;
        score += 15;
      }

      if (!nullValues.includes(customer.primaryPhone || '')) {
        possibleLead = true;
        score += 10;
      }

      if (customer.visitorContactInfo != null) {
        possibleLead = true;
        score += 5;

        searchText = searchText.concat(
          ' ',
          customer.visitorContactInfo.email || '',
          ' ',
          customer.visitorContactInfo.phone || ''
        );
      }

      searchText = validSearchText([searchText]);

      let state = customer.state || 'visitor';

      if (possibleLead && state !== 'customer') {
        state = 'lead';
      }

      return { profileScore: score, searchText, state };
    }
    /**
     * Remove customers
     */
    public static async removeCustomers(customerIds: string[]) {
      // Removing every modules that associated with customer
      await putActivityLog(subdomain, {
        action: 'removeActivityLogs',
        data: { type: ACTIVITY_CONTENT_TYPES.CUSTOMER, itemIds: customerIds }
      });

      await sendInboxMessage({
        subdomain,
        action: 'removeCustomersConversations',
        data: { customerIds }
      });
      await sendEngagesMessage({
        subdomain,
        action: 'removeCustomersEngages',
        data: { customerIds }
      });
      await sendInternalNotesMessage({
        subdomain,
        action: 'removeInternalNotes',
        data: {
          contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
          contentTypeIds: customerIds
        }
      });
      await sendCoreMessage({
        subdomain,
        action: 'conformities.removeConformities',
        data: { mainType: 'customer', mainTypeIds: customerIds }
      });

      return models.Customers.deleteMany({ _id: { $in: customerIds } });
    }

    /**
     * Merge customers
     */
    public static async mergeCustomers(
      customerIds: string[],
      customerFields: ICustomer,
      // user?: IUserDocument
      user?: any
    ) {
      // Checking duplicated fields of customer
      await models.Customers.checkDuplication(customerFields, customerIds);

      let scopeBrandIds: string[] = [];
      let tagIds: string[] = [];
      let customFieldsData: ICustomField[] = [];
      let state: any = '';

      let emails: string[] = [];
      let phones: string[] = [];

      if (customerFields.primaryEmail) {
        emails.push(customerFields.primaryEmail);
      }

      if (customerFields.primaryPhone) {
        phones.push(customerFields.primaryPhone);
      }

      for (const customerId of customerIds) {
        const customerObj = await models.Customers.findOne({ _id: customerId });

        if (customerObj) {
          // get last customer's integrationId
          customerFields.integrationId = customerObj.integrationId;

          // merge custom fields data
          customFieldsData = [
            ...customFieldsData,
            ...(customerObj.customFieldsData || [])
          ];

          // Merging scopeBrandIds
          scopeBrandIds = [
            ...scopeBrandIds,
            ...(customerObj.scopeBrandIds || [])
          ];

          const customerTags: string[] = customerObj.tagIds || [];

          // Merging customer's tag and companies into 1 array
          tagIds = tagIds.concat(customerTags);

          // Merging emails, phones
          emails = [...emails, ...(customerObj.emails || [])];
          phones = [...phones, ...(customerObj.phones || [])];

          // Merging customer`s state for new customer
          state = customerObj.state;

          await models.Customers.findByIdAndUpdate(customerId, {
            $set: { status: 'deleted' }
          });
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
          state
        },
        user
      );

      // Updating every modules associated with customers
      await sendCoreMessage({
        subdomain,
        action: 'conformities.changeConformity',
        data: {
          type: 'customer',
          newTypeId: customer._id,
          oldTypeIds: customerIds
        },
        isRPC: true
      });

      await sendInboxMessage({
        subdomain,
        action: 'changeCustomer',
        data: { customerId: customer._id, customerIds }
      });
      await sendEngagesMessage({
        subdomain,
        action: 'changeCustomer',
        data: { customerId: customer._id, customerIds }
      });
      await sendInternalNotesMessage({
        subdomain,
        action: 'batchUpdate',
        data: {
          contentType: 'contacts:customer',
          oldContentTypeIds: customerIds,
          newContentTypeId: customer._id
        }
      });

      return customer;
    }

    /*
     * Get widget customer
     */
    public static async getWidgetCustomer({
      integrationId,
      email,
      phone,
      code,
      cachedCustomerId
    }: IGetCustomerParams) {
      let customer: ICustomerDocument | null = null;

      if (email) {
        customer = await models.Customers.findOne({
          $or: [{ emails: { $in: [email] } }, { primaryEmail: email }]
        });
      }

      if (!customer && phone) {
        customer = await models.Customers.findOne({
          $or: [{ phones: { $in: [phone] } }, { primaryPhone: phone }]
        });
      }

      if (!customer && code) {
        customer = await models.Customers.findOne({ code });
      }

      if (!customer && cachedCustomerId) {
        customer = await models.Customers.findOne({ _id: cachedCustomerId });
      }

      if (customer) {
        const ids = customer.relatedIntegrationIds;

        if (integrationId && ids && !ids.includes(integrationId)) {
          ids.push(integrationId);
          await models.Customers.updateOne(
            { _id: customer._id },
            { $set: { relatedIntegrationIds: ids } }
          );
          customer = await models.Customers.findOne({ _id: customer._id });
        }
      }

      return customer;
    }

    public static customerFieldNames() {
      const names: string[] = [];

      customerSchema.eachPath(name => {
        names.push(name);

        const path = customerSchema.paths[name];

        if (path.schema) {
          path.schema.eachPath(subName => {
            names.push(`${name}.${subName}`);
          });
        }
      });

      return names;
    }

    public static fixListFields(
      doc: any,
      customData = {},
      customer?: ICustomerDocument
    ) {
      let emails: string[] = [];
      let phones: string[] = [];
      let deviceTokens: string[] = [];

      // extract basic fields from customData
      for (const name of this.customerFieldNames()) {
        if (customData[name]) {
          doc[name] = customData[name];

          delete customData[name];
        }
      }

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
    public static async createMessengerCustomer({
      doc,
      customData
    }: ICreateMessengerCustomerParams) {
      this.fixListFields(doc, customData);

      const { customFieldsData, trackedData } = await sendFormsMessage({
        subdomain,
        action: 'fields.generateCustomFieldsData',
        data: {
          customData,
          contentType: 'constacts:customer'
        },
        isRPC: true
      });

      return this.createCustomer({
        ...doc,
        trackedData,
        customFieldsData,
        lastSeenAt: new Date(),
        isOnline: true,
        sessionCount: 1
      });
    }

    /*
     * Update messenger customer
     */
    public static async updateMessengerCustomer({
      _id,
      doc,
      customData
    }: IUpdateMessengerCustomerParams) {
      const customer = await models.Customers.getCustomer(_id);

      this.fixListFields(doc, customData, customer);

      const { customFieldsData, trackedData } = await sendFormsMessage({
        subdomain,
        action: 'fields.generateCustomFieldsData',
        data: {
          customData,
          contentType: 'contacts:customer'
        },
        isRPC: true
      });

      const modifier: any = {
        ...doc,
        state: doc.isUser ? 'customer' : customer.state,
        modifiedAt: new Date()
      };

      if (trackedData && trackedData.length > 0) {
        modifier.trackedData = trackedData;
      }

      if (customFieldsData && customFieldsData.length > 0) {
        modifier.customFieldsData = customFieldsData;
      }

      await models.Customers.updateOne({ _id }, { $set: modifier });

      const updateCustomer = await models.Customers.getCustomer(_id);

      const pssDoc = await models.Customers.calcPSS(updateCustomer);

      await models.Customers.updateOne({ _id }, { $set: pssDoc });

      return models.Customers.findOne({ _id });
    }

    /*
     * Update session data
     */
    public static async updateSession(_id: string) {
      const now = new Date();
      const customer = await models.Customers.getCustomer(_id);

      const query: any = {
        $set: {
          lastSeenAt: now,
          isOnline: true
        }
      };

      // Preventing session count to increase on page every refresh
      // Close your web site tab and reopen it after 6 seconds then it will increase
      // session count by 1
      if (
        customer.lastSeenAt &&
        now.getTime() - customer.lastSeenAt.getTime() > 6 * 1000
      ) {
        // update session count
        query.$inc = { sessionCount: 1 };
      }

      // update
      await models.Customers.findByIdAndUpdate(_id, query);

      // updated customer
      return models.Customers.findOne({ _id });
    }

    /*
     * Change state
     */
    public static async changeState(_id: string, value: string) {
      await models.Customers.findByIdAndUpdate(
        { _id },
        {
          $set: { state: value }
        }
      );

      return models.Customers.findOne({ _id });
    }

    /*
     * Update customer's location info
     */
    public static async updateLocation(_id: string, browserInfo: IBrowserInfo) {
      await models.Customers.findByIdAndUpdate(
        { _id },
        {
          $set: { location: browserInfo }
        }
      );

      return models.Customers.findOne({ _id });
    }

    /*
     * If customer is a visitor then we will contact with this customer using
     * this information later
     */
    public static async saveVisitorContactInfo(
      args: IVisitorContactInfoParams
    ) {
      const { customerId, type, value } = args;

      const webhookData: any = {};

      let customer = await models.Customers.getCustomer(customerId);

      webhookData.type = 'customer';
      webhookData.object = customer;

      if (type === 'email') {
        await models.Customers.updateOne(
          { _id: customerId },
          {
            $set: { 'visitorContactInfo.email': value },
            $push: { emails: value }
          }
        );

        webhookData.newData = { email: value };
      }

      if (type === 'phone') {
        await models.Customers.updateOne(
          { _id: customerId },
          {
            $set: { 'visitorContactInfo.phone': value },
            $push: { phones: value }
          }
        );

        webhookData.newData = { phone: value };
      }

      customer = await models.Customers.getCustomer(customerId);

      webhookData.updatedDocument = customer;

      await sendToWebhook({
        subdomain,
        data: {
          action: 'update',
          type: 'contacts:customer',
          params: webhookData
        }
      });

      const pssDoc = await models.Customers.calcPSS(customer);

      await models.Customers.updateOne({ _id: customerId }, { $set: pssDoc });

      return models.Customers.getCustomer(customerId);
    }

    public static async updateVerificationStatus(
      customerIds: string,
      type: string,
      status: string
    ) {
      const set: any =
        type !== 'email'
          ? { phoneValidationStatus: status }
          : { emailValidationStatus: status };

      await models.Customers.updateMany(
        { _id: { $in: customerIds } },
        { $set: set }
      );

      return models.Customers.find({ _id: { $in: customerIds } });
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
