import paymentMutations from '@/payment/graphql/resolvers/mutations/payments';
import invoiceMutations from '@/payment/graphql/resolvers/mutations/invoices';
import transactionMutations from '@/payment/graphql/resolvers/mutations/transactions';

export const mutations = {
  ...paymentMutations,
  ...invoiceMutations,
  ...transactionMutations,
};
