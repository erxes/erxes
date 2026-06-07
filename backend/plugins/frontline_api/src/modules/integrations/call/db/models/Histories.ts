import { Model, FilterQuery } from 'mongoose';
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
        const { operator } = await this.validateUserIntegration(
          models,
          user,
          filterOptions.integrationId,
        );

        const historyFilter = this.buildCountFilter(filterOptions, operator);
        const cdrFilter = this.buildCdrFilter(historyFilter, filterOptions);

        const [cdrCount, historyCount] = await Promise.all([
          models.CallCdrs.countDocuments(cdrFilter),
          models.CallHistory.countDocuments(historyFilter),
        ]);

        return cdrCount + historyCount;
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

    private static buildHistoryFilter(
      filterOptions: ICallHistoryFilterOptions,
      operator: any,
      integration: any,
    ): FilterQuery<ICallHistoryDocument> {
      const filter: FilterQuery<ICallHistoryDocument> = {};

      filter.extensionNumber = operator.gsUsername;

      if (
        filterOptions.callStatus ===
        CALL_HISTORY_CONSTANTS.CALL_STATUS.CANCELLED
      ) {
        filter.callStatus = {
          $eq: CALL_HISTORY_CONSTANTS.CALL_STATUS.CANCELLED,
        };
        delete filter.extensionNumber;
        filter.operatorPhone = integration.phone;
      }

      if (filterOptions.searchValue) {
        filter.customerPhone = {
          $regex: new RegExp(filterOptions.searchValue, 'i'),
        };
      }

      filter.isDeleted = { $ne: true };

      return filter;
    }

    private static buildCountFilter(
      filterOptions: ICallHistoryFilterOptions,
      operator: any,
    ): FilterQuery<ICallHistoryDocument> {
      const filter: FilterQuery<ICallHistoryDocument> = {};

      filter.extensionNumber = operator.gsUsername;

      if (
        filterOptions.callStatus === CALL_HISTORY_CONSTANTS.CALL_STATUS.MISSED
      ) {
        filter.callStatus = {
          $ne: CALL_HISTORY_CONSTANTS.CALL_STATUS.CONNECTED,
        };
      }

      if (filterOptions.searchValue) {
        filter.customerPhone = {
          $regex: new RegExp(filterOptions.searchValue, 'i'),
        };
      }

      filter.isDeleted = { $ne: true };

      return filter;
    }

    public static async getCallHistories(
      filterOptions: ICallHistoryFilterOptions,
      user: IUserDocument,
    ): Promise<CallHistory[]> {
      try {
        const { integration, operator } = await this.validateUserIntegration(
          models,
          user,
          filterOptions.integrationId,
        );
        const historyFilter = this.buildHistoryFilter(
          filterOptions,
          operator,
          integration,
        );

        const cdrFilter = this.buildCdrFilter(historyFilter, filterOptions);

        const cdrs = await models.CallCdrs.find(cdrFilter)
          .sort({ createdAt: -1 })
          .skip(filterOptions.skip || CALL_HISTORY_CONSTANTS.DEFAULT_SKIP)
          .limit(filterOptions.limit || CALL_HISTORY_CONSTANTS.DEFAULT_LIMIT)
          .lean();

        if (cdrs && cdrs.length > 0) {
          return cdrs;
        }

        return await models.CallHistory.find(historyFilter)
          .sort({ createdAt: -1 })
          .skip(filterOptions.skip || CALL_HISTORY_CONSTANTS.DEFAULT_SKIP)
          .limit(filterOptions.limit || CALL_HISTORY_CONSTANTS.DEFAULT_LIMIT)
          .lean();
      } catch (error) {
        console.error('Error retrieving call histories:', error);
        throw error;
      }
    }

    private static buildCdrFilter(
      historyFilter: any,
      filterOptions: ICallHistoryFilterOptions,
    ): any {
      const cdrFilter: any = {};

      if (historyFilter.createdAt) {
        cdrFilter.createdAt = historyFilter.createdAt;
      }

      if (historyFilter.modifiedAt) {
        cdrFilter.modifiedAt = historyFilter.modifiedAt;
      }

      if (historyFilter.createdBy) {
        cdrFilter.createdBy = historyFilter.createdBy;
      }

      if (historyFilter.operatorPhone) {
        cdrFilter.src = historyFilter.operatorPhone;
      }

      if (historyFilter.customerPhone) {
        cdrFilter.dst = historyFilter.customerPhone;
      }

      if (historyFilter.callStatus) {
        cdrFilter.disposition = historyFilter.callStatus;
      }

      if (historyFilter.callType) {
        cdrFilter.actionType = historyFilter.callType;
      }

      if (historyFilter.conversationId) {
        cdrFilter.$or = [
          { conversationId: historyFilter.conversationId },
          { userfield: historyFilter.conversationId },
        ];
      }

      if (filterOptions.integrationId) {
        cdrFilter.acctId = filterOptions.integrationId;
      }

      return cdrFilter;
    }
  }

  callHistorySchema.loadClass(CallHistory);

  return callHistorySchema;
};
