import { IUser } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  callHistorySchema,
  ICallHistoryDocument,
} from './definitions/callHistories';

export interface ICallHistoryModel extends Model<ICallHistoryDocument> {
  getCallHistory(sessionId: string): Promise<ICallHistoryDocument>;
  getCallHistories(selector, user: IUser): Promise<ICallHistoryDocument>;
}

export const loadCallHistoryClass = (models: IModels) => {
  class CallHistory {
    public static async getCallHistory(sessionId) {
      const history = await models.CallHistory.findOne({ sessionId });
      return history;
    }
    public static async getCallHistories(selector, user) {
      const integration = await models.Integrations.getIntegration(
        user?._id,
        selector.integrationId,
      );
      if (!integration) {
        throw new Error('Integration not found');
      }
      const operator = integration.operators.find(
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
        delete selector.callStatus;
      }
      if (selector.searchValue) {
        historyFilter.customerPhone = {
          $in: [new RegExp(`.*${selector.searchValue}.*`, 'i')],
        };
      }
      console.log('');
      const histories = await models.CallHistory.find({
        ...historyFilter,
      })
        .sort({ modifiedAt: -1 })
        .skip(selector.skip || 0)
        .limit(selector.limit || 20);

      return histories;
    }
  }

  callHistorySchema.loadClass(CallHistory);

  return callHistorySchema;
};
