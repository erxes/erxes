import customScalars from '@erxes/api-utils/src/customScalars';
import Automation from './automation';

import {
  automations as Mutations,
} from './mutations';

import {
  Automations as Queries,
} from './queries';

const resolvers = (serviceDiscovery) => ({
  ...customScalars,
  Automation,
  Mutation: {
    ...Mutations(serviceDiscovery),
  },
  Query: {
    ...Queries,
  }
});

export default resolvers;
