import { customerSchema } from '@/contacts/db/definitions/customers';
import {
  IBrowserInfo,
  ICustomer,
  ICustomerDocument,
  ICustomField,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { validSearchText } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ICreateMessengerCustomerParams,
  IGetCustomerParams,
  IPSS,
  IUpdateMessengerCustomerParams,
  IVisitorContactInfoParams,
} from '../../@types/customer';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

interface ICustomerFieldsInput {
  primaryEmail?: string;
  primaryPhone?: string;
  code?: string;
}
export interface ICustomerModel extends Model<ICustomerDocument> {
  checkDuplication(
    customerFields: ICustomerFieldsInput,
    idsToExclude?: string[] | string,
  ): never;
  getCustomer(_id: string): Promise<ICustomerDocument>;
  getCustomerName(customer: ICustomer): Promise<string>;

  findActiveCustomers(
    query,
    fields?,
    skip?,
    limit?,
  ): Promise<ICustomerDocument[]>;
  calcPSS(doc: any): IPSS;

  createCustomer(
    doc: ICustomer,
    uses?: IUserDocument,
  ): Promise<ICustomerDocument>;
  updateCustomer(_id: string, doc: ICustomer): Promise<ICustomerDocument>;
  removeCustomers(customerIds: string[]): Promise<{ n: number; ok: number }>;
  mergeCustomers(
    customerIds: string[],
    customerFields: ICustomer,
    user?: any,
  ): Promise<ICustomerDocument>;
  markCustomerAsActive(_id: string): Promise<ICustomerDocument>;
  markCustomerAsNotActive(_id: string): Promise<ICustomerDocument>;

  getWidgetCustomer(
    params: IGetCustomerParams,
  ): Promise<ICustomerDocument | null>;
  createMessengerCustomer(
    params: ICreateMessengerCustomerParams,
  ): Promise<ICustomerDocument>;
  updateMessengerCustomer(
    params: IUpdateMessengerCustomerParams,
  ): Promise<ICustomerDocument>;
  saveVisitorContactInfo(
    doc: IVisitorContactInfoParams,
  ): Promise<ICustomerDocument>;

  updateSession(_id: string): Promise<ICustomerDocument>;
  updateLocation(
    _id: string,
    browserInfo: IBrowserInfo,
  ): Promise<ICustomerDocument>;

  changeState(_id: string, value: string): Promise<ICustomerDocument>;

  updateVerificationStatus(
    customerIds: string[],
    type: string,
    status: string,
  ): Promise<ICustomerDocument[]>;
}

export const loadCustomerClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class Customer {
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
     * Retrieves customer
     */
    public static async getCustomer(_id: string) {
      const customer = await models.Customers.findOne({ _id }).lean();

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }

    /**
     * Retrieves active customers
     */
    public static async findActiveCustomers(query, fields, skip?, limit?) {
      return models.Customers.find(
        { ...query, status: { $ne: 'deleted' } },
        fields,
      )
        .skip(skip || 0)
        .limit(limit || 0)
        .lean();
    }

    /**
     * Create a customer
     */
    public static async createCustomer(
      doc: ICustomer,
      user?: IUserDocument,
    ): Promise<ICustomerDocument> {
      try {
        await this.checkDuplication(doc);
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

      if (doc.customFieldsData) {
        doc.customFieldsData = await models.Fields.validateFieldValues(
          doc.customFieldsData,
        );
      }

      if (doc.integrationId) {
        doc.relatedIntegrationIds = [doc.integrationId];
      }

      const pssDoc = models.Customers.calcPSS(doc);
      const newDoc = {
        ...doc,
        ...pssDoc,
      };

      const customer = await models.Customers.create(newDoc);

      sendDbEventLog({
        action: 'create',
        docId: customer._id,
        currentDocument: customer.toObject(),
      });

      return models.Customers.getCustomer(customer._id);
    }

    /*
     * Update customer
     */
    public static async updateCustomer(_id: string, doc: ICustomer) {
      try {
        await this.checkDuplication(doc, _id);
      } catch (e) {
        throw new Error(e.message);
      }

      const oldCustomer = await models.Customers.getCustomer(_id);

      if (doc.customFieldsData) {
        // clean custom field values

        doc.customFieldsData = await models.Fields.validateFieldValues(
          doc.customFieldsData,
        );
      }

      const pssDoc = models.Customers.calcPSS({
        ...oldCustomer,
        ...doc,
      });

      const modifiedDoc = { ...doc, ...pssDoc };

      const updatedCustomer = await models.Customers.findOneAndUpdate(
        { _id },
        { $set: modifiedDoc },
        { new: true },
      );
      if (updatedCustomer) {
        sendDbEventLog({
          action: 'update',
          docId: _id,
          currentDocument: updatedCustomer.toObject(),
          prevDocument: oldCustomer,
        });
      }

      return updatedCustomer;
    }

    /**
     * Remove customers
     */
    public static async removeCustomers(customerIds: string[]) {
      const response = await models.Customers.deleteMany({
        _id: { $in: customerIds },
      });

      sendDbEventLog({
        action: 'deleteMany',
        docIds: customerIds,
      });
      return response;
    }

    /**
     * Merge customers
     */
    public static async mergeCustomers(
      customerIds: string[],
      customerFields: ICustomer,
      // user?: IUserDocument
      user?: any,
    ) {
      // Checking duplicated fields of customer
      await this.checkDuplication(customerFields, customerIds);

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

      const customers = await models.Customers.find({
        _id: { $in: customerIds },
      });

      for (const customer of customers) {
        customerFields.integrationId = customer.integrationId;

        // merge custom fields data
        customFieldsData = [
          ...customFieldsData,
          ...(customer.customFieldsData || []),
        ];

        // Merging scopeBrandIds
        scopeBrandIds = [...scopeBrandIds, ...(customer.scopeBrandIds || [])];

        const customerTags: string[] = customer.tagIds || [];

        // Merging customer's tag and companies into 1 array
        tagIds = tagIds.concat(customerTags);

        // Merging emails, phones
        emails = [...emails, ...(customer.emails || [])];
        phones = [...phones, ...(customer.phones || [])];

        // Merging customer`s state for new customer
        state = customer.state;

        await models.Customers.findByIdAndUpdate(customer._id, {
          $set: { status: 'deleted' },
        });
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
          state,
        },
        user,
      );

      await models.Conformities.changeConformity({
        type: 'customer',
        newTypeId: customer._id,
        oldTypeIds: customerIds,
      });

      return customer;
    }

    /**
     * Mark customer as active
     */
    public static async markCustomerAsActive(_id: string) {
      await models.Customers.updateOne(
        { _id: _id },
        { $set: { isOnline: true } },
      );

      return models.Customers.findOne({ _id: _id }).lean();
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
            lastSeenAt: new Date(),
          },
        },
        { new: true },
      );

      return models.Customers.findOne({ _id }).lean();
    }

    /*
     * Get widget customer
     */
    public static async getWidgetCustomer({
      integrationId,
      email,
      phone,
      code,
      cachedCustomerId,
    }) {
      let customer: ICustomerDocument | null = null;

      const defaultFilter = { status: { $ne: 'deleted' } };

      if (cachedCustomerId) {
        customer = await models.Customers.findOne({
          ...defaultFilter,
          _id: cachedCustomerId,
        }).lean();
      }

      if (!customer && email) {
        customer = await models.Customers.findOne({
          ...defaultFilter,
          $or: [{ emails: { $in: [email] } }, { primaryEmail: email }],
        }).lean();
      }

      if (!customer && phone) {
        customer = await models.Customers.findOne({
          ...defaultFilter,
          $or: [{ phones: { $in: [phone] } }, { primaryPhone: phone }],
        }).lean();
      }

      if (!customer && code) {
        customer = await models.Customers.findOne({
          ...defaultFilter,
          code,
        }).lean();
      }

      if (customer) {
        const ids = customer.relatedIntegrationIds;

        if (integrationId && ids && !ids.includes(integrationId)) {
          ids.push(integrationId);

          await models.Customers.updateOne(
            { _id: customer._id },
            { $set: { relatedIntegrationIds: ids } },
          );

          customer = await models.Customers.findOne({
            _id: customer._id,
          }).lean();
        }
      }

      return customer;
    }

    /*
     * Create a new messenger customer
     */
    public static async createMessengerCustomer({
      doc,
      customData,
    }: ICreateMessengerCustomerParams) {
      this.fixListFields(doc, customData);

      return this.createCustomer({
        ...doc,
        customFieldsData: customData,
        lastSeenAt: new Date(),
        isOnline: true,
        sessionCount: 1,
      });
    }

    /*
     * Update messenger customer
     */
    public static async updateMessengerCustomer({
      _id,
      doc,
      customData,
    }: IUpdateMessengerCustomerParams) {
      const customer = await models.Customers.getCustomer(_id);

      this.fixListFields(doc, customData, customer);

      const modifier: any = {
        ...doc,
        state: doc.isUser ? 'customer' : customer.state,
        updatedAt: new Date(),
      };

      if (customData && customData.length > 0) {
        modifier.customFieldsData = customData;
      }

      await models.Customers.updateOne({ _id }, { $set: modifier });

      const updateCustomer = await models.Customers.getCustomer(_id);

      const pssDoc = models.Customers.calcPSS(updateCustomer);

      await models.Customers.updateOne({ _id }, { $set: pssDoc });

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: { ...pssDoc, ...modifier },
        prevDocument: customer.toObject(),
      });

      return models.Customers.findOne({ _id });
    }

    public static customerFieldNames() {
      const names: string[] = [];

      customerSchema.eachPath((name) => {
        names.push(name);

        const path = customerSchema.paths[name];

        if (path.schema) {
          path.schema.eachPath((subName) => {
            names.push(`${name}.${subName}`);
          });
        }
      });

      return names;
    }

    /*
     * If customer is a visitor then we will contact with this customer using
     * this information later
     */
    public static async saveVisitorContactInfo(
      args: IVisitorContactInfoParams,
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
            $push: { emails: value },
          },
        );

        webhookData.newData = { email: value };
      }

      if (type === 'phone') {
        await models.Customers.updateOne(
          { _id: customerId },
          {
            $set: { 'visitorContactInfo.phone': value },
            $push: { phones: value },
          },
        );

        webhookData.newData = { phone: value };
      }

      customer = await models.Customers.getCustomer(customerId);

      webhookData.updatedDocument = customer;

      const pssDoc = models.Customers.calcPSS(customer);

      await models.Customers.updateOne({ _id: customerId }, { $set: pssDoc });

      const updatedCustomer = await models.Customers.getCustomer(customerId);
      if (updatedCustomer) {
        sendDbEventLog({
          action: 'update',
          docId: customerId,
          currentDocument: updatedCustomer.toObject(),
          prevDocument: customer.toObject(),
        });
      }
      return updatedCustomer;
    }

    public static async updateVerificationStatus(
      customerIds: string[],
      type: string,
      status: string,
    ) {
      const set: any =
        type !== 'email'
          ? { phoneValidationStatus: status }
          : { emailValidationStatus: status };

      await models.Customers.updateMany(
        { _id: { $in: customerIds } },
        { $set: set },
      );
      const updatedCustomers = await models.Customers.find({
        _id: { $in: customerIds },
      });
      sendDbEventLog({
        action: 'updateMany',
        docIds: customerIds,
        updateDescription: set,
      });
      return updatedCustomers;
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
          isOnline: true,
        },
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
          $set: { state: value },
        },
      );

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: { state: value },
      });

      return models.Customers.findOne({ _id });
    }

    /*
     * Update customer's location info
     */
    public static async updateLocation(_id: string, browserInfo: IBrowserInfo) {
      await models.Customers.findByIdAndUpdate(
        { _id },
        {
          $set: { location: browserInfo },
        },
      );

      return models.Customers.findOne({ _id });
    }

    public static fixListFields(
      doc: any,
      customData = {},
      customer?: ICustomerDocument,
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

    /**
     * Calc customer profileScore, searchText and state
     */
    public static calcPSS(customer: ICustomerDocument) {
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

      if (!nullValues.includes(customer.middleName || '')) {
        score += 5;
        possibleLead = true;
        searchText = searchText.concat(' ', customer.middleName || '');
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

        if (!customer.emails?.includes(customer.primaryEmail || '')) {
          searchText = searchText.concat(' ', customer.primaryEmail || '');
        }
      }

      if (!nullValues.includes(customer.primaryPhone || '')) {
        possibleLead = true;
        score += 10;

        if (!customer.phones?.includes(customer.primaryPhone || '')) {
          searchText = searchText.concat(' ', customer.primaryPhone || '');
        }
      }

      if (customer.visitorContactInfo != null) {
        possibleLead = true;
        score += 5;

        searchText = searchText.concat(
          ' ',
          customer.visitorContactInfo.email || '',
          ' ',
          customer.visitorContactInfo.phone || '',
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
     * Checking if customer has duplicated unique properties
     */
    public static async checkDuplication(
      customerFields: {
        primaryEmail?: string;
        primaryPhone?: string;
        code?: string;
      },
      idsToExclude?: string[] | string,
    ) {
      const query: { [key: string]: any } = {
        status: { $ne: 'deleted' },
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
          primaryEmail: customerFields.primaryEmail,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }
      }

      if (customerFields.primaryPhone) {
        // check duplication from primaryPhone
        previousEntry = await models.Customers.find({
          ...query,
          primaryPhone: customerFields.primaryPhone,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated phone');
        }
      }

      if (customerFields.code) {
        // check duplication from code
        previousEntry = await models.Customers.find({
          ...query,
          code: customerFields.code,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated code');
        }
      }
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
