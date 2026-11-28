import { db } from '@erxes/core-db';
import {
  findTaxInvoices,
  findTaxpayer,
  getAccount,
  getStatement,
  listAccounts,
  listBankConnections,
} from '~/modules/banks/banks.service';
import { listTransfers, sendTransfer } from '~/modules/banks/transfers.service';
import { scoped, unscoped } from '~/orpc';

/** Calls to a bank run unscoped: the service opens short scopes around them. */
export const banksRouter = {
  connections: scoped.banks.connections.handler(() => listBankConnections(db())),
  accounts: unscoped.banks.accounts.handler(({ input }) => listAccounts(input.id)),
  account: unscoped.banks.account.handler(({ input }) => getAccount(input.id, input.account)),
  statement: unscoped.banks.statement.handler(({ input }) => getStatement(input)),
  transfer: unscoped.banks.transfer.handler(({ input }) => sendTransfer(input)),
  transfers: scoped.banks.transfers.handler(({ input }) => listTransfers(db(), input)),
  taxpayer: unscoped.banks.taxpayer.handler(({ input }) =>
    findTaxpayer(input.id, input.registrationNumber),
  ),
  taxInvoices: unscoped.banks.taxInvoices.handler(({ input }) =>
    findTaxInvoices(input.id, input.by, input.value),
  ),
};
