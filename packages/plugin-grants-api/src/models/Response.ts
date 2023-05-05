import { Model } from 'mongoose';
import {
  IGrantResponseDocument,
  grantResponsesSchema
} from './definitions/grant';
import { IModels } from '../connectionResolver';

export interface IResponsesModel extends Model<IGrantResponseDocument> {
  addGrantResponse(doc: any): Promise<IGrantResponseDocument>;
}

export const loadResponsesClass = (models: IModels, subdomain: string) => {
  class Response {
    addGrantResponse(doc) {
      return '';
    }
  }

  grantResponsesSchema.loadClass(Response);

  return grantResponsesSchema;
};
