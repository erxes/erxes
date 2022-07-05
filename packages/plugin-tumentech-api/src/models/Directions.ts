import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IDirectionEdit } from '../graphql/resolvers/mutations/directions';
import {
  directionSchema,
  IDirection,
  IDirectionDocument
} from './definitions/directions';
import { validSearchText } from '@erxes/api-utils/src';
import { getPath } from '../utils';
import { sendCoreMessage } from '../messageBroker';

export interface IDirectionModel extends Model<IDirectionDocument> {
  getDirection(doc: any): IDirectionDocument;
  createDirection(subdomain: string, doc: IDirection): IDirectionDocument;
  updateDirection(subdomain: string, doc: IDirectionEdit): IDirectionDocument;
  removeDirection(_id: string): IDirectionDocument;
  fillSearchText(doc: IDirection): string;
}

export const loadDirectionClass = (models: IModels) => {
  class Direction {
    public static async getDirection(doc: any) {
      const direction = await models.Directions.findOne(doc);

      if (!direction) {
        throw new Error('direction not found');
      }

      return direction;
    }

    public static async createDirection(subdomain: string, doc: IDirection) {
      const apiKey = await sendCoreMessage({
        subdomain,
        action: 'getConfig',
        data: { code: 'GOOGLE_MAP_API_KEY', defaultValue: 'demo' },
        isRPC: true
      });
      const places = await models.Places.find({
        _id: { $in: doc.placeIds }
      }).lean();

      const googleMapPath = await getPath(apiKey, places);
      doc.googleMapPath = googleMapPath;

      return models.Directions.create({
        ...doc,
        searchText: models.Directions.fillSearchText(doc)
      });
    }

    public static async updateDirection(
      subdomain: string,
      doc: IDirectionEdit
    ) {
      const direction = await models.Directions.getDirection({ _id: doc._id });

      if (!direction.googleMapPath) {
        const apiKey = await sendCoreMessage({
          subdomain,
          action: 'getConfig',
          data: { code: 'GOOGLE_MAP_API_KEY', defaultValue: 'demo' },
          isRPC: true
        });
        const places = await models.Places.find({
          _id: { $in: direction.placeIds }
        }).lean();

        const googleMapPath = await getPath(apiKey, places);
        doc.googleMapPath = googleMapPath;
      }

      const searchText = models.Directions.fillSearchText(
        Object.assign(direction, doc)
      );

      await models.Directions.updateOne(
        { _id: doc._id },
        { $set: { ...doc, searchText } }
      );

      return models.Directions.findOne({ _id: doc._id });
    }

    public static fillSearchText(doc: IDirection) {
      return validSearchText([doc.routeCode || '', doc.roadCode || '']);
    }
  }

  directionSchema.loadClass(Direction);

  return directionSchema;
};
