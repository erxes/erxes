import invoicesQueries from './invoices';
import paymentsQueries from './payments';
import transactionsQueries from './transactions';
import paymentPublicQueries from './paymentPublic';

export default {
  ...invoicesQueries,
  ...paymentsQueries,
  ...transactionsQueries,
  ...paymentPublicQueries
};
