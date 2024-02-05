import { validSearchText } from '@erxes/api-utils/src';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';

import {
  destinationSchema,
  IDestination,
  IDestinationDocument
} from './definitions/destination';

export interface IDestinationModel extends Model<IDestinationDocument> {
  getDestination(doc: any): IDestinationDocument;
  createDestination(doc: IDestination, userId?: string): IDestinationDocument;
  updateDestination(
    doc: IDestinationDocument,
    userId?: string
  ): IDestinationDocument;
}

export const loadDestinationClass = (models: IModels) => {
  class Destination {
    public static async getDestination(doc: any) {
      const destination = await models.Destinations.findOne(doc);

      if (!destination) {
        throw new Error('destination not found');
      }

      return destination;
    }

    public static async createDestination(doc: IDestination) {
      const code = doc.code.toLowerCase().replace(/,| /g, '_');

      return models.Destinations.create({
        ...doc,
        code
      });
    }

    public static async updateDestination(doc: IDestinationDocument) {
      await models.Destinations.getDestination({
        _id: doc._id
      });

      const code = doc.code.toLowerCase().replace(/,| /g, '_');

      const updatedDoc: any = {
        ...doc,
        code
      };

      await models.Destinations.updateOne(
        { _id: doc._id },
        { $set: updatedDoc }
      );

      return models.Destinations.findOne({ _id: doc._id });
    }
  }

  destinationSchema.loadClass(Destination);

  return destinationSchema;
};
