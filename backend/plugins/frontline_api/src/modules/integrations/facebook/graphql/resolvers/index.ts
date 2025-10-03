import { apolloCustomScalars } from 'erxes-api-shared/utils';

import { facebookMutations } from './mutations';
import { facebookQueries } from './queries';

const resolvers: any = async () => ({
  ...apolloCustomScalars,

  Mutation: {
    ...facebookMutations,
  },
  Query: {
    ...facebookQueries,
  },
});

export default resolvers;
