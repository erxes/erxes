import queries from '~/modules/branched/graphql/resolvers/queries';
import mutations from '~/modules/branched/graphql/resolvers/mutations';

const resolvers: any = {
  Query: queries,
  Mutation: mutations,
};

export default resolvers;
