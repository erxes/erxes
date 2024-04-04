import paymentsMutations from './payments';
import paymentConfigMutations from './paymentConfigs';
import invoiceMutations from './invoices';

export default {
  ...paymentsMutations,
  ...paymentConfigMutations,
  ...invoiceMutations
};
