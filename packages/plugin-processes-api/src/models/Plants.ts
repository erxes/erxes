import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IPlant, IPlantDocument, plantSchema } from './definitions/plants';

export interface IPlantModel extends Model<IPlantDocument> {
  getPlant(_id: string): Promise<IPlantDocument>;
  createPlant(doc: IPlant): Promise<IPlantDocument>;
  updatePlant(_id: string, doc: IPlant): Promise<IPlantDocument>;
  removePlant(_id: string): void;
}

export const loadPlantClass = (models: IModels) => {
  class Plant {
    /*
     * Get a plant
     */
    public static async getPlant(_id: string) {
      const plant = await models.Plants.findOne({ _id });

      if (!plant) {
        throw new Error('Plant not found');
      }

      return plant;
    }

    /**
     * Create a plant
     */
    public static async createPlant(doc: IPlant) {
      const plant = await models.Plants.create({
        ...doc,
        createdAt: new Date(),
      });

      return plant;
    }

    /**
     * Update Plant
     */
    public static async updatePlant(_id: string, doc: IPlant) {
      const plant = await models.Plants.getPlant(_id,);

      await models.Plants.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Plants.getPlant( _id );

      return updated;
    }

    /**
     * Remove Plant
     */
    public static async removePlant(_id: string) {
      await models.Plants.getPlant(_id);
      return models.Plants.deleteOne({ _id });
    }
  }

  plantSchema.loadClass(Plant);

  return plantSchema;
};
