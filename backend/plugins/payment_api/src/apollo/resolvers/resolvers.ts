import Invoice from '@/payment/graphql/resolvers/customResolvers/invoice';
import Transaction from '@/payment/graphql/resolvers/customResolvers/transaction';
import { GolomtBankAccount } from '~/modules/corporateGateway/golomtbank/graphql/resolvers/accounts';

export const customResolvers = {
  Invoice,
  Transaction,
  GolomtBankAccount,
};
