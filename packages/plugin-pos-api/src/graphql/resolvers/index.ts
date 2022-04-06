import { Pos as PosMutations } from "./mutations";

import { Pos as PosQueries } from "./queries";

import Pos from "./pos";

const resolvers: any = async (serviceDiscovery) => ({
  Pos,

  Mutation: {
    ...PosMutations,
  },

  Query: {
    ...PosQueries,
  },
});

export default resolvers;
