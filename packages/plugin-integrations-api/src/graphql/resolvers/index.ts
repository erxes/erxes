import customScalars from '@erxes/api-utils/src/customScalars';
import LogQueries from './logQueries';

const resolvers: any = {
  ...customScalars,
  Query: {
    ...LogQueries,
  },
};

export default resolvers;
