import { productGroupMutations } from './productGroups';

import { ebarimtMutations as putResponseMutations } from './ebarimt';
import { productRuleMutations } from './productRules';

export const ebarimtMutations = {
  ...putResponseMutations,
  ...productGroupMutations,
  ...productRuleMutations,
};
