import { IContext } from '~/connectionResolvers';

const itineraryPdfTemplateQueries = {
  async bmsItineraryPdfTemplateDetail(
    _root,
    { itineraryId, kind }: { itineraryId: string; kind?: string },
    { models }: IContext,
  ) {
    return models.ItineraryPdfTemplates.getTemplateByItinerary(
      itineraryId,
      kind,
    );
  },
};

export default itineraryPdfTemplateQueries;
