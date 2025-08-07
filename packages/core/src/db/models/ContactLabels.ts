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
  removeContactLabel(
    name: string,
    user: IUserDocument
  ): Promise<IContactLabelDocument>;
}

export const loadContactLabelClass = (models: IModels) => {
  class ContactLabel {
    public static async validateLabel(doc: IContactLabelDocument) {
      if (!doc.name?.trim()) {
        throw new Error("Label name is required");
      }

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

      return models.ContactLabels.findOneAndUpdate(
        { name: doc.name, forType: doc.forType, userId: user._id },
        {
          $setOnInsert: {
            createdAt: new Date(),
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }

    public static async removeContactLabel(name: string, user: IUserDocument) {
      if (!name?.trim()) {
        throw new Error("Label name is required");
      }

      return models.ContactLabels.findOneAndDelete({ name, userId: user._id });
    }
  }

  contactLabelSchema.loadClass(ContactLabel);

  return contactLabelSchema;
};
