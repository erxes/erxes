import customScalars from '@erxes/api-utils/src/customScalars';
import mutations from './mutations';
import queries from './queries';
import { Page } from './page';
import Post from './post';

const resolvers: any = async () => ({
  ...customScalars,
  Post,
  Page,
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
