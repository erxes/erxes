import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import WebbuilderContentType from './contentType';
import WebbuilderPage from './page';
import WebbuilderSite from './site';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  WebbuilderContentType,
  WebbuilderPage,
  WebbuilderSite,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
