import { fieldMutations } from './field';
import { groupMutations } from './group';
import { systemFieldMutations } from './systemField';

export const propertiesMutations = {
  ...fieldMutations,
  ...groupMutations,
  ...systemFieldMutations,
};
