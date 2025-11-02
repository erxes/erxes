import checkSyncedMutations from './checkSynced';
import inventoryMutations from './syncInventory';

export const erkhetMutations = {
  ...checkSyncedMutations,
  ...inventoryMutations,
};
