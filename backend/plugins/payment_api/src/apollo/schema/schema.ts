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
  types as GolomtBankTypes,
  queries as GolomtBankQueries,
  mutations as GolomtBankMutations,
} from '@/corporateGateway/golomtbank/graphql/schema';
import {
  types as KhanbankTypes,
  queries as KhanbankQueries,
  mutations as KhanbankMutations,
} from '@/corporateGateway/khanbank/graphql/schema';
import {
  types as TdbTypes,
  queries as TdbQueries,
  mutations as TdbMutations,
} from '@/corporateGateway/tdb/graphql/schema';
export const types = `
  ${PaymentTypes}
  ${InvoiceTypes}
  ${InvoiceInputs}
  ${PaymentInputs}
  ${TransactionTypes}
  ${TransactionInputs}
  ${GolomtBankTypes}
  ${KhanbankTypes}
  ${TdbTypes}
`;

export const queries = `
  ${PaymentQueries}
  ${InvoiceQueries}
  ${TransactionQueries}
  ${GolomtBankQueries}
  ${KhanbankQueries}
  ${TdbQueries}
`;

export const mutations = `
  ${PaymentMutations}
  ${InvoiceMutations}
  ${TransactionMutations}
  ${GolomtBankMutations}
  ${KhanbankMutations}
  ${TdbMutations}
`;

export default { types, queries, mutations };
