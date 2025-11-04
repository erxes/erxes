import { ebarimtMutations } from '@/ebarimt/graphql/resolvers/mutations';
import { erkhetMutations } from '@/erkhet/graphql/resolvers/mutations';

export const mutations = {
  ...ebarimtMutations,
  ...erkhetMutations,
};
