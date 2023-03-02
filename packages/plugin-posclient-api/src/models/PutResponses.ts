import { Model, model } from 'mongoose';
import {
  putResponseSchema,
  IPutResponseDocument,
  IPutResponse
} from './definitions/putResponses';
import { PutData, IPutDataArgs, returnBill } from './PutData';

export interface IPutResponseModel extends Model<IPutResponseDocument> {
  putData(doc: IPutDataArgs): Promise<IPutResponseDocument>;
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
    public static async putData(doc: IPutDataArgs) {
      const putData = new PutData({ ...doc, models });
      return putData.run();
    }

    public static async returnBill(models, deal, config) {
      return returnBill(models, deal, config);
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
