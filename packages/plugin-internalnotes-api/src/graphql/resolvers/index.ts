import customScalars from '@erxes/api-utils/src/customScalars';
import InternalNote from './internalNote';

import {
  internalNotes as Mutations,
} from './mutations';

import {
  InternalNotes as Queries,
} from './queries';

const resolvers = (serviceDiscovery) => ({
  ...customScalars,
  InternalNote,
  Mutation: {
    ...Mutations(serviceDiscovery),
  },
  Query: {
    ...Queries,
  }
});

export default resolvers;
