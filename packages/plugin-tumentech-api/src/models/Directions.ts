import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  directionSchema,
  IDirection,
  IDirectionDocument
} from './definitions/directions';

export interface IDirectionModel extends Model<IDirectionDocument> {
  getDirection(doc: any): IDirectionDocument;
  createDirection(doc: IDirection): IDirectionDocument;
  updateDirection(_id: string, fields: IDirection): IDirectionDocument;
  removeDirection(_id: string): IDirectionDocument;
}

export const loadDirectionClass = (models: IModels) => {
  class Direction {
    public static async getDirection(doc: any) {
      const participant = await models.Directions.findOne(doc);

      if (!participant) {
        throw new Error('Participant not found');
      }

      return participant;
    }

    public static async createDirection(doc: IDirection) {
      return models.Directions.create(doc);
    }
  }

  directionSchema.loadClass(Direction);

  return directionSchema;
};
