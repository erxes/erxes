import { ebarimtMutations } from '@/ebarimt/graphql/resolvers/mutations';
import { erkhetMutations } from '@/erkhet/graphql/resolvers/mutations';
import { mnConfigMutations } from '@/configs/graphql/resolvers/mutations';

export const mutations = {
  ...mnConfigMutations,
  ...ebarimtMutations,
  ...erkhetMutations,
};
