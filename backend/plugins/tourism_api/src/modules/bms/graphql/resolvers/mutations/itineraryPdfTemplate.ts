import { IItineraryPdfTemplate } from '@/bms/@types/itineraryPdfTemplate';
import { IContext } from '~/connectionResolvers';

const itineraryPdfTemplateMutations = {
  async bmsItineraryPdfTemplateUpsert(
    _root,
    { input }: { input: IItineraryPdfTemplate },
    { models, user }: IContext,
  ) {
    const itinerary = await models.Itineraries.findOne({
      _id: input.itineraryId,
    });

    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    return models.ItineraryPdfTemplates.upsertTemplate(
      {
        ...input,
        branchId: input.branchId || itinerary.branchId,
        kind: input.kind || 'custom-builder',
      },
      user,
    );
  },
};

export default itineraryPdfTemplateMutations;
