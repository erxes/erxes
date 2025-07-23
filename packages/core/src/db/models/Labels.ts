import { Model } from "mongoose";
import { IModels } from "../../connectionResolver";
import { DEFAULT_LABELS } from "../../data/constants";
import { ILabel, ILabelDocument, labelSchema } from "./definitions/labels";
import { IUserDocument } from "./definitions/users";

export interface ILabelModel extends Model<ILabelDocument> {
  saveLabel(doc: ILabel, user: IUserDocument): Promise<ILabelDocument>;
  removeLabel(name: string): Promise<ILabelDocument>;
}

export const loadLabelClass = (models: IModels) => {
  class Label {
    public static async validateLabel(doc: ILabelDocument) {
      const defaultLabel = DEFAULT_LABELS[doc.forType];

      if (!defaultLabel) {
        throw new Error(`Invalid label type: '${doc.forType}'`);
      }

      const label = defaultLabel.find(
        (label) => label.name.toLowerCase() === doc.name.toLowerCase()
      );

      if (label) {
        throw new Error(
          `You can't create a label with the same name: '${doc.name}'`
        );
      }
    }

    public static async saveLabel(doc: ILabelDocument, user: IUserDocument) {
      await this.validateLabel(doc);

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
