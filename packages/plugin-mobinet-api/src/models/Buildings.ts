import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IBuilding,
  IBuildingDocument,
  buildingSchema,
} from './definitions/buildings';

import {
  IBuildingToContactDocument,
  buildingToContactSchema,
} from './definitions/buildingToContact';
import { sendMessage } from '@erxes/api-utils/src/messageBroker';
import { sendCommonMessage } from '../messageBroker';

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
          coordinates: [lng, lat],
        };
      }
      const quarter = await models.Quarters.findById(doc.quarterId);
      const district = await models.Districts.findById(quarter?.districtId);
      const city = await models.Cities.findById(district?.cityId);
      const searchText = `${doc.name} ${quarter?.name}  ${district?.name}  ${city?.name}`;
      return models.Buildings.create({ ...doc, searchText });
    }

    public static async updateBuilding(_id: string, doc: IBuilding) {
      await models.Buildings.getBuilding({ _id });
      const building = await models.Buildings.getBuilding({ _id });
      const quarter = await models.Quarters.findById(building.quarterId);
      const district = await models.Districts.findById(quarter?.districtId);
      const city = await models.Cities.findById(district?.cityId);
      const searchText = `${doc.name} ${quarter?.name}  ${district?.name}  ${city?.name}`;
      await models.Buildings.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date(), searchText } },
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

// builing to contact

export interface IBuildingToContactModel
  extends Model<IBuildingToContactDocument> {
  createDoc(doc): Promise<IBuildingToContactDocument>;
  removeDoc(doc: IBuildingToContactDocument): void;
}

export const loadBuildingToContactClass = (models: IModels) => {
  class BuildingToContact {
    public static async createDoc(doc: IBuildingToContactDocument) {
      const existingDoc = await models.BuildingToContacts.findOne({ ...doc });

      if (existingDoc) {
        return existingDoc;
      }

      return models.BuildingToContacts.create(doc);
    }

    public static async removeDoc(doc: IBuildingToContactDocument) {
      return models.BuildingToContacts.deleteOne(doc);
    }
  }

  buildingToContactSchema.loadClass(BuildingToContact);

  return buildingToContactSchema;
};
