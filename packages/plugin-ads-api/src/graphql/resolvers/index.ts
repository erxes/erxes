import ads from "./ads";

import { ads as adsMutations } from "./mutations";

import { ads as adsQueries } from "./queries";

const resolvers: any = async (serviceDiscovery) => ({
  ads,
  Mutation: {
    ...adsMutations,
  },
  Query: {
    ...adsQueries,
  },
});

export default resolvers;
