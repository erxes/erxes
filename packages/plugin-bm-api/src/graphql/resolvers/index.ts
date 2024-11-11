import customScalars from '@erxes/api-utils/src/customScalars';

import mutationsElement from './mutations/element';
import queriesElement from './queries/element';

import mutationItinerary from './mutations/itinerary';
import queriesItinerary from './queries/itinerary';

import mutationTour from './mutations/tour';
import queriesTour from './queries/tour';

import mutationOrder from './mutations/order';
import queriesOrder from './queries/order';

import ElementItem from './elementItemResolver';
import Element from './element';

import Tour from './tourResolver';

const resolvers: any = async () => ({
  ...customScalars,
  ElementItem,
  Element,
  Tour,
  Mutation: {
    ...mutationsElement,
    ...mutationItinerary,
    ...mutationTour,
    ...mutationOrder,
  },
  Query: {
    ...queriesElement,
    ...queriesItinerary,
    ...queriesTour,
    ...queriesOrder,
  },
});

export default resolvers;
