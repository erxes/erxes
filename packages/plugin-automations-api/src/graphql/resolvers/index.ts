import customScalars from '@erxes/api-utils/src/customScalars';
import Automation from './automation';
import AutomationNote from './note';

import { automations as Mutations } from './mutations';

import { Automations as Queries } from './queries';

const resolvers = serviceDiscovery => ({
  ...customScalars,
  Automation,
  AutomationNote,
  Mutation: {
    ...Mutations(serviceDiscovery)
  },
  Query: {
    ...Queries
  }
});

export default resolvers;
