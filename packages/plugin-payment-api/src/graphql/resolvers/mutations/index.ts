import paymentsMutations from './payments';
import paymentConfigMutations from './paymentConfigs';
import invoiceMutations from './invoices';
import transactionsMutations from './transactions';

export default {
  ...paymentsMutations,
  ...paymentConfigMutations,
  ...invoiceMutations,
  ...transactionsMutations,
};
