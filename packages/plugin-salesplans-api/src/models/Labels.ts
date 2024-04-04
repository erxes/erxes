import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { labelSchema, ILabel, ILabelDocument } from './definitions/labels';

export interface ILabelModel extends Model<ILabelDocument> {
  labelsAdd(doc: ILabel): Promise<ILabelDocument>;
  labelsEdit(_id: string, doc: ILabel): Promise<ILabelDocument>;
  labelsRemove(_ids: string[]): Promise<JSON>;
}

export const loadLabelClass = (models: IModels) => {
  class Label {
    public static async labelsAdd(doc: ILabel) {
      return models.Labels.create({ ...doc });
    }

    public static async labelsEdit(_id: string, doc: ILabel) {
      return await models.Labels.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async labelsRemove(_ids: string[]) {
      return await models.Labels.deleteMany({ _id: { $in: _ids } });
    }
  }

  labelSchema.loadClass(Label);

  return labelSchema;
};
