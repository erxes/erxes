import { Model } from 'mongoose';
import { callHistorySchema } from '../definitions/histories';
import { IUser, IUserDocument } from 'erxes-api-shared/core-types';
import {
  ICallHistory,
  ICallHistoryDocument,
  ICallHistoryFilterOptions,
} from '@/integrations/call/@types/histories';
import { IModels } from '~/connectionResolvers';

/**
 * Interface for Call History Model with enhanced type safety
 */
export interface ICallHistoryModel extends Model<ICallHistoryDocument> {
  getCallHistory(history: ICallHistory): Promise<ICallHistoryDocument | null>;
  getCallHistories(
    filterOptions: ICallHistoryFilterOptions,
    user: IUser,
  ): Promise<ICallHistoryDocument[]>;
  getHistoriesCount(
    filterOptions: ICallHistoryFilterOptions,
    user: IUser,
  ): Promise<number>;
}

const CALL_HISTORY_CONSTANTS = {
  DEFAULT_LIMIT: 20,
  DEFAULT_SKIP: 0,
  DEFAULT_RECENT_LIMIT: 10,
  MAX_EXPORT_LIMIT: 10000,
  ARCHIVE_BATCH_SIZE: 1000,
  CALL_TYPES: {
    OUTGOING: 'outgoing',
    INCOMING: 'incoming',
  },
  CALL_STATUS: {
    CANCELLED: 'cancelled',
    MISSED: 'missed',
    CONNECTED: 'connected',
  },
  DURATION_THRESHOLDS: {
    SHORT_CALL: 60, // 1 minute
    LONG_CALL: 1800, // 30 minutes
  },
} as const;

const ERROR_MESSAGES = {
  INTEGRATION_NOT_FOUND: 'Integration not found',
  OPERATOR_NOT_FOUND: 'Operator not found',
  INVALID_CALL_HISTORY_PARAMS: 'Invalid call history parameters',
  CALL_HISTORY_NOT_FOUND: 'Call history record not found',
  UNAUTHORIZED_ACCESS: 'Unauthorized access to call history',
  INVALID_DATE_RANGE: 'Invalid date range provided',
  EXPORT_LIMIT_EXCEEDED: 'Export limit exceeded',
  BULK_DELETE_LIMIT_EXCEEDED: 'Bulk delete limit exceeded',
  INVALID_DURATION_RANGE: 'Invalid duration range provided',
} as const;

export const loadCallHistoryClass = (models: IModels) => {
  class CallHistory {
    public static async getCallHistory({
      _id,
      callType,
      timeStamp,
    }: ICallHistoryDocument): Promise<ICallHistoryDocument | null> {
      try {
        if (!_id && !timeStamp) {
          throw new Error(ERROR_MESSAGES.INVALID_CALL_HISTORY_PARAMS);
        }

        if (callType === CALL_HISTORY_CONSTANTS.CALL_TYPES.OUTGOING && _id) {
          return await models.CallHistory.findById(_id);
        }

        if (timeStamp) {
          return await models.CallHistory.findOne({ timeStamp });
        }

        return null;
      } catch (error) {
        console.error('Error retrieving call history:', error);
        throw error;
      }
    }

    public static async getHistoriesCount(
      filterOptions: ICallHistoryFilterOptions,
      user: IUserDocument,
    ): Promise<number> {
      try {
        const { integration, operator } = await this.validateUserIntegration(
          models,
          user,
          filterOptions.integrationId,
        );

        const pipeline = this.buildCdrPipeline(
          operator,
          integration,
          filterOptions,
          {
            forCount: true,
          },
        );

        const [row] = await models.CallCdrs.aggregate(pipeline).allowDiskUse(
          true,
        );

        return row?.n || 0;
      } catch (error) {
        console.error('Error counting call histories:', error);
        throw error;
      }
    }

    private static async validateUserIntegration(
      models: IModels,
      user: IUserDocument,
      integrationId: string,
    ) {
      const integration = await models.CallIntegrations.getIntegration(
        user?._id,
        integrationId,
      );

      if (!integration) {
        throw new Error(ERROR_MESSAGES.INTEGRATION_NOT_FOUND);
      }

      const operator = integration.operators.find(
        (op) => op.userId === user?._id,
      );

      if (!operator) {
        throw new Error(ERROR_MESSAGES.OPERATOR_NOT_FOUND);
      }

      return { integration, operator };
    }

    private static buildCdrPipeline(
      operator: any,
      integration: any,
      filterOptions: ICallHistoryFilterOptions,
      { forCount }: { forCount?: boolean } = {},
    ): any[] {
      const ext = operator?.gsUsername ? String(operator.gsUsername) : '';
      const integrationId = filterOptions.integrationId;

      const extVals: (string | number)[] = /^\d+$/.test(ext)
        ? [ext, Number(ext)]
        : [ext];

      const involvement: any[] = ext
        ? [
            { dstchannelExt: { $in: extVals } },
            { dstanswer: { $in: extVals } },
            { userfield: 'Outbound', src: { $in: extVals } },
          ]
        : [];

      const match: any = involvement.length
        ? { $or: involvement }
        : { _id: null };
      if (integrationId && involvement.length) {
        match.inboxIntegrationId = integrationId;
      }

      const pipeline: any[] = [
        { $match: match },
        {
          $addFields: {
            _answeredByMe: {
              $and: [
                {
                  $eq: [
                    { $toUpper: { $ifNull: ['$disposition', ''] } },
                    'ANSWERED',
                  ],
                },
                { $gt: [{ $ifNull: ['$billsec', 0] }, 0] },
                { $in: ['$lastapp', ['Queue', 'Dial']] },
                {
                  $or: [
                    { $in: ['$dstanswer', extVals] },
                    {
                      $and: [
                        { $eq: ['$userfield', 'Outbound'] },
                        { $in: ['$src', extVals] },
                      ],
                    },
                  ],
                },
              ],
            },
            _customerPhone: {
              $toString: {
                $cond: [{ $eq: ['$userfield', 'Inbound'] }, '$src', '$dst'],
              },
            },
          },
        },
        { $sort: { uniqueid: 1, _answeredByMe: -1, billsec: -1, start: 1 } },
        {
          $group: {
            _id: '$uniqueid',
            userfield: { $first: '$userfield' },
            customerPhone: { $first: '$_customerPhone' },
            conversationId: { $first: '$conversationId' },
            recordUrl: { $max: { $ifNull: ['$recordUrl', ''] } },
            billsec: { $max: { $ifNull: ['$billsec', 0] } },
            anyAnswered: { $max: { $cond: ['$_answeredByMe', 1, 0] } },
            start: { $min: '$start' },
            end: { $max: '$end' },
            createdAt: { $min: '$createdAt' },
            modifiedAt: { $max: '$updatedAt' },
            inboxIntegrationId: { $first: '$inboxIntegrationId' },
          },
        },
        {
          $addFields: {
            isAnswered: { $gt: ['$anyAnswered', 0] },
            callType: {
              $cond: [
                { $eq: ['$userfield', 'Inbound'] },
                'incoming',
                'outgoing',
              ],
            },
          },
        },
        {
          $addFields: {
            callStatus: { $cond: ['$isAnswered', 'connected', 'cancelled'] },
          },
        },
      ];

      const { callStatus, callType, searchValue } = filterOptions;

      if (
        callStatus === CALL_HISTORY_CONSTANTS.CALL_STATUS.CANCELLED ||
        callStatus === CALL_HISTORY_CONSTANTS.CALL_STATUS.MISSED
      ) {
        pipeline.push({ $match: { isAnswered: false } });
      } else if (callStatus === CALL_HISTORY_CONSTANTS.CALL_STATUS.CONNECTED) {
        pipeline.push({ $match: { isAnswered: true } });
      }

      if (callType) {
        pipeline.push({ $match: { callType } });
      }

      if (searchValue) {
        const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pipeline.push({
          $match: { customerPhone: { $regex: escaped, $options: 'i' } },
        });
      }

      if (forCount) {
        pipeline.push({ $count: 'n' });
        return pipeline;
      }

      const operatorPhone = integration?.phone || '';
      pipeline.push(
        { $sort: { start: -1 } },
        { $skip: filterOptions.skip || CALL_HISTORY_CONSTANTS.DEFAULT_SKIP },
        { $limit: filterOptions.limit || CALL_HISTORY_CONSTANTS.DEFAULT_LIMIT },
        {
          $project: {
            _id: 1,
            uniqueid: '$_id',
            operatorPhone: { $literal: operatorPhone },
            customerPhone: 1,
            // Missed calls have no talk time, even if an IVR leg reported billsec.
            callDuration: { $cond: ['$isAnswered', '$billsec', 0] },
            callStartTime: '$start',
            callEndTime: '$end',
            callType: 1,
            callStatus: 1,
            timeStamp: {
              $cond: ['$start', { $divide: [{ $toLong: '$start' }, 1000] }, 0],
            },
            modifiedAt: 1,
            createdAt: 1,
            extensionNumber: { $literal: ext },
            conversationId: 1,
            recordUrl: 1,
            inboxIntegrationId: 1,
          },
        },
      );

      return pipeline;
    }

    public static async getCallHistories(
      filterOptions: ICallHistoryFilterOptions,
      user: IUserDocument,
    ): Promise<(Partial<ICallHistory> & { _id: string })[]> {
      try {
        const { integration, operator } = await this.validateUserIntegration(
          models,
          user,
          filterOptions.integrationId,
        );

        const pipeline = this.buildCdrPipeline(
          operator,
          integration,
          filterOptions,
        );

        return models.CallCdrs.aggregate(pipeline).allowDiskUse(true);
      } catch (error) {
        console.error('Error retrieving call histories:', error);
        throw error;
      }
    }
  }

  callHistorySchema.loadClass(CallHistory);

  return callHistorySchema;
};
