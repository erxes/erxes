import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  ITransportDataDocument,
  transportSchema
} from './definitions/transportDatas';

export interface ITransportDataModel extends Model<ITransportDataDocument> {
  getTransport(doc: any): ITransportDataDocument;
}

export const loadTransportDataClass = (models: IModels) => {
  class TransportData {
    public static async getTransport(doc: any) {
      const account = await models.TransportDatas.findOne(doc);

      if (!account) {
        throw new Error('Tranport data not found');
      }

      return account;
    }
  }

  transportSchema.loadClass(TransportData);

  return transportSchema;
};
