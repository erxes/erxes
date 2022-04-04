import { Ebarimt as EbarimtQueries } from "./queries";

const resolvers: any = async (serviceDiscovery) => ({
  Query: {
    ...EbarimtQueries,
  },
});

export default resolvers;
