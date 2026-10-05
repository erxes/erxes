import { changemoduleItemMutations } from '../modules/changemodule/graphql/resolvers/mutations';
import { changemoduleItemQueries } from '../modules/changemodule/graphql/resolvers/queries';

const resolvers = {
  Mutation: {
    ...changemoduleItemMutations,
  },
  Query: {
    ...changemoduleItemQueries,
  },
};

export default resolvers;
