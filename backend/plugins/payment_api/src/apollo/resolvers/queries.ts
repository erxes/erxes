import paymentQueries from '@/payment/graphql/resolvers/queries/payments';
import invoiceQueries from '@/payment/graphql/resolvers/queries/invoices';
import transactionQueries from '@/payment/graphql/resolvers/queries/transactions';
import publicPaymentQueries from '@/payment/graphql/resolvers/queries/paymentPublic';
import golomtBankQueries from '@/corporateGateway/golomtbank/graphql/resolvers/queries';

export const queries = {
  ...paymentQueries,
  ...invoiceQueries,
  ...transactionQueries,
  ...publicPaymentQueries,
  ...golomtBankQueries,
};
