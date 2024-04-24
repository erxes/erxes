import { Model } from 'mongoose';
import { IBurenScoringDocument, IBurenscoring, burenscoringSchema } from './definitions/burenscoring';
import { IModels } from '../connectionResolver';
export interface IBurenScoringModel extends Model<IBurenScoringDocument> {
  createBurenScoring( subdomain: string, doc:IBurenscoring ): Promise<IBurenScoringDocument>;
}
export const loadBurenScoringClass = (models: IModels) => {
  class BurenScoring {
    // create
    public static async createBurenScoring(subdomain: string, doc:IBurenscoring) {
        const result = await models.BurenScorings.create({
          ...doc,
          subdomain,
          createdAt: new Date()
        })
        return result;
    }
  }

  burenscoringSchema.loadClass(BurenScoring);
  
  return burenscoringSchema;
};