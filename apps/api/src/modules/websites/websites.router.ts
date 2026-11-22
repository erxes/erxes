import { db } from '@erxes/core-db';
import { audited, recordOf, scoped } from '~/orpc';
import {
  listCustomerAccounts,
  listWebsites,
  removeWebsite,
  saveWebsite,
  setAccountStatus,
  signOutAccount,
} from './websites.service';

export const websitesRouter = {
  list: scoped.websites.list.handler(() => listWebsites(db())),
  save: scoped.websites.save.handler(({ input }) =>
    audited(
      (tx) => saveWebsite(tx, input),
      (website) => ({
        ...recordOf('website', 'saved', website.id, website),
        metadata: { origins: website.origins },
      }),
    ),
  ),
  remove: scoped.websites.remove.handler(({ input }) =>
    audited(
      async (tx) => {
        await removeWebsite(tx, input.recordId);

        return { ok: true as const };
      },
      () => recordOf('website', 'deleted', input.recordId),
    ),
  ),
};

export const customerAccountsRouter = {
  list: scoped.customerAccounts.list.handler(({ input }) =>
    listCustomerAccounts(db(), input.customerId),
  ),
  setStatus: scoped.customerAccounts.setStatus.handler(({ input }) =>
    audited(
      (tx) => setAccountStatus(tx, input.id, input.status),
      (account) => ({
        ...recordOf(
          'customer_account',
          input.status === 'blocked' ? 'blocked' : 'unblocked',
          account.id,
          {
            label: account.websiteName,
          },
        ),
      }),
    ),
  ),
  signOut: scoped.customerAccounts.signOut.handler(({ input }) =>
    audited(
      async (tx) => {
        await signOutAccount(tx, input.id);

        return { ok: true as const };
      },
      () => recordOf('customer_account', 'signed_out', input.id),
    ),
  ),
};
