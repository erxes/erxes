import { ICustomField, IUser, IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { labelSchema, ILabel, ILabelDocument } from './definitions/labels';

export interface ILabelModel extends Model<ILabelDocument> {
  labelsEdit(doc: {
    add: ILabel[];
    update: ILabelDocument[];
  }): Promise<ILabelDocument[]>;
  labelsRemove(_id: string): Promise<JSON>;
}

export const loadLabelClass = (models: IModels) => {
  class Label {
    public static async labelsEdit(doc: {
      add: ILabel[];
      update: ILabelDocument[];
    }) {
      const { add, update } = doc;

      for (const item of update)
        await models.Labels.updateOne({ _id: item._id }, { $set: { ...item } });

      return await models.Labels.insertMany(add);
    }

    public static async labelsRemove(_id: String) {
      return await models.Labels.remove({ _id });
    }
  }

  labelSchema.loadClass(Label);

  return labelSchema;
};
