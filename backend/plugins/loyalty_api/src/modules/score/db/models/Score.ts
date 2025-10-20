import { IScore, IScoreDocument } from '@/score/@types/score';
import { scoreSchema } from '@/score/db/definitions/score';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IScoreModel extends Model<IScoreDocument> {
  getScore(_id: string): Promise<IScoreDocument>;
  getScores(): Promise<IScoreDocument[]>;
  createScore(doc: IScore): Promise<IScoreDocument>;
  updateScore(_id: string, doc: IScore): Promise<IScoreDocument>;
  removeScore(ScoreId: string): Promise<{  ok: number }>;
}

export const loadScoreClass = (models: IModels) => {
  class Score {
    /**
     * Retrieves score
     */
    public static async getScore(_id: string) {
      const Score = await models.Score.findOne({ _id }).lean();

      if (!Score) {
        throw new Error('Score not found');
      }

      return Score;
    }

    /**
     * Retrieves all scores
     */
    public static async getScores(): Promise<IScoreDocument[]> {
      return models.Score.find().lean();
    }

    /**
     * Create a score
     */
    public static async createScore(doc: IScore): Promise<IScoreDocument> {
      return models.Score.create(doc);
    }

    /*
     * Update score
     */
    public static async updateScore(_id: string, doc: IScore) {
      return await models.Score.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove score
     */
    public static async removeScore(ScoreId: string[]) {
      return models.Score.deleteOne({ _id: { $in: ScoreId } });
    }
  }

  scoreSchema.loadClass(Score);

  return scoreSchema;
};
