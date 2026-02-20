import moment from 'moment-timezone';

import { Model, Query } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IIntegration,
  IIntegrationDocument,
  ILeadData,
  IMessengerData,
  IUiOptions,
  ITicketData,
} from '@/inbox/@types/integrations';
import { integrationSchema } from '@/inbox/db/definitions/integrations';
export interface IMessengerIntegration {
  kind: string;
  name: string;
  integrationId: string;
  languageCode: string;
  channelId: string;
}

export interface IExternalIntegrationParams {
  kind: string;
  name: string;
  brandId: string;
  accountId: string;
  channelId: string;
}

interface IIntegrationBasicInfo {
  name: string;
  brandId: string;
}

/**
 * Extracts hour & minute from time string formatted as "HH:mm am|pm".
 * Time string is defined as constant in modules/settings/add-ons/constants.
 */
const getHourAndMinute = (timeString: string) => {
  const normalized = timeString.toLowerCase().trim();
  const colon = normalized.indexOf(':');
  let hour = Number.parseInt(normalized.substring(0, colon), 10);
  const minute = Number.parseInt(normalized.substring(colon + 1, colon + 3), 10);

  const isPM = normalized.includes('pm');
  const isAM = normalized.includes('am');

  if (isPM && hour !== 12) {
    hour += 12;
  } else if (isAM && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
};

export const isTimeInBetween = (
  timezone: string,
  date: Date,
  startTime: string,
  closeTime: string,
): boolean => {
  const tz = timezone || moment.tz.guess();
  const now = moment(date).tz(tz);

  const start = getHourAndMinute(startTime);
  const startDate = moment(now).hours(start.hour).minutes(start.minute);

  const end = getHourAndMinute(closeTime);
  const closeDate = moment(now).hours(end.hour).minutes(end.minute);

  return now.isBetween(startDate, closeDate);
};

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(doc: { [key: string]: any }): Promise<IIntegrationDocument>;
  findIntegrations(
    query: any,
    options?: any,
  ): Query<IIntegrationDocument[], IIntegrationDocument>;
  findAllIntegrations(
    query: any,
    options?: any,
  ): Query<IIntegrationDocument[], IIntegrationDocument>;
  findLeadIntegrations(
    query: any,
    args: any,
  ): Query<IIntegrationDocument[], IIntegrationDocument>;
  createIntegration(
    doc: IIntegration,
    userId: string,
  ): Promise<IIntegrationDocument>;
  createMessengerIntegration(
    doc: IIntegration,
    userId: string,
  ): Promise<IIntegrationDocument>;
  updateMessengerIntegration(
    _id: string,
    doc: IIntegration,
  ): Promise<IIntegrationDocument>;
  integrationsSaveMessengerTicketData(
    _id: string,
    configId: string,
  ): Promise<IIntegrationDocument>;
  saveMessengerAppearanceData(
    _id: string,
    doc: IUiOptions,
  ): Promise<IIntegrationDocument>;
  saveMessengerColorTheme(
    _id: string,
    colorTheme: any,
  ): Promise<IIntegrationDocument>;
  saveMessengerConfigs(
    _id: string,
    messengerData: IMessengerData,
  ): Promise<IIntegrationDocument>;
  createLeadIntegration(
    doc: IIntegration,
    userId: string,
  ): Promise<IIntegrationDocument>;
  updateLeadIntegration(
    _id: string,
    doc: IIntegration,
  ): Promise<IIntegrationDocument>;
  createExternalIntegration(
    doc: IExternalIntegrationParams,
    userId: string,
  ): Promise<IIntegrationDocument>;
  removeIntegration(_id: string): Promise<void>;
  removeIntegrations(_ids: string[]): Promise<void>;
  updateBasicInfo(
    _id: string,
    doc: IIntegrationBasicInfo,
  ): Promise<IIntegrationDocument>;

  getWidgetIntegration(
    brandCode: string,
    kind: string,
    brandObject?: boolean,
  ): any;
  increaseViewCount(
    formId: string,
    get?: boolean,
  ): Promise<IIntegrationDocument>;
  increaseContactsGathered(
    formId: string,
    get?: boolean,
  ): Promise<IIntegrationDocument>;
  isOnline(
    integration: Pick<IIntegration, 'messengerData'>,
    userTimezone?: string,
  ): boolean;
  duplicateLeadIntegration(
    _id: string,
    userId: string,
  ): Promise<IIntegrationDocument>;
}

export const loadClass = (models: IModels, subdomain: string) => {
  class Integration {
    /**
     * Retrieves integration
     */
    public static async getIntegration(doc: any) {
      const integration = await models.Integrations.findOne(doc);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }

    /**
     * Find integrations
     */
    public static findIntegrations(query, options) {
      return models.Integrations.find(
        { ...query, isActive: { $ne: false } },
        options,
      );
    }

    public static findAllIntegrations(query: any, options: any) {
      return models.Integrations.find({ ...query }, options);
    }

    /**
     * Find form integrations
     */
    public static async findLeadIntegrations(query: any, args: any) {
      const {
        sortField = 'createdDate',
        sortDirection = -1,
        page = 1,
        perPage = 20,
      } = args;

      return models.Integrations.aggregate([
        { $match: query },
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
            createdDate: '$form.createdDate',
          },
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
                        '$leadData.viewCount',
                      ],
                    },
                  ],
                },
                100,
              ],
            },
          },
        },
        { $sort: { [sortField]: sortDirection } },
        { $skip: perPage * (page - 1) },
        { $limit: perPage },
      ]);
    }

    /**
     * Create an integration, intended as a private method
     */
    public static createIntegration(doc: IIntegration, userId: string) {
      return models.Integrations.create({
        ...doc,
        isActive: true,
        createdUserId: userId,
        createdAt: new Date(),
      });
    }

    /**
     * Create a messenger kind integration
     */
    public static async createMessengerIntegration(
      doc: IMessengerIntegration,
      userId: string,
    ) {
      const integration = await models.Integrations.findOne({
        kind: 'messenger',
        _id: doc.integrationId,
      });

      if (integration) {
        throw new Error('Duplicated messenger');
      }

      return this.createIntegration(
        { ...doc, kind: 'messenger', channelId: doc.channelId || '' },
        userId,
      );
    }

    /**
     * Update messenger integration document
     */
    public static async updateMessengerIntegration(
      _id: string,
      doc: IMessengerIntegration,
    ) {
      await models.Integrations.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true },
      );

      return models.Integrations.findOne({ _id });
    }

    public static async integrationsSaveMessengerTicketData(
      _id: string,
      configId: string,
    ) {
      const integration = await models.Integrations.findOne({
        _id: _id,
      });
      if (!integration) {
        throw new Error('Integration not found');
      }
      const config = await models.TicketConfig.findOne({ _id: configId });
      if (!config) {
        throw new Error('Config not found');
      }
      const result = await models.Integrations.updateOne(
        { _id },
        {
          $set: {
            ticketConfigId: configId,
          },
        },
        { runValidators: true },
      );

      if (!result.acknowledged) {
        throw new Error('Failed to update ticket data');
      }

      return models.Integrations.findOne({ _id });
    }

    /**
     * Save messenger appearance data
     */
    public static async saveMessengerAppearanceData(
      _id: string,
      { logo, primary }: IUiOptions,
    ) {
      await models.Integrations.updateOne(
        { _id },
        { $set: { uiOptions: { logo, primary } } },
        { runValidators: true },
      );

      return models.Integrations.findOne({ _id });
    }

    /**
     * Save messenger color theme data
     */
    public static async saveMessengerColorTheme(_id: string, colorTheme: any) {
      await models.Integrations.updateOne(
        { _id },
        { $set: { uiOptions: colorTheme } },
        { runValidators: true },
      );

      return models.Integrations.findOne({ _id });
    }

    /**
     * Saves messenger data to integration document
     */
    public static async saveMessengerConfigs(
      _id: string,
      messengerData: IMessengerData,
    ) {
      await models.Integrations.updateOne({ _id }, { $set: { messengerData } });
      return models.Integrations.findOne({ _id });
    }

    /**
     * Create a lead kind integration
     */
    public static createLeadIntegration(
      { leadData = {}, ...mainDoc }: IIntegration,
      userId: string,
    ) {
      const doc = { ...mainDoc, kind: 'lead' };

      return models.Integrations.createIntegration(doc, userId);
    }

    /**
     * Create external integrations like twitter
     */
    public static createExternalIntegration(
      doc: IExternalIntegrationParams,
      userId: string,
    ): Promise<IIntegrationDocument> {
      return models.Integrations.createIntegration(
        { ...doc, channelId: doc.channelId || '' },
        userId,
      );
    }

    /**
     * Update lead integration
     */
    public static async updateLeadIntegration(
      _id: string,
      { leadData = {}, ...mainDoc }: IIntegration,
    ) {
      const prevEntry = await models.Integrations.getIntegration({ _id });
      const prevLeadData: ILeadData = prevEntry.leadData || {};

      const doc = {
        ...mainDoc,
        kind: 'lead',
        leadData: {
          ...leadData,
          viewCount: prevLeadData.viewCount,
          contactsGathered: prevLeadData.contactsGathered,
        },
      };

      await models.Integrations.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true },
      );

      return models.Integrations.findOne({ _id });
    }

    /**
     * Remove integration in addition with its messages, conversations, customers
     */
    public static async removeIntegration(_id: string) {
      return models.Integrations.deleteMany({ _id });
    }

    public static async removeIntegrations(_ids: string[]) {
      return models.Integrations.deleteMany({ _id: { $in: _ids } });
    }

    public static async updateBasicInfo(
      _id: string,
      doc: IIntegrationBasicInfo,
    ) {
      await models.Integrations.updateOne({ _id }, { $set: doc });

      return models.Integrations.findOne({ _id });
    }

    public static async getWidgetIntegration(
      brandCode: string,
      kind: string,
      brandObject = false,
    ) {
      const integration = await models.Integrations.getIntegration({
        kind,
      });

      return integration;
    }

    public static async increaseViewCount(formId: string, get = false) {
      const response = await models.Integrations.updateOne(
        { formId, leadData: { $exists: true } },
        { $inc: { 'leadData.viewCount': 1 } },
      );
      return get ? models.Integrations.findOne({ formId }) : response;
    }

    /*
     * Increase form submitted count
     */
    public static async increaseContactsGathered(formId: string, get = false) {
      const response = await models.Integrations.updateOne(
        { formId, leadData: { $exists: true } },
        { $inc: { 'leadData.contactsGathered': 1 } },
      );
      return get ? models.Integrations.findOne({ formId }) : response;
    }

    public static async duplicateLeadIntegration(id: string, userId: string) {
      const sourceIntegration = await models.Integrations.findOne({
        _id: id,
        kind: 'lead',
      }).lean();
      if (!sourceIntegration) {
        throw new Error('Lead integration not found');
      }
      const { _id, ...rest } = sourceIntegration;

      const newIntegration = await models.Integrations.createLeadIntegration(
        rest,
        userId,
      );

      const channelIds = await models.Channels.find(
        { integrationIds: { $in: [id] } },
        { _id: 1 },
      ).lean();

      if (channelIds.length > 0) {
        await models.Channels.updateMany(
          { _id: { $in: channelIds } },
          { $push: { integrationIds: newIntegration._id } },
        );
      }

      return newIntegration;
    }

    public static isOnline(
      integration: Pick<IIntegration, 'messengerData'>,
      userTimezone?: string,
    ) {
      const now = new Date();

      const daysAsString = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];

      const isWeekday = (d: string): boolean => {
        return [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
        ].includes(d);
      };

      const isWeekend = (d: string): boolean => {
        return ['saturday', 'sunday'].includes(d);
      };

      if (!integration.messengerData) {
        return false;
      }

      const { messengerData } = integration;
      const {
        availabilityMethod,
        onlineHours = [],
        timezone = '',
      } = messengerData;
      const timezoneString = userTimezone || timezone || moment.tz.guess();
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
      const everydayConf = onlineHours.find((c) => c.day === 'everyday');

      if (everydayConf) {
        return isTimeInBetween(
          timezoneString,
          now,
          everydayConf.from || '',
          everydayConf.to || '',
        );
      }

      // check by weekdays config
      const weekdaysConf = onlineHours.find((c) => c.day === 'weekdays');

      if (weekdaysConf && isWeekday(day)) {
        return isTimeInBetween(
          timezoneString,
          now,
          weekdaysConf.from || '',
          weekdaysConf.to || '',
        );
      }

      // check by weekends config
      const weekendsConf = onlineHours.find((c) => c.day === 'weekends');

      if (weekendsConf && isWeekend(day)) {
        return isTimeInBetween(
          timezoneString,
          now,
          weekendsConf.from || '',
          weekendsConf.to || '',
        );
      }

      // check by regular day config
      const dayConf = onlineHours.find((c) => c.day === day);

      if (dayConf) {
        return isTimeInBetween(
          timezoneString,
          now,
          dayConf.from || '',
          dayConf.to || '',
        );
      }

      return false;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
