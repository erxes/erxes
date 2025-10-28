import { Ebarimt as EbarimtQueries, ProductRules as ProductRuleQueries, ProductGroups as ProductGroupQueries } from './queries';
import { Ebarimt as EbarimtMutations, ProductRules as ProductRuleMutations, ProductGroups as ProductGroupMutations } from './mutations';
import PutResponse from '@/ebarimt/graphql/resolvers/customResolver/PutResponse';
import EbarimtProductGroup from '@/ebarimt/graphql/resolvers/customResolver/EbarimtProductGroup';

const resolvers: any = async () => ({
  PutResponse,
  EbarimtProductGroup,
  Query: {
    ...EbarimtQueries,
    ...ProductRuleQueries,
    ...ProductGroupQueries,
  },
  Mutation: {
    ...EbarimtMutations,
    ...ProductRuleMutations,
    ...ProductGroupMutations,
  }
});

export default resolvers;
