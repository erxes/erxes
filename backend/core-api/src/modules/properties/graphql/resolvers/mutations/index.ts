import { fieldMutations } from './field';
import { groupMutations } from './group';

export const propertiesMutations = {
  ...fieldMutations,
  ...groupMutations,
};
