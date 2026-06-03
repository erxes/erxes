import { categoryMutations } from './category';
import { configMutations } from './config';
import { packageMutations } from './package';
import { productMutations as productMainMutations } from './product';
import { productRuleMutations } from './rule';
import { uomMutations } from './uoms';

export const productMutations = {
  ...categoryMutations,
  ...configMutations,
  ...uomMutations,
  ...productMainMutations,
  ...productRuleMutations,
  ...packageMutations,
};
