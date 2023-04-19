import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import DigtalRoomContentType from './contentType';
import DigtalRoomPage from './page';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  DigtalRoomContentType,
  DigtalRoomPage,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
