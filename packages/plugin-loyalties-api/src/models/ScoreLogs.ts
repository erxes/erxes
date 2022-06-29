import * as _ from 'underscore';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IScoreLogDocument, scoreLogSchema, IScoreLog } from './definitions/scoreLog';
import { sendContactsMessage, sendCoreMessage } from '../messageBroker';
import { IScoreParams } from './definitions/common';
export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
  getScoreLogs(doc: IScoreParams): Promise<IScoreLogDocument>;
  changeScore(doc: IScoreLog): Promise<IScoreLogDocument>;
}

export const loadScoreLogClass = (models: IModels, subdomain: string) => {
  class ScoreLog {
    public static async getScoreLog(_id: string) {
      const scoreLog = await models.ScoreLogs.findOne({ _id }).lean();

      if (!scoreLog) {
        throw new Error('not found scoreLog rule')
      }

      return scoreLog;
    }

    public static async getScoreLogs(doc: IScoreParams) {
      const { ownerType, order, fromDate, toDate, orderType, ownerId } = doc;
      const orderTypeFields = {
        changeScore: 'Changed Score',
        createdAt: 'Date'
      };
      let filter = {};
      let sort: { [k: string]: any } = {};

      if (ownerType) {
        filter = { ...filter, ownerType };
      }
      if (ownerId) {
        filter = { ...filter, ownerId };
      }
      if (fromDate) {
        filter = { ...filter, createdAt: { $gte: fromDate } };
      }
      if (toDate) {
        filter = { ...filter, createdAt: { $lt: toDate } };
      }
      if (fromDate && toDate) {
        filter = { ...filter, createdAt: { $gte: fromDate, $lt: toDate } };
      }
      if (orderType && order) {
        const orderTypeField = Object.keys(orderTypeFields).find(
          key => orderTypeFields[key] === orderType
        );
        const orderAscDesc =
          order === 'Descending'
            ? 1
            : (order === 'Ascending' || order === undefined) && -1;
        sort = { [orderTypeField || '']: orderAscDesc };
      }

      const list = await models.ScoreLogs.find(filter).sort(sort);
      const total = await models.ScoreLogs.find(filter).count();
      return { list, total };
    }

    public static async changeScore(doc: IScoreLog) {
      const { ownerType, ownerId, changeScore, description, createdBy = '' } = doc;

      const score = Number(changeScore);
      let owner;
      let sendMessage;
      let action;

      if (ownerType === 'customer') {
        owner = await await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: { _id: ownerId },
          isRPC: true
        });
        sendMessage = sendContactsMessage;
        action = 'customers.updateOne'
      }

      if (ownerType === 'user') {
        owner = await await sendCoreMessage({
          subdomain,
          action: 'users.findOne',
          data: { _id: ownerId },
          isRPC: true
        });
        sendMessage = sendCoreMessage;
        action = 'users.updateOne';
      }

      if (ownerType === 'company') {
        owner = await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: { _id: ownerId },
          isRPC: true
        });
        sendMessage = sendContactsMessage;
        action = 'companies.updateCommon';
      }

      if (!owner) {
        throw new Error(`not fount ${ownerType}`);
      }

      const oldScore = Number(owner.score) || 0;
      const newScore = oldScore + score;

      if (score < 0 && newScore < 0) {
        throw new Error(`score are not enough`);
      }

      const response = await sendMessage({
        subdomain,
        action,
        data: { selector: { _id: ownerId }, modifier: { $set: { score: newScore } } },
        isRPC: true
      });

      if (!response) {
        return;
      }
      return await models.ScoreLogs.create({
        ownerId, ownerType, changeScore: score,
        createdAt: new Date(), description, createdBy
      });
    }
    
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
