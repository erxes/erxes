import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IReserveRemDocument, IReserveRem } from '../../@types/reserveRems';
import { reserveRemSchema } from '../definitions/reserveRems';

export interface IReserveRemModel extends Model<IReserveRemDocument> {
  getReserveRem(filter: any): Promise<IReserveRemDocument>;
  reserveRemAdd(doc: IReserveRem): Promise<IReserveRemDocument>;
  reserveRemEdit(
    _id: string,
    doc: IReserveRem,
    user: IUserDocument,
  ): Promise<IReserveRemDocument>;
  reserveRemsRemove(_ids: string[]): Promise<JSON>;
  reserveRemsPublish(_ids: string[]): Promise<IReserveRemDocument[]>;
}
export const loadReserveRemClass = (models: IModels, _subdomain: string) => {
  class ReserveRem {
    public static async getReserveRem(filter: any) {
      const plan = models.ReserveRems.findOne({ ...filter }).lean();
      if (!plan) {
        throw new Error('Not found year plan');
      }
      return plan;
    }

    public static async reserveRemAdd(doc: IReserveRem) {
      return models.ReserveRems.create({ ...doc });
    }

    public static async reserveRemEdit(
      _id: string,
      doc: IReserveRem,
      user: IUserDocument,
    ) {
      return await models.ReserveRems.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } },
      );
    }

    public static async reserveRemsRemove(_ids: string[]) {
      return await models.ReserveRems.deleteMany({ _id: { $in: _ids } });
    }

    public static async reserveRemsPublish(_ids: string[]) {
      return await models.ReserveRems.updateMany(
        { _id: { $in: _ids } },
        {
          $set: {
            status: 'publish',
            confirmedData: {
              date: new Date(),
              values: '$values',
            },
          },
        },
      );
    }
  }

  reserveRemSchema.loadClass(ReserveRem);

  return reserveRemSchema;
};
