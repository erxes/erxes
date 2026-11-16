import { gql } from '~/gql';

// Deals and POS orders belong to customers, so only customer wallets.
export const SALES_LOYALTY_PAYMENT_WALLETS = gql(`
  query SalesLoyaltyPaymentWallets {
    loyaltyAccountTypes(status: "active", ownerType: "customer") {
      _id
      name
    }
  }
`);
