import * as _ from 'underscore';
import { Model } from 'mongoose';
import { IBurenScoringDocument, IBurenscoring, burenscoringSchema } from './definitions/burenscoring';
import { IModels } from '../connectionResolver';


export interface IBurenScoringModel extends Model<IBurenScoringDocument> {
  createBurenscoring(doc: any): Promise<IBurenScoringDocument>;
  updateBurenscoring(_id: string, doc: IBurenscoring): Promise<IBurenScoringDocument>;
  removeBurenscoring(_ids: string[]): Promise<JSON>;
}
export const loadBurenscoringClass = (models: IModels) => {
  class BurenScoring {
    // create
    public static async createBurenscoring(doc:IBurenscoring) {
        const result = await models.BurenScorings.create({
          ...doc,
          createdAt: new Date()
        })
        
        return result
     
    }
    // update
    public static async updateBurenscoring (_id: string, doc: IBurenscoring) {
      await models.BurenScorings.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeBurenscoring(_id: string) {
      return models.BurenScorings.deleteOne({ _id });
    }
  }

  burenscoringSchema.loadClass(BurenScoring);

  return burenscoringSchema;
};