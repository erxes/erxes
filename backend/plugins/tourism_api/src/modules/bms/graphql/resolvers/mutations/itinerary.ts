import { IContext } from '~/connectionResolvers';

const itineraryMutations = {
  bmsItineraryAdd: async (_root, doc, { user, models }: IContext) => {
    return models.Itineraries.createItinerary(doc, user);
  },

  bmsItineraryEdit: async (_root, { _id, ...doc }, { models }: IContext) => {
    const updated = await models.Itineraries.updateItinerary(_id, doc as any);
    return updated;
  },

  bmsItineraryRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await models.Itineraries.removeItinerary(ids);

    return ids;
  },
};

export default itineraryMutations;
