import invoicesQueries from './invoices';
import paymentsQueries from './payments';
import paymentConfigQueries from './paymentConfigs';

export default {
  ...invoicesQueries,
  ...paymentsQueries,
  ...paymentConfigQueries
};
