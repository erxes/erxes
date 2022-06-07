import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  placeSchema,
  IPlace,
  IPlaceDocument,
  IPlaceEdit
} from './definitions/places';
import { validSearchText } from '@erxes/api-utils/src';

export interface IPlaceModel extends Model<IPlaceDocument> {
  getPlace(doc: any): IPlaceDocument;
  createPlace(doc: IPlace): IPlaceDocument;
  updatePlace(doc: IPlaceEdit): IPlaceDocument;
  removePlace(_id: string): IPlaceDocument;
  fillSearchText(doc: IPlace): string;
}

export const loadPlaceClass = (models: IModels) => {
  class Place {
    public static async getPlace(doc: any) {
      const place = await models.Places.findOne(doc);

      if (!place) {
        throw new Error('place not found');
      }

      return place;
    }

    public static async createPlace(doc: IPlace) {
      return models.Places.create({
        ...doc,
        searchText: models.Places.fillSearchText(doc)
      });
    }

    public static async updatePlace(doc: IPlaceEdit) {
      const place = await models.Places.getPlace({ _id: doc._id });

      const searchText = models.Places.fillSearchText(
        Object.assign(place, doc)
      );

      await models.Places.updateOne(
        { _id: doc._id },
        { $set: { ...doc, searchText } }
      );

      return models.Places.findOne({ _id: doc._id });
    }

    public static fillSearchText(doc: IPlace) {
      return validSearchText([
        doc.province || '',
        doc.code || '',
        doc.name || ''
      ]);
    }
  }

  placeSchema.loadClass(Place);

  return placeSchema;
};
