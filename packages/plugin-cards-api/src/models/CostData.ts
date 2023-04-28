import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ICostData,
  ICostDataDocument,
  costDataSchema
} from './definitions/costData';

export interface ICostDataModel extends Model<ICostDataDocument> {
  getCostData(_id: string): Promise<ICostDataDocument>;
  createCostData(doc: ICostData): Promise<ICostDataDocument>;
  updateCostData(_id: string, doc: ICostData): Promise<ICostDataDocument>;
  removeCostData(_id: string): void;
}

export const loadCostDataClass = (models: IModels, subdomain: string) => {
  class CostData {
    public static async createCost(doc: ICostData, createdUserId: string) {
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

    public static async updateCost(_id: string, doc: ICostData) {
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

  costDataSchema.loadClass(CostData);

  return costDataSchema;
};
