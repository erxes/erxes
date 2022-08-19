import customScalars from '@erxes/api-utils/src/customScalars';
import IntegrationQueries from './integrationQueries';
import IntegrationMutations from './integrationMutations';

const resolvers: any = {
  ...customScalars,
  Query: {
    ...IntegrationQueries,
  },
  Mutation: {
    ...IntegrationMutations
  }
};

export default resolvers;
