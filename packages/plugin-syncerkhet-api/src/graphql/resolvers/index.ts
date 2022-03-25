import customScalars from '@erxes/api-utils/src/customScalars';

import {

} from './queries';

const resolvers: any = async (serviceDiscovery) => (

  {
    ...customScalars,
    Mutation: {
    },
    Query: {
    }
  });

export default resolvers;
