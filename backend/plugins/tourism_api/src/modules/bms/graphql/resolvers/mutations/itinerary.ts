import { IContext } from '~/connectionResolvers';
import { IItinerary } from '@/bms/@types/itinerary';

const saveItineraryTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  await Promise.all(
    translations.map((t) =>
      models.ItineraryTranslations.upsertTranslation({ ...t, objectId }),
    ),
  );
};

const itineraryMutations = {
  bmsItineraryAdd: async (
    _root,
    { translations, ...doc }: { translations?: any[] } & IItinerary,
    { user, models }: IContext,
  ) => {
    const itinerary = await models.Itineraries.createItinerary(doc, user);
    if (!itinerary || !itinerary._id) {
      throw new Error('Failed to create itinerary.');
    }
    await saveItineraryTranslations(models, itinerary._id, translations ?? []);
    return itinerary;
  },

  bmsItineraryEdit: async (
    _root,
    {
      _id,
      translations,
      ...doc
    }: { _id: string; translations?: any[] } & Partial<IItinerary>,
    { models }: IContext,
  ) => {
    const updated = await models.Itineraries.updateItinerary(_id, doc as any);
    await saveItineraryTranslations(models, _id, translations ?? []);
    return updated;
  },

  bmsItineraryRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await Promise.all(
      ids.map((id) =>
        models.ItineraryTranslations.deleteTranslationsForObject(id),
      ),
    );
    await models.Itineraries.removeItinerary(ids);

    return ids;
  },
};

export default itineraryMutations;
