import { IContext } from '~/connectionResolvers';

type PersonCostRow = {
  persons: string;
  price: number;
};

const normalizePersonCost = (
  personCost: unknown,
): PersonCostRow[] | undefined => {
  if (personCost === undefined) {
    return undefined;
  }

  if (personCost === null) {
    return [];
  }

  const pairs: Array<[unknown, unknown]> = Array.isArray(personCost)
    ? personCost.map((row) => [(row as any)?.persons, (row as any)?.price])
    : typeof personCost === 'object'
    ? Object.entries(personCost as Record<string, unknown>)
    : [];

  return pairs
    .map(([persons, price]) => ({
      persons: String(persons ?? '').trim(),
      price: Number(price),
    }))
    .filter(
      ({ persons, price }) => persons && Number.isFinite(price) && price >= 0,
    );
};

const withNormalizedPersonCost = (doc: Record<string, unknown>) =>
  Object.prototype.hasOwnProperty.call(doc, 'personCost')
    ? { ...doc, personCost: normalizePersonCost(doc.personCost) }
    : doc;

const itineraryMutations = {
  bmsItineraryAdd: async (_root, doc, { user, models }: IContext) => {
    const sanitizedDoc = withNormalizedPersonCost(
      doc as Record<string, unknown>,
    );
    return models.Itineraries.createItinerary(sanitizedDoc as any, user);
  },

  bmsItineraryEdit: async (_root, { _id, ...doc }, { models }: IContext) => {
    const sanitizedDoc = withNormalizedPersonCost(
      doc as Record<string, unknown>,
    );
    const updated = await models.Itineraries.updateItinerary(
      _id,
      sanitizedDoc as any,
    );
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
