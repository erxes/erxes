import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { ICost, ICostDocument, costSchema } from './definitions/costs';

export interface ICostModel extends Model<ICostDocument> {
  getCost(_id: string): Promise<ICostDocument>;
  createCost(doc: ICost): Promise<ICostDocument>;
  updateCost(_id: string, doc: ICost): Promise<ICostDocument>;
  removeCost(_id: string): void;
}

export const loadCostClass = (models: IModels, subdomain: string) => {
  class Cost {
    public static async createCost(doc: ICost, createdUserId: string) {
      return models.Costs.create({
        ...doc,
        createdDate: new Date(),
        createdUserId
      });
    }

    public static async getCost(_id: string) {
      const cost = await models.Costs.findOne({ _id });

      if (!cost) {
        throw new Error('cost not found');
      }
      return cost;
    }

    public static async updateCost(_id: string, doc: ICost) {
      await models.Costs.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.Costs.findOne({ _id });
    }

    public static async removeCost(_id: string) {
      const data = await models.Costs.getCost(_id);

      if (!data) {
        throw new Error(`not found with id ${_id}`);
      }
      return models.Costs.remove({ _id });
    }
  }

  costSchema.loadClass(Cost);

  return costSchema;
};
