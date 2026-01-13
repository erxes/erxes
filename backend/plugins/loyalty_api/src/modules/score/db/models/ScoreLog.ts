import { IScoreLog, IScoreLogDocument } from '@/score/@types/scoreLog';
import { scoreLogSchema } from '@/score/db/definitions/scoreLog';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  createScoreLog(doc: IScoreLog): Promise<IScoreLogDocument>;
}

export const loadScoreLogClass = (models: IModels) => {
  class ScoreLog {
    public static async getScoreLog(_id: string) {
      const score = await models.ScoreLog.findOne({ _id }).lean();

      if (!score) {
        throw new Error('Score log not found');
      }

      return score;
    }

    public static async createScoreLog(
      doc: IScoreLog,
    ): Promise<IScoreLogDocument> {
      return await models.ScoreLog.create(doc);
    }
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
