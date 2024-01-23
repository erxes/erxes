import customScalars from '@erxes/api-utils/src/customScalars';
import InternalNote from './internalNote';

import { internalNotes as Mutations } from './mutations';

import { InternalNotes as Queries } from './queries';

const resolvers = () => ({
  ...customScalars,
  InternalNote,
  Mutation: {
    ...Mutations(),
  },
  Query: {
    ...Queries,
  },
});

export default resolvers;
