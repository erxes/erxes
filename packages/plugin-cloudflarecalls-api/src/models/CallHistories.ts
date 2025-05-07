import { IUser } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  callHistorySchema,
  ICallHistory,
  ICallHistoryDocument,
} from './definitions/callHistories';
import { Department } from './definitions/integrations';

export interface ICallHistoryModel extends Model<ICallHistoryDocument> {
  getCallHistory(history: ICallHistory): Promise<ICallHistoryDocument>;
  getCallHistories(selector, user: IUser): Promise<ICallHistoryDocument>;
  getHistoriesCount(selector, user: IUser): Promise<ICallHistoryDocument>;
}

export const loadCallHistoryClass = (models: IModels) => {
  class CallHistory {
    public static async getCallHistory({ _id, callType, timeStamp }) {
      if (callType === 'outgoing') {
        return await models.CallHistory.findOne({ _id });
      }
      return await models.CallHistory.findOne({ timeStamp });
    }
    public static async getCallHistories(selector, user) {
      const integration = await models.Integrations.getIntegration(
        user?._id,
        selector.integrationId,
      );
      if (!integration) {
        throw new Error('Integration not found');
      }

      const department = integration.departments?.find(
        (dept: Department) => dept._id.toString() === selector.departmentId,
      );

      if (!department) {
        throw new Error(`Department not found`);
      }
      const operator = department.operators.find(
        (operator) => operator.userId === user?._id,
      );
      if (!operator) {
        throw new Error('Operator not found');
      }
      const historyFilter: any = {};

      historyFilter.extentionNumber = operator.gsUsername;

      if (selector?.callStatus === 'cancelled') {
        historyFilter.callStatus = { $eq: 'cancelled' };
        delete historyFilter.extentionNumber;
        // historyFilter.operatorPhone = integration.phone;
      } else {
        delete historyFilter.callStatus;
        delete selector.callStatus;
      }
      if (selector.searchValue) {
        historyFilter.customerPhone = {
          $in: [new RegExp(`.*${selector.searchValue}.*`, 'i')],
        };
      }
      const histories = await models.CallHistory.find({
        ...historyFilter,
      })
        .sort({ modifiedAt: -1 })
        .skip(selector.skip || 0)
        .limit(selector.limit || 20);

      return histories;
    }
    public static async getHistoriesCount(selector, user) {
      const integration = await models.Integrations.getIntegration(
        user?._id,
        selector.integrationId,
      );
      if (!integration) {
        throw new Error('Integration not found');
      }

      const department = integration.departments?.find(
        (dept: Department) => dept._id.toString() === selector.departmentId,
      );

      if (!department) {
        throw new Error(`Department not found`);
      }
      const operator = department.operators.find(
        (operator) => operator.userId === user?._id,
      );

      if (!operator) {
        throw new Error('Operator not found');
      }
      const historyFilter: any = {};

      historyFilter.extentionNumber = operator.gsUsername;

      if (selector?.callStatus === 'missed') {
        historyFilter.callStatus = { $ne: 'connected' };
      } else {
        delete historyFilter.callStatus;
        delete selector.callStatus;
      }
      if (selector.searchValue) {
        historyFilter.customerPhone = {
          $in: [new RegExp(`.*${selector.searchValue}.*`, 'i')],
        };
      }

      return await models.CallHistory.countDocuments({
        ...historyFilter,
      });
    }
  }

  callHistorySchema.loadClass(CallHistory);
  callHistorySchema.index({ customerAudioTrack: 1 }, { unique: true });

  return callHistorySchema;
};
