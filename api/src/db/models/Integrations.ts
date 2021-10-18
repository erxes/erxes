import * as momentTz from 'moment-timezone';
import { Model, model, Query } from 'mongoose';
import 'mongoose-type-email';
import {
  Brands,
  ConversationMessages,
  Conversations,
  Customers,
  Forms
} from '.';
import { KIND_CHOICES } from './definitions/constants';
import {
  IBookingData,
  IIntegration,
  IIntegrationDocument,
  ILeadData,
  IMessengerData,
  integrationSchema,
  IUiOptions
} from './definitions/integrations';

export interface IMessengerIntegration {
  kind: string;
  name: string;
  brandId: string;
  languageCode: string;
  channelIds?: string[];
}

export interface IExternalIntegrationParams {
  kind: string;
  name: string;
  brandId: string;
  accountId: string;
  channelIds?: string[];
}

interface IIntegrationBasicInfo {
  name: string;
  brandId: string;
}

/**
 * Extracts hour & minute from time string formatted as "HH:mm am|pm".
 * Time string is defined as constant in modules/settings/integrations/constants.
 */
const getHourAndMinute = (timeString: string) => {
  const normalized = timeString.toLowerCase().trim();
  const colon = timeString.indexOf(':');
  let hour = parseInt(normalized.substring(0, colon), 10);
  const minute = parseInt(normalized.substring(colon + 1, colon + 3), 10);

  if (normalized.indexOf('pm') !== -1) {
    hour += 12;
  }

  return { hour, minute };
};

export const isTimeInBetween = (
  timezone: string,
  date: Date,
  startTime: string,
  closeTime: string
): boolean => {
  // date of given timezone
  const now = momentTz(date).tz(timezone);

  const start = getHourAndMinute(startTime);
  const startDate: any = momentTz(now);

  startDate.hours(start.hour);
  startDate.minutes(start.minute);

  const end = getHourAndMinute(closeTime);
  const closeDate: any = momentTz(now);

  closeDate.hours(end.hour);
  closeDate.minutes(end.minute);

  return now.isBetween(startDate, closeDate);
};

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(doc: { [key: string]: any }): IIntegrationDocument;
  findIntegrations(query: any, options?: any): Query<IIntegrationDocument[]>;
  findAllIntegrations(query: any, options?: any): Query<IIntegrationDocument[]>;
  findLeadIntegrations(query: any, args: any): Query<IIntegrationDocument[]>;
  createIntegration(
    doc: IIntegration,
    userId: string
  ): Promise<IIntegrationDocument>;
  createMessengerIntegration(
    doc: IIntegration,
    userId: string
  ): Promise<IIntegrationDocument>;
  updateMessengerIntegration(
    _id: string,
    doc: IIntegration
  ): Promise<IIntegrationDocument>;
  saveMessengerAppearanceData(
    _id: string,
    doc: IUiOptions
  ): Promise<IIntegrationDocument>;
  saveMessengerConfigs(
    _id: string,
    messengerData: IMessengerData
  ): Promise<IIntegrationDocument>;
  createLeadIntegration(
    doc: IIntegration,
    userId: string
  ): Promise<IIntegrationDocument>;
  updateLeadIntegration(
    _id: string,
    doc: IIntegration
  ): Promise<IIntegrationDocument>;
  createExternalIntegration(
    doc: IExternalIntegrationParams,
    userId: string
  ): Promise<IIntegrationDocument>;
  removeIntegration(_id: string): void;
  updateBasicInfo(
    _id: string,
    doc: IIntegrationBasicInfo
  ): Promise<IIntegrationDocument>;

  getWidgetIntegration(
    brandCode: string,
    kind: string,
    brandObject?: boolean
  ): any;
  increaseViewCount(
    formId: string,
    get?: boolean
  ): Promise<IIntegrationDocument>;
  increaseContactsGathered(
    formId: string,
    get?: boolean
  ): Promise<IIntegrationDocument>;
  isOnline(integration: IIntegrationDocument, now?: Date): boolean;
  createBookingIntegration(
    doc: IIntegration,
    userId: string
  ): Promise<IIntegrationDocument>;
  updateBookingIntegration(
    _id: string,
    doc: IIntegration
  ): Promise<IIntegrationDocument>;
  increaseBookingViewCount(_id: string): Promise<IIntegrationDocument>;
}

export const loadClass = () => {
  class Integration {
    /**
     * Retreives integration
     */
    public static async getIntegration(doc: any) {
      const integration = await Integrations.findOne(doc);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }

    /**
     * Find integrations
     */
    public static findIntegrations(query, options) {
      return Integrations.find({ ...query, isActive: { $ne: false } }, options);
    }

    public static findAllIntegrations(query: any, options: any) {
      return Integrations.find({ ...query }, options);
    }

    /**
     * Find form integrations
     */
    public static findLeadIntegrations(query: any, args: any) {
      const {
        sortField = 'createdDate',
        sortDirection = -1,
        page = 1,
        perPage = 20
      } = args;

      return Integrations.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'forms',
            localField: 'formId',
            foreignField: '_id',
            as: 'form'
          }
        },
        { $unwind: '$form' },
        {
          $project: {
            isActive: 1,
            name: 1,
            brandId: 1,
            tagIds: 1,
            formId: 1,
            kind: 1,
            leadData: 1,
            createdUserId: 1,
            createdDate: '$form.createdDate'
          }
        },
        {
          $addFields: {
            'leadData.conversionRate': {
              $multiply: [
                {
                  $cond: [
                    { $eq: ['$leadData.viewCount', 0] },
                    0,
                    {
                      $divide: [
                        '$leadData.contactsGathered',
                        '$leadData.viewCount'
                      ]
                    }
                  ]
                },
                100
              ]
            }
          }
        },
        { $sort: { [sortField]: sortDirection } },
        { $skip: perPage * (page - 1) },
        { $limit: perPage }
      ]);
    }

    /**
     * Create an integration, intended as a private method
     */
    public static createIntegration(doc: IIntegration, userId: string) {
      return Integrations.create({
        ...doc,
        isActive: true,
        createdUserId: userId
      });
    }

    /**
     * Create a messenger kind integration
     */
    public static async createMessengerIntegration(
      doc: IMessengerIntegration,
      userId: string
    ) {
      const integration = await Integrations.findOne({
        kind: KIND_CHOICES.MESSENGER,
        brandId: doc.brandId
      });

      if (integration) {
        throw new Error('Duplicated messenger for single brand');
      }

      return this.createIntegration(
        { ...doc, kind: KIND_CHOICES.MESSENGER },
        userId
      );
    }

    /**
     * Update messenger integration document
     */
    public static async updateMessengerIntegration(
      _id: string,
      doc: IMessengerIntegration
    ) {
      const integration = await Integrations.findOne({
        _id: { $ne: _id },
        kind: KIND_CHOICES.MESSENGER,
        brandId: doc.brandId
      });

      if (integration) {
        throw new Error('Duplicated messenger for single brand');
      }

      await Integrations.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return Integrations.findOne({ _id });
    }

    /**
     * Save messenger appearance data
     */
    public static async saveMessengerAppearanceData(
      _id: string,
      { color, wallpaper, logo, textColor }: IUiOptions
    ) {
      await Integrations.updateOne(
        { _id },
        { $set: { uiOptions: { color, wallpaper, logo, textColor } } },
        { runValdatiors: true }
      );

      return Integrations.findOne({ _id });
    }

    /**
     * Saves messenger data to integration document
     */
    public static async saveMessengerConfigs(
      _id: string,
      messengerData: IMessengerData
    ) {
      await Integrations.updateOne({ _id }, { $set: { messengerData } });
      return Integrations.findOne({ _id });
    }

    /**
     * Create a lead kind integration
     */
    public static createLeadIntegration(
      { leadData = {}, ...mainDoc }: IIntegration,
      userId: string
    ) {
      const doc = { ...mainDoc, kind: KIND_CHOICES.LEAD, leadData };

      if (Object.keys(leadData).length === 0) {
        throw new Error('leadData must be supplied');
      }

      return Integrations.createIntegration(doc, userId);
    }

    /**
     * Create external integrations like facebook, twitter integration
     */
    public static createExternalIntegration(
      doc: IExternalIntegrationParams,
      userId: string
    ): Promise<IIntegrationDocument> {
      return Integrations.createIntegration(doc, userId);
    }

    /**
     * Update lead integration
     */
    public static async updateLeadIntegration(
      _id: string,
      { leadData = {}, ...mainDoc }: IIntegration
    ) {
      const prevEntry = await Integrations.getIntegration({ _id });
      const prevLeadData: ILeadData = prevEntry.leadData || {};

      const doc = {
        ...mainDoc,
        kind: KIND_CHOICES.LEAD,
        leadData: {
          ...leadData,
          viewCount: prevLeadData.viewCount,
          contactsGathered: prevLeadData.contactsGathered
        }
      };

      await Integrations.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return Integrations.findOne({ _id });
    }

    /**
     * Remove integration in addition with its messages, conversations, customers
     */
    public static async removeIntegration(_id: string) {
      const integration = await Integrations.getIntegration({ _id });

      // remove conversations =================
      const conversations = await Conversations.find(
        { integrationId: _id },
        { _id: true }
      );
      const conversationIds = conversations.map(conv => conv._id);

      await ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds }
      });

      await Conversations.deleteMany({ integrationId: _id });

      // Remove customers ==================
      const customers = await Customers.find({ integrationId: _id });
      const customerIds = customers.map(cus => cus._id);

      await Customers.removeCustomers(customerIds);

      // Remove form
      if (integration.formId) {
        await Forms.removeForm(integration.formId);
      }

      return Integrations.deleteMany({ _id });
    }

    public static async updateBasicInfo(
      _id: string,
      doc: IIntegrationBasicInfo
    ) {
      await Integrations.updateOne({ _id }, { $set: doc });

      return Integrations.findOne({ _id });
    }

    public static async getWidgetIntegration(
      brandCode: string,
      kind: string,
      brandObject = false
    ) {
      const brand = await Brands.getBrand({ code: brandCode });

      const integration = await Integrations.getIntegration({
        brandId: brand._id,
        kind
      });

      if (brandObject) {
        return { integration, brand };
      }

      return integration;
    }

    public static async increaseViewCount(formId: string, get = false) {
      const response = await Integrations.updateOne(
        { formId, leadData: { $exists: true } },
        { $inc: { 'leadData.viewCount': 1 } }
      );
      return get ? Integrations.findOne({ formId }) : response;
    }

    /*
     * Increase form submitted count
     */
    public static async increaseContactsGathered(formId: string, get = false) {
      const response = await Integrations.updateOne(
        { formId, leadData: { $exists: true } },
        { $inc: { 'leadData.contactsGathered': 1 } }
      );
      return get ? Integrations.findOne({ formId }) : response;
    }

    public static isOnline(
      integration: IIntegrationDocument,
      now = new Date()
    ) {
      const daysAsString = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ];

      const isWeekday = (d: string): boolean => {
        return [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday'
        ].includes(d);
      };

      const isWeekend = (d: string): boolean => {
        return ['saturday', 'sunday'].includes(d);
      };

      if (!integration.messengerData) {
        return false;
      }

      const { messengerData } = integration;
      const { availabilityMethod, onlineHours = [], timezone } = messengerData;
      const timezoneString = timezone || '';

      /*
       * Manual: We can determine state from isOnline field value when method is manual
       */
      if (availabilityMethod === 'manual') {
        return messengerData.isOnline;
      }

      /*
       * Auto
       */
      const day = daysAsString[now.getDay()];

      // check by everyday config
      const everydayConf = onlineHours.find(c => c.day === 'everyday');

      if (everydayConf) {
        return isTimeInBetween(
          timezoneString,
          now,
          everydayConf.from || '',
          everydayConf.to || ''
        );
      }

      // check by weekdays config
      const weekdaysConf = onlineHours.find(c => c.day === 'weekdays');

      if (weekdaysConf && isWeekday(day)) {
        return isTimeInBetween(
          timezoneString,
          now,
          weekdaysConf.from || '',
          weekdaysConf.to || ''
        );
      }

      // check by weekends config
      const weekendsConf = onlineHours.find(c => c.day === 'weekends');

      if (weekendsConf && isWeekend(day)) {
        return isTimeInBetween(
          timezoneString,
          now,
          weekendsConf.from || '',
          weekendsConf.to || ''
        );
      }

      // check by regular day config
      const dayConf = onlineHours.find(c => c.day === day);

      if (dayConf) {
        return isTimeInBetween(
          timezoneString,
          now,
          dayConf.from || '',
          dayConf.to || ''
        );
      }

      return false;
    }

    /**
     * Create a booking kind integration
     */
    public static createBookingIntegration(
      { bookingData = {}, ...mainDoc }: IIntegration,
      userId: string
    ) {
      const doc = { ...mainDoc, kind: KIND_CHOICES.BOOKING, bookingData };

      if (Object.keys(bookingData).length === 0) {
        throw new Error('bookingData must be supplied');
      }

      return Integrations.createIntegration(doc, userId);
    }

    /**
     * Update booking integration
     */
    public static async updateBookingIntegration(
      _id: string,
      { bookingData = {}, ...mainDoc }: IIntegration
    ) {
      const prevEntry = await Integrations.getIntegration({ _id });
      const prevBookingData: IBookingData = prevEntry.bookingData || {};

      const doc = {
        ...mainDoc,
        kind: KIND_CHOICES.BOOKING,
        bookingData: {
          ...bookingData,
          viewCount: prevBookingData.viewCount
        }
      };

      await Integrations.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return Integrations.findOne({ _id });
    }

    /**
     * Increase booking view count
     */

    public static async increaseBookingViewCount(_id: string) {
      await Integrations.updateOne(
        { _id, bookingData: { $exists: true } },
        { $inc: { 'bookingData.viewCount': 1 } }
      );

      return Integrations.findOne({ _id });
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

loadClass();

// tslint:disable-next-line
const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  'integrations',
  integrationSchema
);

export default Integrations;
