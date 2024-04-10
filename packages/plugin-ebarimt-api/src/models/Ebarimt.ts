import {
  IEbarimtConfig,
  IEbarimt,
  IEbarimtDocument,
  ebarimtSchema
} from './definitions/ebarimt';
import { PutData, returnBill } from './utils';
import { Model } from 'mongoose';

export interface IPutResponseModel extends Model<IEbarimtDocument> {
  putData(
    doc: IEbarimt,
    config: IEbarimtConfig
  ): Promise<IEbarimtDocument>;
  returnBill(
    doc: { contentType: string; contentId: string; number: string },
    config: IEbarimtConfig
  ): Promise<IEbarimtDocument[]>;
  putHistory({
    contentType,
    contentId
  }: {
    contentType: string;
    contentId: string
  }): Promise<IEbarimtDocument>;
  putHistories({
    contentType,
    contentId
  }: {
    contentType: string;
    contentId: string;
  }): Promise<IEbarimtDocument[]>;
  createPutResponse(doc: IEbarimt): Promise<IEbarimtDocument>;
  updatePutResponse(
    _id: string,
    doc: IEbarimt
  ): Promise<IEbarimtDocument>;
}

export const loadPutResponseClass = models => {
  class PutResponse {
    public static async putData(doc: IEbarimt, config: IEbarimtConfig) {
      const putData = new PutData({ ...doc, config, models });
      return putData.run();
    }

    public static async returnBill(doc, config) {
      return returnBill(models, doc, config);
    }

    public static async putHistory({
      contentType,
      contentId
    }: {
      contentType: string;
      contentId: string
    }) {
      return await models.PutResponses.findOne({
        contentId,
        contentType,
        status: { $ne: 'inactive' },
        success: true,
        billId: { $nin: ['', null, undefined, 0] },
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

  ebarimtSchema.loadClass(PutResponse);

  return ebarimtSchema;
};
