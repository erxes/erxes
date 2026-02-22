import paymentMutations from '@/payment/graphql/resolvers/mutations/payments';
import invoiceMutations from '@/payment/graphql/resolvers/mutations/invoices';
import transactionMutations from '@/payment/graphql/resolvers/mutations/transactions';
import golomtBankMutations from '@/corporateGateway/golomtbank/graphql/resolvers/mutations';

export const mutations = {
  ...paymentMutations,
  ...invoiceMutations,
  ...transactionMutations,
  ...golomtBankMutations,
};
