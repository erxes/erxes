import { Ebarimt as EbarimtQueries, ProductRules as ProductRuleQueries } from './queries';
import { Ebarimt as EbarimtMutations, ProductRules as ProductRuleMutations } from './mutations';
import PutResponse from './PutResponse';

const resolvers: any = async () => ({
  PutResponse,
  Query: {
    ...EbarimtQueries,
    ...ProductRuleQueries
  },
  Mutation: {
    ...EbarimtMutations,
    ...ProductRuleMutations
  }
});

export default resolvers;
