import { Actives as ADMutations } from './mutations';

const resolvers: any = async () => ({
  Mutation: {
    ...ADMutations,
  },
});

export default resolvers;
