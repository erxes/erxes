import {
  mutations as PaymentMutations,
  queries as PaymentQueries,
  types as PaymentTypes,
  inputs as PaymentInputs,
} from '@/payment/graphql/schemas/payment';

import {
  mutations as InvoiceMutations,  
  queries as InvoiceQueries,
  types as InvoiceTypes,
  inputs as InvoiceInputs,
} from '@/payment/graphql/schemas/invoices';

import {
  types as TransactionTypes,
  inputs as TransactionInputs,
  queries as TransactionQueries,
  mutations as TransactionMutations,
} from '@/payment/graphql/schemas/transactions';

export const types = `
  ${PaymentTypes}
  ${InvoiceTypes}
  ${InvoiceInputs}
  ${PaymentInputs}
  ${TransactionTypes}
  ${TransactionInputs}
`;

export const queries = `
  ${PaymentQueries}
  ${InvoiceQueries}
  ${TransactionQueries}
`;

export const mutations = `
  ${PaymentMutations}
  ${InvoiceMutations}
  ${TransactionMutations}
`;

export default { types, queries, mutations };
