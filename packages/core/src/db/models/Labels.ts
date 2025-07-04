import { Model } from "mongoose";
import { IModels } from "../../connectionResolver";
import { ILabelDocument, labelSchema } from "./definitions/labels";
import { IUserDocument } from "./definitions/users";

export interface ILabelModel extends Model<ILabelDocument> {
  saveLabel(doc: ILabelDocument, user: IUserDocument): Promise<ILabelDocument>;
  removeLabel(name: string): Promise<ILabelDocument>;
}

export const loadLabelClass = (models: IModels) => {
  class Label {
    public static async saveLabel(doc: ILabelDocument, user: IUserDocument) {
      const label = await models.Labels.findOne({ name: doc.name });

      if (label) {
        return models.Labels.findOneAndUpdate(
          { name: doc.name },
          { $set: { ...doc, userId: user._id } },
          { new: true }
        );
      }

      return models.Labels.create({ ...doc, userId: user._id });
    }

    public static async removeLabel(name: string) {
      return models.Labels.findOneAndDelete({ name });
    }
  }

  labelSchema.loadClass(Label);

  return labelSchema;
};
