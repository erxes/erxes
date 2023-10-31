import customScalars from '@erxes/api-utils/src/customScalars';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,

  Query: {},

  Mutation: {}
});

export default resolvers;
