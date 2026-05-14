import { ISmsRequest, ISmsRequestDocument } from '@/broadcast/@types/sms';
import { smsRequestSchema } from '@/broadcast/db/definitions/smsRequest';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ISmsRequestModel extends Model<ISmsRequest> {
  createRequest(doc: ISmsRequest): Promise<ISmsRequestDocument>;
  updateRequest(_id: string, doc: ISmsRequest): Promise<ISmsRequestDocument>;
}

export const loadSmsRequestClass = (models: IModels) => {
  class SmsRequest {
    public static createRequest(doc: ISmsRequest) {
      return models.SmsRequests.create(doc);
    }

    public static async updateRequest(_id: string, doc: ISmsRequest) {
      await models.SmsRequests.updateOne({ _id }, { $set: doc });

      return models.SmsRequests.findOne({ _id });
    }
  }

  smsRequestSchema.loadClass(SmsRequest);

  return smsRequestSchema;
};
