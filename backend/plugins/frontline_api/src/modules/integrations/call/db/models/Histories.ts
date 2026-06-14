import { Model, FilterQuery } from 'mongoose';
import { callHistorySchema } from '../definitions/histories';
import { IUser, IUserDocument } from 'erxes-api-shared/core-types';
import {
  ICallHistory,
  ICallHistoryDocument,
  ICallHistoryFilterOptions,
} from '@/integrations/call/@types/histories';
import { ICallSessionDocument } from '@/integrations/call/@types/callSessions';
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

        const filter = this.buildSessionFilter(filterOptions, user, operator);

        return models.CallSessions.countDocuments(filter);
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

    private static buildSessionFilter(
      filterOptions: ICallHistoryFilterOptions,
      user: IUserDocument,
      operator: any,
    ): FilterQuery<ICallSessionDocument> {
      const filter: FilterQuery<ICallSessionDocument> = {
        inboxIntegrationId: filterOptions.integrationId,
      };

      const ownership: FilterQuery<ICallSessionDocument>[] = [];
      if (user?._id) {
        ownership.push({ 'ringingOperators.userId': user._id });
        ownership.push({ answeredBy: user._id });
      }
      if (operator?.gsUsername) {
        ownership.push({
          ringingOperators: {
            $elemMatch: {
              extensionNumber: operator.gsUsername,
              userId: { $in: [null, undefined] },
            },
          },
        });
        ownership.push({
          answeredExtension: operator.gsUsername,
          answeredBy: { $in: [null, undefined] },
        });
      }
      // Without an owner we must not fall back to "all calls" — scope to none.
      filter.$or = ownership.length > 0 ? ownership : [{ _id: null }];

      const { callStatus, callType, searchValue } = filterOptions;

      if (
        callStatus === CALL_HISTORY_CONSTANTS.CALL_STATUS.CANCELLED ||
        callStatus === CALL_HISTORY_CONSTANTS.CALL_STATUS.MISSED
      ) {
        // Missed tab — the call ended without anyone answering it.
        filter.status = 'missed';
      } else if (callStatus === CALL_HISTORY_CONSTANTS.CALL_STATUS.CONNECTED) {
        filter.status = { $in: ['active', 'ended'] };
      }

      if (callType) {
        filter.callType = callType;
      }

      if (searchValue) {
        const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.customerPhone = { $regex: new RegExp(escaped, 'i') };
      }

      return filter;
    }

    private static mapSessionToHistory(
      session: ICallSessionDocument,
      operator: any,
    ): Partial<ICallHistory> & { _id: string } {
      const isMissed = session.status === 'missed';

      return {
        _id: session._id,
        operatorPhone: session.operatorPhone || '',
        customerPhone: session.customerPhone || '',
        callDuration: session.durationSec || 0,
        callStartTime: session.startedAt,
        callEndTime: session.endedAt as Date,
        callType: session.callType,
        callStatus: isMissed
          ? CALL_HISTORY_CONSTANTS.CALL_STATUS.CANCELLED
          : CALL_HISTORY_CONSTANTS.CALL_STATUS.CONNECTED,
        timeStamp: session.startedAt
          ? new Date(session.startedAt).getTime() / 1000
          : 0,
        modifiedAt: session.updatedAt,
        createdAt: session.createdAt,
        createdBy: '',
        modifiedBy: '',
        extensionNumber:
          session.answeredExtension || operator?.gsUsername || '',
        conversationId: session.conversationId || '',
        recordUrl: session.recordUrl || '',
        inboxIntegrationId: session.inboxIntegrationId,
        uniqueid: session.uniqueid,
      };
    }

    public static async getCallHistories(
      filterOptions: ICallHistoryFilterOptions,
      user: IUserDocument,
    ): Promise<(Partial<ICallHistory> & { _id: string })[]> {
      try {
        const { operator } = await this.validateUserIntegration(
          models,
          user,
          filterOptions.integrationId,
        );

        const filter = this.buildSessionFilter(filterOptions, user, operator);

        const sessions = await models.CallSessions.find(filter)
          .sort({ startedAt: -1 })
          .skip(filterOptions.skip || CALL_HISTORY_CONSTANTS.DEFAULT_SKIP)
          .limit(filterOptions.limit || CALL_HISTORY_CONSTANTS.DEFAULT_LIMIT)
          .lean();

        return sessions.map((session) =>
          this.mapSessionToHistory(session as ICallSessionDocument, operator),
        );
      } catch (error) {
        console.error('Error retrieving call histories:', error);
        throw error;
      }
    }
  }

  callHistorySchema.loadClass(CallHistory);

  return callHistorySchema;
};
