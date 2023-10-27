import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  timeProportionSchema,
  ITimeProportion,
  ITimeProportionDocument
} from './definitions/timeProportions';

export interface ITimeProportionModel extends Model<ITimeProportionDocument> {
  getTimeProportion(filter: any): Promise<ITimeProportionDocument>;
  timeProportionAdd(doc: ITimeProportion): Promise<ITimeProportionDocument>;
  timeProportionEdit(
    _id: string,
    doc: ITimeProportion,
    user: IUserDocument
  ): Promise<ITimeProportionDocument>;
  timeProportionsRemove(_ids: string[]): Promise<JSON>;
}
export const loadTimeProportionClass = (models: IModels) => {
  class TimeProportion {
    public static async getTimeProportion(filter: any) {
      const plan = models.TimeProportions.findOne({ ...filter }).lean();
      if (!plan) {
        throw new Error('Not found year plan');
      }
      return plan;
    }

    public static async timeProportionsAdd(doc: ITimeProportion) {
      return models.TimeProportions.create({ ...doc });
    }

    public static async timeProportionEdit(
      _id: string,
      doc: ITimeProportion,
      user: IUserDocument
    ) {
      await models.TimeProportions.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } }
      );
      return await models.TimeProportions.findOne({ _id }).lean();
    }

    public static async timeProportionsRemove(_ids: string[]) {
      return await models.TimeProportions.deleteMany({ _id: { $in: _ids } });
    }
  }

  timeProportionSchema.loadClass(TimeProportion);

  return timeProportionSchema;
};
