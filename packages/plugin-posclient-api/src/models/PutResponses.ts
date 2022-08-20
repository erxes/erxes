import { Model, model } from 'mongoose';
import {
  putResponseSchema,
  IPutResponseDocument,
  IPutResponse
} from './definitions/putResponses';
import { PutData, IPutDataArgs, returnBill } from './PutData';

export interface IPutResponseModel extends Model<IPutResponseDocument> {
  putData(doc: IPutDataArgs): Promise<IPutResponseDocument>;
  putHistories({
    contentType,
    contentId
  }: {
    contentType: string;
    contentId: string;
  }): Promise<IPutResponseDocument>;
  createPutResponse(doc: IPutResponse): Promise<IPutResponseDocument>;
  updatePutResponse(
    _id: string,
    doc: IPutResponse
  ): Promise<IPutResponseDocument>;
}
export const loadPutResponseClass = models => {
  class PutResponse {
    public static async putData(doc: IPutDataArgs) {
      const putData = new PutData({ ...doc, models });
      return putData.run();
    }

    public static async returnBill(models, deal, config) {
      return returnBill(models, deal, config);
    }

    public static async putHistories({ contentType, contentId }) {
      const putResponse = await models.PutResponses.findOne({
        contentType,
        contentId,
        success: 'true'
      }).sort({ createdAt: -1 });

      if (!putResponse) {
        return;
      }
      if (!putResponse.billId) {
        return;
      }

      return putResponse;
    }

    public static async createPutResponse(doc) {
      const response = await models.PutResponses.create({
        ...doc,
        createdAt: new Date()
      });

      return response;
    }

    public static async updatePutResponse(_id, doc) {
      const response = await models.PutResponses.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date()
          }
        }
      );

      return response;
    }
  }
  putResponseSchema.loadClass(PutResponse);
  return putResponseSchema;
};
