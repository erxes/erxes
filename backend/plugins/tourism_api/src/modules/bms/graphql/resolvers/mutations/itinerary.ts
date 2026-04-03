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
    await saveItineraryTranslations(models, itinerary._id, translations ?? []);
    return itinerary;
  },

  bmsItineraryEdit: async (
    _root,
    { _id, translations, ...doc }: { _id: string; translations?: any[] } & Partial<IItinerary>,
    { models }: IContext,
  ) => {
    const itinerary = await models.Itineraries.updateItinerary(_id, doc as IItinerary);
    await saveItineraryTranslations(models, _id, translations ?? []);
    return itinerary;
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

  // Standalone — edit just a translation without touching the itinerary
  bmsItineraryTranslationUpsert: async (
    _root,
    { input }: { input: any },
    { models }: IContext,
  ) => {
    const itinerary = await models.Itineraries.findOne({ _id: input.objectId });
    if (!itinerary) throw new Error('Itinerary not found');
    return models.ItineraryTranslations.upsertTranslation(input);
  },

  bmsItineraryTranslationDelete: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.ItineraryTranslations.deleteTranslation(_id);
  },
};

export default itineraryMutations;