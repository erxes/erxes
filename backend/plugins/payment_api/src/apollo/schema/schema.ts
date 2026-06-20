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

import {
  types as KhanbankConfigTypes,
  queries as KhanbankConfigQueries,
  mutations as KhanbankConfigMutations,
} from '@/corporateGateway/khanbank/graphql/schema/configs';

import {
  types as KhanbankAccountTypes,
  queries as KhanbankAccountQueries,
} from '@/corporateGateway/khanbank/graphql/schema/accounts';

import {
  types as KhanbankTransferTypes,
  mutations as KhanbankTransferMutations,
} from '@/corporateGateway/khanbank/graphql/schema/transfer';

import {
  types as TdbConfigTypes,
  mutations as TdbConfigMutations,
  queries as TdbConfigQueries,
} from '@/corporateGateway/tdb/graphql/schema/configs';

import {
  types as TdbOrderTypes,
  mutations as TdbOrderMutations,
  queries as TdbOrderQueries,
} from '@/corporateGateway/tdb/graphql/schema/orders';

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
  ${KhanbankConfigTypes}
  ${KhanbankAccountTypes}
  ${KhanbankTransferTypes}
  ${TdbConfigTypes}
  ${TdbOrderTypes}
`;

export const queries = `
  ${PaymentQueries}
  ${InvoiceQueries}
  ${TransactionQueries}
  ${GolomtConfigQueries}
  ${GolomtAccountQueries}
  ${KhanbankConfigQueries}
  ${KhanbankAccountQueries}
  ${TdbConfigQueries}
  ${TdbOrderQueries}
`;

export const mutations = `
  ${PaymentMutations}
  ${InvoiceMutations}
  ${TransactionMutations}
  ${GolomtConfigMutations}
  ${GolomtTransferMutations}
  ${KhanbankConfigMutations}
  ${KhanbankTransferMutations}
  ${TdbConfigMutations}
  ${TdbOrderMutations}
`;

export default { types, queries, mutations };