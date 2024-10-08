import customScalars from '@erxes/api-utils/src/customScalars';

import mutationsElement from './mutations/element';
import queriesElement from './queries/element';

import mutationItinerary from './mutations/itinerary';
import queriesItinerary from './queries/itinerary';

import mutationTour from './mutations/tour';
import queriesTour from './queries/tour';

import ElementItem from './elementItemResolver';
import Tour from './tourResolver';

const resolvers: any = async () => ({
  ...customScalars,
  ElementItem,
  Tour,
  Mutation: {
    ...mutationsElement,
    ...mutationItinerary,
    ...mutationTour,
  },
  Query: {
    ...queriesElement,
    ...queriesItinerary,
    ...queriesTour,
  },
});

export default resolvers;
