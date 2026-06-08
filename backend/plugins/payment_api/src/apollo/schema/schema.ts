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

import {
  types as GolomtConfigTypes,
  queries as GolomtConfigQueries,
  mutations as GolomtConfigMutations,
} from '@/corporateGateway/golomtbank/graphql/schema/configs';

import {
  types as GolomtAccountTypes,
  queries as GolomtAccountQueries,
} from '@/corporateGateway/golomtbank/graphql/schema/accounts';

import {
  types as GolomtTransferTypes,
  mutations as GolomtTransferMutations,
} from '@/corporateGateway/golomtbank/graphql/schema/transfer';

export const types = `
  ${PaymentTypes}
  ${InvoiceTypes}
  ${InvoiceInputs}
  ${PaymentInputs}
  ${TransactionTypes}
  ${TransactionInputs}

  ${GolomtConfigTypes}
  ${GolomtAccountTypes}
  ${GolomtTransferTypes}
`;

export const queries = `
  ${PaymentQueries}
  ${InvoiceQueries}
  ${TransactionQueries}
  ${GolomtConfigQueries}
  ${GolomtAccountQueries}
`;

export const mutations = `
  ${PaymentMutations}
  ${InvoiceMutations}
  ${TransactionMutations}
  ${GolomtConfigMutations}
  ${GolomtTransferMutations}
`;

export default { types, queries, mutations };
