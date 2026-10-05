import configMutations from './configs';
import transferMutations from './transfers';
import orderMutations from './orders';

export default {
  ...configMutations,
  ...transferMutations,
  ...orderMutations,
};