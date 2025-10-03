import paymentsMutations from './payments'; 
import invoiceMutations from './invoices';
import transactionsMutations from './transactions';

export default {
  ...paymentsMutations,
  ...invoiceMutations,
  ...transactionsMutations,
};
