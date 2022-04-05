import * as _ from 'underscore';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IScoreLogDocument, scoreLogSchema, IScoreLog } from './definitions/scoreLog';
import { sendContactsMessage, sendCoreMessage } from '../messageBroker';

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
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
