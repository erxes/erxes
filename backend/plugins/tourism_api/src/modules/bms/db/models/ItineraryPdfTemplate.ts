import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IItineraryPdfTemplate,
  IItineraryPdfTemplateDocument,
} from '@/bms/@types/itineraryPdfTemplate';
import { itineraryPdfTemplateSchema } from '@/bms/db/definitions/itineraryPdfTemplate';

export interface IItineraryPdfTemplateModel
  extends Model<IItineraryPdfTemplateDocument> {
  getTemplateByItinerary(
    itineraryId: string,
    kind?: string,
  ): Promise<IItineraryPdfTemplateDocument | null>;
  upsertTemplate(
    doc: IItineraryPdfTemplate,
    user?: { _id?: string },
  ): Promise<IItineraryPdfTemplateDocument>;
}

export const loadItineraryPdfTemplateClass = (models: IModels) => {
  class ItineraryPdfTemplate {
    public static async getTemplateByItinerary(
      itineraryId: string,
      kind = 'custom-builder',
    ) {
      return models.ItineraryPdfTemplates.findOne({ itineraryId, kind });
    }

    public static async upsertTemplate(
      doc: IItineraryPdfTemplate,
      user?: { _id?: string },
    ) {
      const now = new Date();
      const userId = user?._id || '';
      const selector = {
        itineraryId: doc.itineraryId,
        kind: doc.kind || 'custom-builder',
      };

      const existing = await models.ItineraryPdfTemplates.findOne(selector);

      if (existing) {
        await models.ItineraryPdfTemplates.updateOne(selector, {
          $set: {
            ...doc,
            kind: selector.kind,
            modifiedAt: now,
            modifiedBy: userId || existing.modifiedBy || existing.createdBy,
          },
        });

        return models.ItineraryPdfTemplates.findOne(selector);
      }

      return models.ItineraryPdfTemplates.create({
        ...doc,
        kind: selector.kind,
        createdAt: now,
        modifiedAt: now,
        createdBy: userId,
        modifiedBy: userId,
      });
    }
  }

  itineraryPdfTemplateSchema.loadClass(ItineraryPdfTemplate);
  return itineraryPdfTemplateSchema;
};
