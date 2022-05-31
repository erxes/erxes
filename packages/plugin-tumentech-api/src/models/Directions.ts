import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IDirectionEdit } from '../graphql/resolvers/mutations/directions';
import {
  directionSchema,
  IDirection,
  IDirectionDocument
} from './definitions/directions';
import { validSearchText } from '@erxes/api-utils/src';

export interface IDirectionModel extends Model<IDirectionDocument> {
  getDirection(doc: any): IDirectionDocument;
  createDirection(doc: IDirection): IDirectionDocument;
  updateDirection(doc: IDirectionEdit): IDirectionDocument;
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

    public static async createDirection(doc: IDirection) {
      return models.Directions.create({
        ...doc,
        searchText: models.Directions.fillSearchText(doc)
      });
    }

    public static async updateDirection(doc: IDirectionEdit) {
      const direction = await models.Directions.getDirection({ _id: doc._id });

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
