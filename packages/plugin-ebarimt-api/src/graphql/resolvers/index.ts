import { Ebarimt as EbarimtQueries } from './queries';
import { Ebarimt as EbarimtMutations } from './mutations';

const resolvers: any = async () => ({
  Query: {
    ...EbarimtQueries
  },
  Mutation: {
    ...EbarimtMutations
  }
});

export default resolvers;
