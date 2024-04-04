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
    doc: { contentType: string; contentId: string; number: string },
    config: IPutResponseConfig
  ): Promise<IPutResponseDocument[]>;
  putHistory({
    contentType,
    contentId,
    taxType
  }: {
    contentType: string;
    contentId: string;
    taxType?: string;
  }): Promise<IPutResponseDocument>;
  putHistories({
    contentType,
    contentId
  }: {
    contentType: string;
    contentId: string;
  }): Promise<IPutResponseDocument[]>;
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

    public static async putHistory({
      contentType,
      contentId,
      taxType
    }: {
      contentType: string;
      contentId: string;
      taxType?: string;
    }) {
      let taxTypeFilter: any = {
        taxType: { $nin: ['2', '3'] }
      };
      if (['2', '3'].includes(taxType || '')) {
        taxTypeFilter = { taxType };
      }

      return await models.PutResponses.findOne({
        contentId,
        contentType,
        status: { $ne: 'inactive' },
        success: true,
        billId: { $nin: ['', null, undefined, 0] },
        ...taxTypeFilter
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async putHistories({
      contentType,
      contentId
    }: {
      contentType: string;
      contentId: string;
    }) {
      return await models.PutResponses.find({
        contentId,
        contentType,
        status: { $ne: 'inactive' },
        success: true,
        billId: { $nin: ['', null, undefined, 0] }
      })
        .sort({ createdAt: -1 })
        .lean();
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
