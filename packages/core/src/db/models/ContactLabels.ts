import { Model } from "mongoose";
import { IModels } from "../../connectionResolver";
import { DEFAULT_LABELS } from "../../data/constants";
import {
  IContactLabel,
  IContactLabelDocument,
  contactLabelSchema,
} from "./definitions/contactLabels";
import { IUserDocument } from "./definitions/users";

export interface IContactLabelModel extends Model<IContactLabelDocument> {
  saveContactLabel(
    doc: IContactLabel,
    user: IUserDocument
  ): Promise<IContactLabelDocument>;
  removeContactLabel(name: string): Promise<IContactLabelDocument>;
}

export const loadContactLabelClass = (models: IModels) => {
  class ContactLabel {
    public static async validateLabel(doc: IContactLabelDocument) {
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

    public static async saveContactLabel(
      doc: IContactLabelDocument,
      user: IUserDocument
    ) {
      await this.validateLabel(doc);

      const label = await models.ContactLabels.findOne({ name: doc.name });

      if (label) {
        return models.ContactLabels.findOneAndUpdate(
          { name: doc.name },
          { $set: { ...doc, userId: user._id } },
          { new: true }
        );
      }

      return models.ContactLabels.create({ ...doc, userId: user._id });
    }

    public static async removeContactLabel(name: string) {
      return models.ContactLabels.findOneAndDelete({ name });
    }
  }

  contactLabelSchema.loadClass(ContactLabel);

  return contactLabelSchema;
};
