import { Model } from 'mongoose';
import fetch from 'node-fetch';
import { IDoc, getEbarimtData } from './PutData';
import {
  IEbarimt,
  IEbarimtDocument,
  IEbarimtFull,
  ebarimtSchema,
} from '../definitions/putResponses';
import { IModels } from '~/connectionResolvers';
import { IEbarimtConfig } from '~/modules/posclient/@types/configs';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';

export interface IPutResponseModel extends Model<IEbarimtDocument> {
  putData(
    doc: IDoc,
    config: IEbarimtConfig,
    posToken: string,
    user?: IPosUserDocument,
  ): Promise<{ putData?: IEbarimtDocument; innerData?: IEbarimtFull }>;
  returnBill(
    doc: { contentType: string; contentId: string; number: string },
    config: IEbarimtConfig,
    user?: IPosUserDocument,
  ): Promise<IEbarimtDocument[]>;
  putHistory({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }): Promise<IEbarimtDocument>;
  putHistories({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }): Promise<IEbarimtDocument[]>;
  createPutResponse(doc: IEbarimt): Promise<IEbarimtDocument>;
  updatePutResponse(_id: string, doc: IEbarimt): Promise<IEbarimtDocument>;
}

const checkContinuingRequest = async (models, contentType, contentId) => {
  const continuePutResponses: IEbarimtDocument[] =
    await models.PutResponses.find({
      contentType,
      contentId,
      modifiedAt: { $exists: false },
    }).lean();

  if (continuePutResponses.length) {
    for (const cpr of continuePutResponses) {
      if (
        (new Date().getTime() - new Date(cpr.createdAt).getTime()) / 1000 <
        10
      ) {
        throw new Error(
          'The previously submitted data has not yet been processed',
        );
      }
    }
  }
};

export const loadPutResponseClass = (models: IModels) => {
  class PutResponse {
    public static async putData(
      doc: IDoc,
      config: IEbarimtConfig,
      posToken: string,
      user?: IPosUserDocument,
    ) {
      // check previously post
      const { contentId, contentType } = doc;
      await checkContinuingRequest(models, contentType, contentId);

      const { status, msg, data, innerData } = await getEbarimtData({
        config,
        doc,
        posToken,
      });

      if (status !== 'ok' || !(data || innerData)) {
        throw new Error(msg);
      }

      const result: { putData?: IEbarimtDocument; innerData?: IEbarimtFull } =
        {};

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
              innerData,
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
          userId: user?._id,
        });

        const response = await fetch(`${config.ebarimtUrl}/rest/receipt?`, {
          method: 'POST',
          body: JSON.stringify({ ...data }),
          headers: {
            'Content-Type': 'application/json',
          },
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

        await models.OrderItems.updateMany(
          {
            orderId: contentId,
            isInner: true,
          },
          { $set: { isInner: false } },
        );

        await models.PutResponses.updatePutResponse(resObj._id, {
          ...response,
          // customerName: params.customerName,
        });

        result.putData =
          (await models.PutResponses.findOne({ _id: resObj._id }).lean()) ||
          undefined;
      }

      if (innerData) {
        await models.OrderItems.updateMany(
          {
            orderId: contentId,
            _id: {
              $in: ((innerData.receipts || [])[0]?.items || []).map(
                (i) => i.recId,
              ),
            },
          },
          { $set: { isInner: true } },
        );
        result.innerData = innerData;
      }

      return result;
    }

    public static async returnBill(doc, config, user?) {
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
          userId: user?._id,
        });

        const delResponse = await fetch(`${url}/rest/receipt`, {
          method: 'DELETE',
          body: JSON.stringify({ ...data }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(async (r) => {
            if (r.status === 200) {
              return { status: 200 };
            }
            try {
              return r.json();
            } catch (e) {
              return {
                status: 'ERROR',
                message: e.message,
              };
            }
          })
          .catch((err) => {
            return {
              status: 'ERROR',
              message: err.message,
            };
          });

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
          return {
            error: `Буцаалтын хүсэлт бүтэлгүй боллоо. ${delResponse.message}`,
          };
        }

        resultObjIds.push(resObj._id);
      }

      return models.PutResponses.find({ _id: { $in: resultObjIds } })
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async putHistory({
      contentType,
      contentId,
    }: {
      contentType: string;
      contentId: string;
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
      contentId,
    }: {
      contentType: string;
      contentId: string;
    }) {
      return await models.PutResponses.find({
        contentId,
        contentType,
        state: { $ne: 'inactive' },
        status: 'SUCCESS',
        id: { $nin: ['', null, undefined, 0] },
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
        createdAt: new Date(),
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
            modifiedAt: new Date(),
          },
        },
      );

      return response;
    }
  }

  ebarimtSchema.loadClass(PutResponse);

  return ebarimtSchema;
};
