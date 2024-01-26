import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';
import {
  IAdvertisement,
  IAdvertisementDocument,
  AdvertisementSchema,
} from './definitions/adviertisement';
import { IAdvertisementEdit } from '../graphql/resolvers/mutations/advertisement';

export interface IAdvertisementModel extends Model<IAdvertisementDocument> {
  getAdvertisement(doc: any): IAdvertisementDocument;
  createAdvertisement(doc: IAdvertisement): IAdvertisementDocument;
  updateAdvertisement(doc: IAdvertisementEdit): IAdvertisementDocument;
  removeAdvertisement(_id: string): IAdvertisementDocument;
}

export const loadAdvertisementClass = (models: IModels) => {
  class Advertisement {
    public static async getAdvertisement(doc: any) {
      const ads = await models.Advertisement.findOne(doc);

      if (!ads) {
        throw new Error('ads not found');
      }

      return ads;
    }

    public static async createAdvertisement(doc: IAdvertisement) {
      console.log('this works');
      return models.Advertisement.create(doc);
    }

    public static async updateAdvertisement(doc: IAdvertisementEdit) {
      await models.Advertisement.updateOne(
        { _id: doc._id },
        { $set: { ...doc } },
      );

      return models.Advertisement.findOne({ _id: doc._id });
    }

    public static async removeAdvertisement(doc: IAdvertisement) {
      return models.Advertisement.remove(doc);
    }
  }

  AdvertisementSchema.loadClass(Advertisement);

  return AdvertisementSchema;
};
