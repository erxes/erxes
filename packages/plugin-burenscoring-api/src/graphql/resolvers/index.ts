import customScalars from '@erxes/api-utils/src/customScalars';
import burenScoringQueries from './queries/queries';
import mutations from './mutations/toSaveBurenScoring';

const resolvers: any = async () => ({
  ...customScalars,
  Mutation: {
    ...mutations
  },
  Query: {
    ...burenScoringQueries,
  },
});

export default resolvers;
