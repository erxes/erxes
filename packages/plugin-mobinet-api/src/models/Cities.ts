import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { ICity, ICityDocument, citySchema } from './definitions/cities';

export interface ICityModel extends Model<ICityDocument> {
  createCity(doc: ICity): Promise<ICityDocument>;
  updateCity(_id: string, doc: ICity): void;
  getCity(doc: any): Promise<ICityDocument>;
  removeCity(_id: string): void;
}

export const loadCityClass = (models: IModels) => {
  class City {
    public static async createCity(doc: ICity) {
      if (doc.center) {
        doc.center = {
          type: 'Point',
          coordinates: [doc.center.lng, doc.center.lat]
        };
      }

      return models.Cities.create(doc);
    }

    public static async updateCity(_id: string, doc: ICity) {
      await models.Cities.getCity({ _id });

      if (doc.center) {
        doc.center = {
          type: 'Point',
          coordinates: [doc.center.lng, doc.center.lat]
        };
      }

      await models.Cities.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } }
      );

      return models.Cities.getCity({ _id });
    }

    public static async removeCity(_id: string) {
      return models.Cities.deleteOne({ _id });
    }

    public static async getCity(doc: any) {
      const city = await models.Cities.findOne(doc);

      if (!city) {
        throw new Error('City not found');
      }

      return city;
    }
  }

  citySchema.loadClass(City);

  return citySchema;
};
