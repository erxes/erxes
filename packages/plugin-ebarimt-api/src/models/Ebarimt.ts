import { PutData, returnBill } from "../putData";
import {
  IPutResponseConfig,
  IPutResponseDocument,
  putResponseSchema,
} from "./definitions/ebarimt";
import { Model } from "mongoose";

const compoundIndexes = {
  contentType: 1,
  contentId: 1,
  success: 1,
};

export interface IPutResponseModel extends Model<IPutResponseDocument> {}

export const loadPutResponseClass = (models) => {
  class PutResponse {
    public static async putData(
      models,
      doc: IPutResponseDocument,
      config: IPutResponseConfig
    ) {
      const putData = new PutData({ ...doc, config, models });
      return putData.run();
    }

    public static async returnBill(models, deal, config) {
      return returnBill(models, deal, config);
    }

    public static async putHistories(models, { contentType, contentId }) {
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
    public static async createPutResponse(models, doc) {
      const response = await models.PutResponses.create({
        ...doc,
        createdAt: new Date(),
      });

      return response;
    }
    /**
     * Update a putResponse
     */
    public static async updatePutResponse(models, _id, doc) {
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
