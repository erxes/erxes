import { branchsMutations } from './branches';
import { positionMutations } from './positions';
import { structuresMutations } from './structure';
import { deparmentMutations } from './deparments';
import { unitsMutations } from './units';
export const structureMutations = {
  ...branchsMutations,
  ...positionMutations,
  ...structuresMutations,
  ...deparmentMutations,
  ...unitsMutations,
};
