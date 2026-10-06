import { categoryMutations } from './category';
import { configMutations } from './config';
import { packageMutations } from './package';
import { productMutations as productMainMutations } from './product';
import { productRuleMutations } from './rule';
import { productConditionGroupMutations } from './conditionGroup';
import { productSimilarityMutations } from './similarity';
import { uomMutations } from './uoms';

export const productMutations = {
  ...categoryMutations,
  ...configMutations,
  ...uomMutations,
  ...productMainMutations,
  ...productRuleMutations,
  ...productConditionGroupMutations,
  ...productSimilarityMutations,
  ...packageMutations,
};
