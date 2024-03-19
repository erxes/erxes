import invoicesQueries from './invoices';
import paymentsQueries from './payments';
import paymentConfigQueries from './paymentConfigs';
import transactionsQueries from './transactions';

export default {
  ...invoicesQueries,
  ...paymentsQueries,
  ...paymentConfigQueries,
  ...transactionsQueries
};
