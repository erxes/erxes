import { ICustomField, IUser, IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { labelSchema, ILabel, ILabelDocument } from './definitions/labels';

export interface ILabelModel extends Model<ILabelDocument> {
  saveLabels(doc: {
    add: ILabel[];
    update: ILabelDocument[];
  }): Promise<ILabelDocument[]>;
  updateLabel(_id: string): Promise<ILabelDocument>;
  removeLabel(_id: string): Promise<JSON>;
}

export const loadLabelClass = (models: IModels) => {
  class Label {
    public static async saveLabels(doc: {
      add: ILabel[];
      update: ILabelDocument[];
    }) {
      const { add, update } = doc;

      for (const item of update)
        await models.Labels.updateOne({ _id: item._id }, { $set: { ...item } });

      return await models.Labels.insertMany(add);
    }

    public static async updateLabel(models: IModels, doc: any) {
      const { _id } = doc;

      delete doc._id;

      return await models.Labels.update({ _id }, { $set: doc });
    }

    public static async removeLabel(_id: String) {
      return await models.Labels.remove({ _id });
    }
  }

  labelSchema.loadClass(Label);

  return labelSchema;
};
