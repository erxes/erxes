import riskMutations from './risks';
import productMutations from './products';
import packageMutations from './packages';
import categoryMutations from './categories';
import itemMutations from './items';

export default {
  ...riskMutations,
  ...productMutations,
  ...packageMutations,
  ...categoryMutations,
  ...itemMutations
};
