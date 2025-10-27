import fetch from 'node-fetch';
import { Model } from 'mongoose';
import {
  IEbarimt,
  IEbarimtDocument,
  ebarimtSchema,
} from '../definitions/ebarimt';
import { IEbarimtConfig } from '../definitions/configs';

/**
 * IDoc defines the document structure for Ebarimt posting
 */
export interface IDoc {
  contentType: string;
  contentId: string;
  number?: string;
  register?: string;
  customerName?: string;
  totalAmount?: number;
  totalVAT?: number;
  totalCityTax?: number;
  receipts?: any[];
}

/**
 * Get Ebarimt data before posting
 * This function builds the correct payload and validates the structure.
 */
export async function getEbarimtData({
  config,
  doc,
}: {
  config: IEbarimtConfig;
  doc: IDoc;
}): Promise<{
  status: 'ok' | 'error';
  msg: string;
  data?: any;
  innerData?: any;
}> {
  try {
    const { ebarimtUrl } = config;
    if (!ebarimtUrl) {
      return { status: 'error', msg: 'Ebarimt API URL not configured' };
    }

    // You may adjust endpoint or logic depending on ERP data flow
    const res = await fetch(`${ebarimtUrl}/rest/receipt/data`, {
      method: 'POST',
      body: JSON.stringify(doc),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text();
      return { status: 'error', msg: `Ebarimt API error: ${text}` };
    }

    const json = await res.json();

    // Typical structure: { data, innerData, msg, status }
    if (!json.data && !json.innerData) {
      return { status: 'error', msg: json.msg || 'Empty response from Ebarimt' };
    }

    return {
      status: 'ok',
      msg: 'success',
      data: json.data,
      innerData: json.innerData,
    };
  } catch (e: any) {
    return {
      status: 'error',
      msg: e.message || 'Unexpected error while getting Ebarimt data',
    };
  }
}

export interface IPutResponseModel extends Model<IEbarimtDocument> {
  putData(
    doc: IDoc,
    config: IEbarimtConfig,
    user?: { _id: string },
  ): Promise<{ putData?: IEbarimtDocument; innerData?: any }>;
  returnBill(
    doc: { contentType: string; contentId: string; number: string },
    config: IEbarimtConfig,
    user?: { _id: string },
  ): Promise<IEbarimtDocument[]>;
  putHistory(args: { contentType: string; contentId: string }): Promise<IEbarimtDocument>;
  putHistories(args: { contentType: string; contentId: string }): Promise<IEbarimtDocument[]>;
  createPutResponse(doc: IEbarimt): Promise<IEbarimtDocument>;
  updatePutResponse(_id: string, doc: IEbarimt): Promise<IEbarimtDocument>;
}

/**
 * Model loader with static Ebarimt handling logic
 */
export const loadPutResponseClass = (models: {
  PutResponses: IPutResponseModel;
}) => {
  class PutResponse {
    public static async putData(doc: IDoc, config: IEbarimtConfig, user?: { _id: string }) {
      const { contentId, contentType } = doc;

      // Prevent re-submission
      const continuePutResponses = await models.PutResponses.find({
        contentType,
        contentId,
        modifiedAt: { $exists: false },
      }).lean();

      for (const cpr of continuePutResponses) {
  if (
    cpr.createdAt &&
    (Date.now() - new Date(cpr.createdAt).getTime()) / 1000 < 10
  ) {
    throw new Error('The previously submitted data has not yet been processed');
  }
       
       
      }

      const { status, msg, data, innerData } = await getEbarimtData({ config, doc });
      if (status !== 'ok' || !(data || innerData)) {
        throw new Error(msg);
      }

      const result: { putData?: IEbarimtDocument; innerData?: any } = {};

      if (data) {
        const prePutResponse = await models.PutResponses.putHistory({
          contentType,
          contentId,
        });

        if (prePutResponse) {
          const sameData =
            prePutResponse.totalAmount === data.totalAmount &&
            prePutResponse.totalVAT === data.totalVAT &&
            prePutResponse.totalCityTax === data.totalCityTax &&
            prePutResponse.receipts?.length === data.receipts?.length &&
            (prePutResponse.type || 'B2C_RECEIPT') === (data.type || 'B2C_RECEIPT');

          if (sameData) {
            return {
              putData: await models.PutResponses.findOne({
                _id: prePutResponse._id,
              }).lean(),
              innerData,
            };
          }

          data.inactiveId = prePutResponse.id;
        }

        const resObj = await models.PutResponses.createPutResponse({
  sendInfo: { ...data },
  contentId,
  contentType,
  number: doc.number ?? '', 
  customerName: data.customerName,
  userId: user?._id,
        
         
 });

        const response = await fetch(`${config.ebarimtUrl}/rest/receipt`, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        })
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

        await models.PutResponses.updatePutResponse(resObj._id, { ...response });
        result.putData =
          (await models.PutResponses.findOne({ _id: resObj._id }).lean()) || undefined;
      }

      if (innerData) {
        result.innerData = innerData;
      }

      return result;
    }

    public static async returnBill(doc: any, config: IEbarimtConfig, user?: { _id: string }) {
      const url = config.ebarimtUrl || '';
      const { contentType, contentId } = doc;

      const prePutResponses = await models.PutResponses.putHistories({
        contentType,
        contentId,
      });

      if (!prePutResponses.length) {
        throw new Error('Буцаалт гүйцэтгэх шаардлагагүй баримт байна.');
      }

      const resultObjIds: string[] = [];
      for (const prePutResponse of prePutResponses) {
        const { date } = prePutResponse;
        if (!prePutResponse.id || !date) continue;

        const data = { id: prePutResponse.id, date };

        const resObj = await models.PutResponses.createPutResponse({
          sendInfo: { ...data },
          contentId,
          contentType,
          number: doc.number,
          inactiveId: prePutResponse.id,
          userId: user?._id,
        });

        const delResponse = await returnResponse(url, data);

        if (delResponse.status === 200) {
          await models.PutResponses.updateOne(
            { _id: prePutResponse._id },
            { $set: { state: 'inactive' } },
          );
          await models.PutResponses.updateOne(
            { _id: resObj._id },
            { $set: { status: 'SUCCESS', modifiedAt: new Date() } },
          );
        } else {
          await models.PutResponses.updateOne(
            { _id: resObj._id },
            {
              $set: {
                message: delResponse.message,
                date: delResponse.date,
                status: 'ERROR',
                modifiedAt: new Date(),
              },
            },
          );
        }

        resultObjIds.push(resObj._id);
      }

      return models.PutResponses.find({ _id: { $in: resultObjIds } })
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async putHistory({ contentType, contentId }: { contentType: string; contentId: string }) {
      return await models.PutResponses.findOne({
        contentId,
        contentType,
        state: { $ne: 'inactive' },
        status: 'SUCCESS',
        id: { $nin: ['', null, undefined, '0'] },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async putHistories({ contentType, contentId }: { contentType: string; contentId: string }) {
      return await models.PutResponses.find({
        contentId,
        contentType,
        state: { $ne: 'inactive' },
        status: 'SUCCESS',
        id: { $nin: ['', null, undefined, '0'] },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async createPutResponse(doc: IEbarimt) {
      return await models.PutResponses.create({ ...doc, createdAt: new Date() });
    }

    public static async updatePutResponse(_id: string, doc: IEbarimt) {
      await models.PutResponses.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } },
      );
      return models.PutResponses.findById(_id).lean();
    }
  }

  ebarimtSchema.loadClass(PutResponse);
  return ebarimtSchema;
};

async function returnResponse(url: string, data: any) {
  const res = await fetch(`${url}/rest/receipt`, {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}
