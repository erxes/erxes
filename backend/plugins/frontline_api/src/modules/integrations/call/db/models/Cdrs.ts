import { Model } from 'mongoose';
import { CDRSchema } from '../definitions/cdrs';
import { ICallCdr, ICallCdrDocument } from '@/integrations/call/@types/cdrs';
import { IModels } from '~/connectionResolvers';

export interface ICallCdrModel extends Model<ICallCdrDocument> {
  cdrAdd(doc: ICallCdr): Promise<ICallCdrDocument>;
  getCdr(selector: any): Promise<ICallCdrDocument>;
  updateCdr(_id: string, doc: ICallCdr): Promise<ICallCdrDocument>;
}

export const loadCallCdrClass = (models: IModels) => {
  class Cdr {
    public static async getCdr(selector: any) {
      const cdrs = await models.CallCdrs.findOne(selector);

      if (!cdrs) {
        throw new Error('Cdrs not found');
      }

      return cdrs;
    }

    public static async cdrAdd(doc: ICallCdr) {
      const cdr = await models.CallCdrs.findOne({
        acctId: doc.acctId,
      }).lean();

      if (cdr) {
        throw new Error('Already created cdr');
      }

      return models.CallCdrs.create(doc);
    }

    public static async updateCdr(_id: string, doc: ICallCdr) {
      const cdr = await models.CallCdrs.findOne({
        acctId: doc.acctId,
      }).lean();

      if (!cdr) {
        throw new Error('Cdr not found');
      }

      await models.CallCdrs.updateOne({ _id }, { $set: doc });

      return models.CallCdrs.findOne({ _id });
    }
  }

  CDRSchema.loadClass(Cdr);

  return CDRSchema;
};
