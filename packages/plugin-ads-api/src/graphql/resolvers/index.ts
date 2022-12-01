import { ads as adsMutations } from './mutations';

import { ads as adsQueries } from './queries';

const resolvers: any = async _serviceDiscovery => ({
  Mutation: {
    ...adsMutations
  },
  Query: {
    ...adsQueries
  }
});

export default resolvers;
