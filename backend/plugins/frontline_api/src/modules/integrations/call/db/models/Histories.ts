import { Model, FilterQuery } from 'mongoose';
import { callHistorySchema } from '../definitions/histories';
import { IUser, IUserDocument } from 'erxes-api-shared/core-types';
import {
  ICallHistory,
  ICallHistoryDocument,
  ICallHistoryFilterOptions,
  ICallHistoryUpdate,
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
  createCallHistory(historyData: ICallHistory): Promise<ICallHistoryDocument>;
  updateCallHistory(
    id: string,
    updateData: ICallHistoryUpdate,
  ): Promise<ICallHistoryDocument | null>;
  deleteCallHistory(id: string, user: IUser): Promise<boolean>;
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

    public static async createCallHistory(
      historyData: ICallHistory,
      user: IUser,
    ): Promise<ICallHistoryDocument> {
      try {
        if (!historyData.customerPhone || !historyData.operatorPhone) {
          throw new Error('Customer phone and operator phone are required');
        }

        if (!historyData.inboxIntegrationId) {
          throw new Error('Integration ID are required');
        }

        const callHistoryData = {
          ...historyData,
          timeStamp: historyData.timeStamp || new Date(),
          createdAt: new Date(),
          modifiedAt: new Date(),
        };

        return await models.CallHistory.create(callHistoryData);
      } catch (error) {
        console.error('Error creating call history:', error);
        throw error;
      }
    }

    public static async updateCallHistory(
      id: string,
      updateData: ICallHistoryUpdate,
    ): Promise<ICallHistoryDocument | null> {
      try {
        if (!id || id.length !== 24) {
          throw new Error('Invalid call history ID provided');
        }

        const existingHistory = await models.CallHistory.findById(id);
        if (!existingHistory) {
          throw new Error(ERROR_MESSAGES.CALL_HISTORY_NOT_FOUND);
        }

        if (
          updateData.callStatus &&
          !Object.values(CALL_HISTORY_CONSTANTS.CALL_STATUS).includes(
            updateData.callStatus,
          )
        ) {
          throw new Error('Invalid call status provided');
        }

        if (updateData.duration !== undefined && updateData.duration < 0) {
          throw new Error('Duration cannot be negative');
        }

        const updatePayload = {
          ...updateData,
          modifiedAt: new Date(),
        };

        Object.keys(updatePayload).forEach((key) => {
          if (updatePayload[key] === undefined) {
            delete updatePayload[key];
          }
        });

        const updatedHistory = await models.CallHistory.findByIdAndUpdate(
          id,
          { $set: updatePayload },
          {
            new: true,
            runValidators: true,
          },
        );

        if (updatedHistory) {
          console.log(`Call history updated successfully: ${id}`);
        }

        return updatedHistory;
      } catch (error) {
        console.error(`Error updating call history ${id}:`, error);
        throw error;
      }
    }

    public static async deleteCallHistory(
      id: string,
      user: IUserDocument,
    ): Promise<boolean> {
      try {
        if (!id || id.length !== 24) {
          throw new Error('Invalid call history ID provided');
        }

        if (!user || !user._id) {
          throw new Error('Valid user is required for deletion 1222');
        }

        const callHistory = await models.CallHistory.findById(id);
        if (!callHistory) {
          throw new Error(ERROR_MESSAGES.CALL_HISTORY_NOT_FOUND);
        }
        if (callHistory.createdBy !== user._id.toString()) {
          try {
            await this.validateUserIntegration(
              models,
              user as IUserDocument,
              callHistory.inboxIntegrationId,
            );
          } catch (error) {
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
          }
        }

        const deleteResult = await models.CallHistory.findByIdAndUpdate(id, {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: user._id,
            modifiedAt: new Date(),
          },
        });

        const success = deleteResult !== null;

        if (success) {
          console.log(
            `Call history deleted successfully: ${id} by user: ${user._id}`,
          );
        }

        return success;
      } catch (error) {
        console.error(`Error deleting call history ${id}:`, error.message);
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
