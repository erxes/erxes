import { Model } from 'mongoose';
import {
  IGrantResponseDocument,
  grantResponsesSchema
} from './definitions/grant';
import { IModels } from '../connectionResolver';
import { IUserDocument } from '@erxes/api-utils/src/types';

export interface IResponsesModel extends Model<IGrantResponseDocument> {
  responseGrantRequest(
    doc: any,
    user: IUserDocument
  ): Promise<IGrantResponseDocument>;
}

export const loadResponsesClass = (models: IModels, subdomain: string) => {
  class Response {
    public static async responseGrantRequest(doc, user: IUserDocument) {
      const { description, response, requestId } = doc;

      const grantResponse = await models.Responses.create({
        userId: user._id,
        description,
        response,
        requestId
      });

      const reponseCount = await models.Responses.countDocuments({
        requestId
      });

      const request = await models.Requests.findOne({
        _id: requestId
      });

      if (request?.userIds?.length === reponseCount) {
        await models.Requests.resolveRequest(requestId);
      }

      return grantResponse;
    }
  }

  grantResponsesSchema.loadClass(Response);

  return grantResponsesSchema;
};
