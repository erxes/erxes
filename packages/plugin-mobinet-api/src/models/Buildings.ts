import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IBuilding,
  IBuildingDocument,
  buildingSchema
} from './definitions/buildings';

export interface IBuildingModel extends Model<IBuildingDocument> {
  createBuilding(doc: IBuilding): Promise<IBuildingDocument>;
  updateBuilding(_id: string, doc: IBuilding): void;
  getBuilding(doc: any): Promise<IBuildingDocument>;
  removeBuilding(_id: string): void;
}

export const loadBuildingClass = (models: IModels) => {
  class Building {
    public static async createBuilding(doc: IBuilding) {
      if (doc.location) {
        const { lng, lat } = doc.location;
        (doc as any).location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }

      return models.Buildings.create(doc);
    }

    public static async updateBuilding(_id: string, doc: IBuilding) {
      await models.Buildings.getBuilding({ _id });
      await models.Buildings.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } }
      );

      return models.Buildings.getBuilding({ _id });
    }

    public static async removeBuilding(_id: string) {
      return models.Buildings.deleteOne({ _id });
    }

    public static async getBuilding(doc: any) {
      const building = await models.Buildings.findOne(doc);

      if (!building) {
        throw new Error('Building not found');
      }

      return building;
    }
  }

  buildingSchema.loadClass(Building);

  return buildingSchema;
};
