import queries from './queries';
import mutations from './mutations';

const resolvers: Record<string, unknown> = {
  Query: queries,
  Mutation: mutations,
};

export default resolvers;
