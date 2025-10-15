import { Model } from 'mongoose';

import {
  ITranslation,
  ITranslationDocument,
} from '@/portal/@types/translations';
import { translationSchema } from '@/portal/db/definitions/translations';
import { IModels } from '~/connectionResolvers';

export interface ITranslationModel extends Model<ITranslationDocument> {
  createTranslation: (
    doc: ITranslation,
  ) => Promise<ITranslationDocument>;
  updateTranslation: (
    _id: string,
    doc: ITranslation,
  ) => Promise<ITranslationDocument>;
  deleteTranslation: (_id: string) => Promise<ITranslationDocument>;
}

export const loadTranslationClass = (models: IModels) => {
  class Translations {
    public static async createTranslation(doc: ITranslation) {
      return await models.Translations.create(doc);
    }

    public static async updateTranslation(
      _id: string,
      doc: ITranslation,
    ) {
      return await models.Translations.findByIdAndUpdate(_id, doc, {
        new: true,
      });
    }

    public static async deleteTranslation(_id: string) {
      return await models.Translations.findByIdAndDelete(_id);
    }
  }

  translationSchema.loadClass(Translations);

  return translationSchema;
};
