import { Ebarimt as EbarimtQueries, ProductRules as ProductRuleQueries } from './queries';
import { Ebarimt as EbarimtMutations, ProductRules as ProductRuleMutations } from './mutations';

console.log(EbarimtMutations)
const resolvers: any = async () => ({
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
