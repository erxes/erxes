import {
  IPutResponseConfig,
  IPutResponseDoc,
  putResponseSchema,
} from "./definitions/ebarimt";
import { PutData, returnBill } from "./utils";
import { Model } from "mongoose";

export interface IPutResponseModel extends Model<IPutResponseDoc> {
  createPutResponse(doc: Document): Promise<IPutResponseDoc>;
  updatePutResponse(_id: string, doc: Document): Promise<IPutResponseDoc>;
}

export const loadPutResponseClass = (models) => {
  class PutResponse {
    public static async putData(
      doc: IPutResponseDoc,
      config: IPutResponseConfig
    ) {
      const putData = new PutData({ ...doc, config, models });
      return putData.run();
    }

    public static async returnBill(deal, config) {
      return returnBill(models, deal, config);
    }

    public static async putHistories({ contentType, contentId }) {
      const putResponse = await models.PutResponses.findOne({
        contentType,
        contentId,
        success: true,
      }).sort({ createdAt: -1 });
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
        createdAt: new Date(),
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
            modifiedAt: new Date(),
          },
        }
      );

      return response;
    }
  }

  putResponseSchema.loadClass(PutResponse);

  return putResponseSchema;
};
