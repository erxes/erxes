import {
  IPutResponseConfig,
  IPutResponse,
  IPutResponseDocument,
  putResponseSchema
} from './definitions/ebarimt';
import { PutData, returnBill } from './utils';
import { Model } from 'mongoose';

export interface IPutResponseModel extends Model<IPutResponseDocument> {
  putData(
    doc: IPutResponse,
    config: IPutResponseConfig
  ): Promise<IPutResponseDocument>;
  returnBill(
    doc: { contentType: string; contentId: string },
    config: IPutResponseConfig
  ): Promise<IPutResponseDocument>;
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
    public static async putData(doc: IPutResponse, config: IPutResponseConfig) {
      const putData = new PutData({ ...doc, config, models });
      return putData.run();
    }

    public static async returnBill(doc, config) {
      return returnBill(models, doc, config);
    }

    public static async putHistories({
      contentType,
      contentId
    }: {
      contentType: string;
      contentId: string;
    }) {
      const putResponse = await models.PutResponses.findOne({
        contentType,
        contentId,
        success: true
      })
        .sort({ createdAt: -1 })
        .lean();
      if (!putResponse) {
        return;
      }
      if (!putResponse.billId) {
        return;
      }
      return putResponse;
    }

    /**
     * Create a putResponse
     */
    public static async createPutResponse(doc) {
      const response = await models.PutResponses.create({
        ...doc,
        createdAt: new Date()
      });

      return response;
    }
    /**
     * Update a putResponse
     */
    public static async updatePutResponse(_id, doc) {
      const response = await models.PutResponses.update(
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
