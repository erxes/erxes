import { categoryMutations } from './category';
import { configMutations } from './config';
import { productMutations as productMainMutations } from './product';
import { uomMutations } from './uoms';

export const productMutations = {
  ...categoryMutations,
  ...configMutations,
  ...uomMutations,
  ...productMainMutations,
};
