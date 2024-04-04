import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IDayLabel,
  IDayLabelDocument,
  dayLabelSchema
} from './definitions/dayLabels';

export interface IDayLabelModel extends Model<IDayLabelDocument> {
  getDayLabel(filter: any): Promise<IDayLabelDocument>;
  dayLabelAdd(doc: IDayLabel): Promise<IDayLabelDocument>;
  dayLabelEdit(
    _id: string,
    doc: IDayLabel,
    user: IUserDocument
  ): Promise<IDayLabelDocument>;
  dayLabelsRemove(_ids: string[]): Promise<JSON>;
  dayLabelsPublish(_ids: string[]): Promise<IDayLabelDocument[]>;
}
export const loadDayLabelClass = (models: IModels) => {
  class DayLabel {
    public static async getDayLabel(filter: any) {
      const plan = models.DayLabels.findOne({ ...filter }).lean();
      if (!plan) {
        throw new Error('Not found year plan');
      }
      return plan;
    }

    public static async dayLabelAdd(doc: IDayLabel) {
      return models.DayLabels.create({ ...doc });
    }

    public static async dayLabelEdit(
      _id: string,
      doc: IDayLabel,
      user: IUserDocument
    ) {
      return await models.DayLabels.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } }
      );
    }

    public static async dayLabelsRemove(_ids: string[]) {
      return await models.DayLabels.deleteMany({ _id: { $in: _ids } });
    }

    public static async dayLabelsPublish(_ids: string[]) {
      return await models.DayLabels.updateMany(
        { _id: { $in: _ids } },
        {
          $set: {
            status: 'publish',
            confirmedData: {
              date: new Date(),
              values: '$values'
            }
          }
        }
      );
    }
  }

  dayLabelSchema.loadClass(DayLabel);

  return dayLabelSchema;
};
