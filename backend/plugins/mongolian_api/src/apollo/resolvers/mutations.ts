import { ebarimtMutations } from '@/ebarimt/graphql/resolvers/mutations';
import { erkhetMutations } from '@/erkhet/graphql/resolvers/mutations';
import { mnConfigMutations } from '@/configs/graphql/resolvers/mutations';
import { msdynamicCheckMutations } from '@/msdynamic/graphql/resolvers/mutations/checkDynamic';
import { msdynamicSyncMutations } from '@/msdynamic/graphql/resolvers/mutations/syncDynamic';

export const mutations = {
  ...mnConfigMutations,
  ...ebarimtMutations,
  ...erkhetMutations,
  ...msdynamicCheckMutations,
  ...msdynamicSyncMutations,
};
