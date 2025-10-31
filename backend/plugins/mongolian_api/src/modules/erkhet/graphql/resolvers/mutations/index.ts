import { checkSyncedMutations } from '@/erkhet/graphql/resolvers/mutations/checkSynced';
import { inventoryMutations } from '@/erkhet/graphql/resolvers/mutations/syncInventory';

export const mutations = {
    ...checkSyncedMutations,
    ...inventoryMutations
};