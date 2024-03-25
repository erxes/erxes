import invoicesQueries from './invoices';
import paymentsQueries from './payments';
import paymentConfigQueries from './paymentConfigs';
import transactionsQueries from './transactions';
import paymentPublicQueries from './paymentPublic';

export default {
  ...invoicesQueries,
  ...paymentsQueries,
  ...paymentConfigQueries,
  ...transactionsQueries,
  ...paymentPublicQueries
};
