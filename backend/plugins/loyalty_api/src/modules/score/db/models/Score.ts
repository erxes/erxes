import { IScoreDocument } from '@/score/@types/score';
import { IScoreLog } from '@/score/@types/scoreLog';
import { scoreSchema } from '@/score/db/definitions/score';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IScoreModel extends Model<IScoreDocument> {
  getScore(ownerId: string, ownerType: string): Promise<IScoreDocument>;
  changeScore(doc: IScoreLog): Promise<IScoreDocument>;
}

export const loadScoreClass = (models: IModels) => {
  class Score {
    public static async getScore(ownerId: string, ownerType: string) {
      const score = await models.Score.findOne({ ownerId, ownerType }).lean();

      if (!score) {
        return models.Score.create({ ownerId, ownerType, score: 0 });
      }

      return score;
    }

    public static async updateScore(
      ownerId: string,
      ownerType: string,
      score: number,
    ) {
      return await models.Score.findOneAndUpdate(
        { ownerId, ownerType },
        { $set: { score } },
        { new: true },
      );
    }

    public static async changeScore(doc: IScoreLog) {
      const { ownerId, ownerType } = doc;

      const { score, change } = await this.validateScore(doc);

      await models.ScoreLog.createScoreLog({ ...doc, change });

      return await this.updateScore(ownerId, ownerType, score);
    }

    public static async validateScore(doc: IScoreLog) {
      const { ownerId, ownerType, change, action, contentId, contentType } =
        doc;

      const { score } = await models.Score.getScore(ownerId, ownerType);

      if (action === 'subtract') {
        return await this.validateUsage(score, change);
      }

      if (action === 'refund') {
        return await this.validateRefund(
          ownerId,
          ownerType,
          contentId,
          contentType,
          score,
        );
      }

      return { score: score + change, change };
    }

    public static async validateUsage(score: number, change: number) {
      if (score - change < 0) {
        throw new Error('There has no enough score to subtract');
      }

      return { score: score - change, change };
    }

    public static async validateRefund(
      ownerId: string,
      ownerType: string,
      contentId: string,
      contentType: string,
      score: number,
    ) {
      let scoreLog = await models.ScoreLog.findOne({
        ownerId,
        ownerType,
        contentId,
        contentType,
        action: 'subtract',
      }).lean();

      if (!scoreLog) {
        scoreLog = await models.ScoreLog.findOne({
          ownerId,
          ownerType,
          contentId,
          contentType,
          action: 'add',
        }).lean();

        if (!scoreLog) {
          throw new Error('Cannot find score log on this target');
        }
      }

      const refundScoreLog = await models.ScoreLog.exists({
        ownerId,
        ownerType,
        contentId,
        contentType,
        action: 'refund',
      }).lean();

      if (refundScoreLog) {
        throw new Error(
          'Cannot refund loyalty score cause already refunded loyalty score',
        );
      }

      let { change, action } = scoreLog;

      let refundAmount: number;

      if (action === 'subtract') {
        const addedScoreLogs = await models.ScoreLog.find({
          ownerId,
          ownerType,
          contentId,
          contentType,
          action: 'add',
        }).lean();

        if (addedScoreLogs && addedScoreLogs.length > 0) {
          const totalAddedScore = addedScoreLogs.reduce(
            (acc, curr) => acc + curr.change,
            0,
          );
          refundAmount = change - totalAddedScore;
        } else {
          refundAmount = change;
        }
      } else if (action === 'add') {
        refundAmount = -change;
      } else {
        throw new Error(`Unsupported action type for refund: ${action}`);
      }

      return { score: score + refundAmount, change: refundAmount };
    }
  }

  scoreSchema.loadClass(Score);

  return scoreSchema;
};
