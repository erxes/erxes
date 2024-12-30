import fetch from 'node-fetch';
import {
  IEbarimt,
  IEbarimtDocument,
  ebarimtSchema,
  IEbarimtFull
} from './definitions/ebarimt';
import { IEbarimtConfig } from './definitions/configs';
import { IDoc, getEbarimtData } from './utils';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { returnResponse } from '../utils';

export interface IPutResponseModel extends Model<IEbarimtDocument> {
  putData(
    doc: IDoc,
    config: IEbarimtConfig
  ): Promise<{ putData?: IEbarimtDocument, innerData?: IEbarimtFull }>;
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

export const loadPutResponseClass = (models: IModels) => {
  class PutResponse {
    public static async putData(doc: IDoc, config: IEbarimtConfig) {
      // check previously post
      const { contentId, contentType } = doc;
      const continuePutResponses: IEbarimtDocument[] =
        await models.PutResponses.find({
          contentType,
          contentId,
          modifiedAt: { $exists: false }
        }).lean();

      for (const cpr of continuePutResponses) {
        if ((new Date().getTime() - new Date(cpr.createdAt).getTime()) / 1000 < 10) {
          throw new Error('The previously submitted data has not yet been processed');
        }
      }

      const { status, msg, data, innerData } = await getEbarimtData({ config, doc });
      if (status !== 'ok' || !(data || innerData)) {
        throw new Error(msg)
      }

      const result: { putData?: IEbarimtDocument, innerData?: IEbarimtFull } = {};
      if (data) {
        const prePutResponse: IEbarimtDocument | undefined =
          await models.PutResponses.putHistory({
            contentType,
            contentId,
          });

        if (prePutResponse) {
          // prePutResponse has not updated then not rePutData
          if (
            prePutResponse.totalAmount === data.totalAmount &&
            prePutResponse.totalVAT === data.totalVAT &&
            prePutResponse.totalCityTax === data.totalCityTax &&
            prePutResponse.receipts &&
            prePutResponse.receipts.length === data.receipts?.length &&
            (prePutResponse.type || 'B2C_RECEIPT') ===
            (data.type || 'B2C_RECEIPT')
          ) {
            return {
              putData: await models.PutResponses.findOne({
                _id: prePutResponse._id,
              }).lean(),
              innerData
            };
          }

          data.inactiveId = prePutResponse.id;
        }

        const resObj = await models.PutResponses.createPutResponse({
          sendInfo: { ...data },
          contentId,
          contentType,
          number: doc.number,
          customerName: data.customerName,
        });

        const response = await fetch(
          `${config.ebarimtUrl}/rest/receipt?`,
          {
            method: 'POST',
            body: JSON.stringify({ ...data }),
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          },
        )
          .then((r) => r.json())
          .catch((err) => {
            throw new Error(err.message);
          });

        if (prePutResponse && response.status === 'SUCCESS') {
          await models.PutResponses.updateOne(
            { _id: prePutResponse._id },
            { $set: { state: 'inactive' } },
          );
        }

        await models.PutResponses.updatePutResponse(resObj._id, {
          ...response
        });
        result.putData = await models.PutResponses.findOne({ _id: resObj._id }).lean() || undefined;
      }

      if (innerData) {
        result.innerData = innerData;
      }

      return result;
    }

    public static async returnBill(doc, config) {
      const url = config.ebarimtUrl || '';
      const { contentType, contentId } = doc;

      const prePutResponses = await models.PutResponses.putHistories({
        contentType,
        contentId,
      });

      if (!prePutResponses.length) {
        return {
          error: 'Буцаалт гүйцэтгэх шаардлагагүй баримт байна.',
        };
      }

      const resultObjIds: string[] = [];
      for (const prePutResponse of prePutResponses) {
        const { date } = prePutResponse;

        if (!prePutResponse.id || !date) {
          continue;
        }

        const data = {
          id: prePutResponse.id,
          date: date,
        };

        const resObj = await models.PutResponses.createPutResponse({
          sendInfo: { ...data },
          contentId,
          contentType,
          number: doc.number,
          inactiveId: prePutResponse.id,
        });

        const delResponse = await await returnResponse(url, data)

        if (delResponse.status === 200) {
          await models.PutResponses.updateOne(
            { _id: prePutResponse._id },
            { $set: { state: 'inactive' } },
          );
          await models.PutResponses.updateOne({ _id: resObj._id }, { $set: { status: 'SUCCESS', modifiedAt: new Date() } })
        } else {
          await models.PutResponses.updateOne({ _id: resObj._id }, { $set: { message: delResponse.message, date: delResponse.date, status: 'ERROR', modifiedAt: new Date() } })
        };

        resultObjIds.push(resObj._id);
      }

      return models.PutResponses.find({ _id: { $in: resultObjIds } })
        .sort({ createdAt: -1 })
        .lean();
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
        state: { $ne: 'inactive' },
        status: 'SUCCESS',
        id: { $nin: ['', null, undefined, 0] },
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
        state: { $ne: 'inactive' },
        status: 'SUCCESS',
        id: { $nin: ['', null, undefined, 0] }
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

  ebarimtSchema.loadClass(PutResponse);

  return ebarimtSchema;
};
