import { ebarimtMutations } from '@/ebarimt/graphql/resolvers/mutations/ebarimt';
import { productGroupMutations } from '@/ebarimt/graphql/resolvers/mutations/productGroups';
import { productRuleMutations } from '@/ebarimt/graphql/resolvers/mutations/productRules';

export const mutations = {
  ...productGroupMutations,
  ...ebarimtMutations,
  ...productRuleMutations,
};
