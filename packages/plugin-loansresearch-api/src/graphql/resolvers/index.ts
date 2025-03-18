import LoansResearch from './loanResearch';
import { LoansResearch as LRMutations } from './mutations';
import { LoansResearch as LRQueries } from './queries';

const resolvers: any = async () => ({
  LoansResearch,
  Mutation: {
    ...LRMutations,
  },
  Query: {
    ...LRQueries,
  },
});

export default resolvers;
