import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IDistrict,
  IDistrictDocument,
  districtSchema
} from './definitions/districts';

export interface IDistrictModel extends Model<IDistrictDocument> {
  createDistrict(doc: IDistrict): Promise<IDistrictDocument>;
  updateDistrict(_id: string, doc: IDistrict): void;
  getDistrict(doc: any): Promise<IDistrictDocument>;
  removeDistrict(_id: string): void;
}

export const loadDistrictClass = (models: IModels) => {
  class District {
    public static async createDistrict(doc: IDistrict) {
      if (doc.center) {
        doc.center = {
          type: 'Point',
          coordinates: [doc.center.lng, doc.center.lat]
        };
      }

      return models.Districts.create(doc);
    }

    public static async updateDistrict(_id: string, doc: IDistrict) {
      await models.Districts.getDistrict({ _id });

      if (doc.center) {
        doc.center = {
          type: 'Point',
          coordinates: [doc.center.lng, doc.center.lat]
        };
      }

      await models.Districts.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } }
      );

      return models.Districts.getDistrict({ _id });
    }

    public static async removeDistrict(_id: string) {
      return models.Districts.deleteOne({ _id });
    }

    public static async getDistrict(doc: any) {
      const district = await models.Districts.findOne(doc);

      if (!district) {
        throw new Error('District not found');
      }

      return district;
    }
  }

  districtSchema.loadClass(District);

  return districtSchema;
};
